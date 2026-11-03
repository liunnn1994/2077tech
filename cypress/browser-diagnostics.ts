interface TargetInfo {
  targetId: string;
  type: string;
  url: string;
}
interface ProtocolEvent {
  id?: number;
  sessionId?: string;
  method?: string;
  result?: Record<string, unknown>;
  error?: { message: string };
  params?: Record<string, unknown>;
}
export interface BrowserIssue {
  kind: string;
  target: string;
  targetType: string;
  text: string;
}

/** Observes Chrome itself, including native workers; no page/Worker API is replaced. */
export class BrowserDiagnostics {
  #socket?: WebSocket;
  #next = 0;
  #pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();
  #targets = new Map<string, TargetInfo>();
  #attaching = new Set<Promise<void>>();
  #issues: BrowserIssue[] = [];
  #warnings: BrowserIssue[] = [];
  #seen = new Set<string>();
  #infrastructure: string[] = [];
  #requests = new Set<string>();
  #requestUrls = new Map<string, string>();
  #failures = new Set<string>();

  network() {
    return { requests: [...this.#requests], failures: [...this.#failures] };
  }

  async start(port: number): Promise<null> {
    this.stop();
    const info = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()) as {
      webSocketDebuggerUrl: string;
    };
    const socket = (this.#socket = new WebSocket(info.webSocketDebuggerUrl));
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true });
      socket.addEventListener(
        'error',
        () => reject(new Error('Cannot connect to Chrome diagnostics')),
        { once: true },
      );
    });
    socket.addEventListener('message', (event) =>
      this.#message(JSON.parse(String(event.data)) as ProtocolEvent),
    );
    await this.#send('Target.setAutoAttach', {
      autoAttach: true,
      waitForDebuggerOnStart: false,
      flatten: true,
      filter: [{ type: 'page' }, { type: 'iframe' }, { type: 'worker' }, { exclude: true }],
    });
    await this.#settle();
    this.#issues = [];
    this.#warnings = [];
    this.#infrastructure = [];
    return null;
  }
  async report() {
    await this.#settle();
    const report = {
      errors: this.#issues,
      warnings: this.#warnings,
      infrastructure: this.#infrastructure,
      targets: [...this.#seen],
    };
    this.stop();
    return report;
  }
  stop(): void {
    this.#socket?.close();
    this.#socket = undefined;
    for (const pending of this.#pending.values())
      pending.reject(new Error('Chrome diagnostics closed'));
    this.#pending.clear();
    this.#targets.clear();
    this.#seen.clear();
    this.#requests.clear();
    this.#requestUrls.clear();
    this.#failures.clear();
  }
  async #settle() {
    while (this.#attaching.size) await Promise.all(this.#attaching);
  }
  #send(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++this.#next;
      const timeout = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error('Chrome protocol timed out: ' + method));
      }, 5000);
      this.#pending.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
      this.#socket!.send(
        JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }),
      );
    });
  }
  #message(message: ProtocolEvent) {
    if (message.id) {
      const pending = this.#pending.get(message.id);
      this.#pending.delete(message.id);
      if (message.error) pending?.reject(new Error(message.error.message));
      else pending?.resolve(message.result);
      return;
    }
    const params = message.params ?? {};
    if (message.method === 'Target.attachedToTarget') {
      const session = params.sessionId as string;
      const target = params.targetInfo as unknown as TargetInfo;
      this.#targets.set(session, target);
      this.#seen.add(`${target.type}: ${target.url}`);
      const attaching = this.#enable(session);
      this.#attaching.add(attaching);
      void attaching.finally(() => this.#attaching.delete(attaching));
      return;
    }
    const target = this.#targets.get(message.sessionId ?? '');
    if (!target) return;
    const requestKey = `${message.sessionId}:${params.requestId}`;
    if (message.method === 'Network.requestWillBeSent') {
      const url = (params.request as { url: string }).url;
      if (/^https?:/.test(url)) {
        this.#requests.add(url);
        this.#requestUrls.set(requestKey, url);
      }
    }
    if (message.method === 'Network.responseReceived') {
      const response = params.response as { url: string; status: number };
      if (response.status >= 400) this.#failures.add(`${response.url}: ${response.status}`);
    }
    if (message.method === 'Network.loadingFailed' && !params.canceled) {
      const url = this.#requestUrls.get(requestKey);
      if (url) this.#failures.add(`${url}: ${params.errorText}`);
    }
    const record = (kind: string, text: string, warning = false) => {
      const issue = { kind, target: target.url, targetType: target.type, text };
      (warning ? this.#warnings : this.#issues).push(issue);
    };
    if (message.method === 'Runtime.consoleAPICalled') {
      const text = (params.args as { value?: unknown; description?: string }[])
        .map((arg) => arg.description ?? String(arg.value))
        .join(' ');
      if (params.type === 'error') record('console.error', text);
      if (params.type === 'warning') record('console.warn', text, true);
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const details = params.exceptionDetails as {
        text: string;
        exception?: { description?: string };
      };
      record('exception', details.exception?.description ?? details.text);
    }
    if (message.method === 'Log.entryAdded') {
      const entry = params.entry as { level: string; text: string; url?: string };
      if (
        entry.url &&
        new URL(entry.url, 'http://localhost').pathname === '/__cypress/assets/favicon.png'
      ) {
        this.#infrastructure.push(entry.url + ': ' + entry.text);
        return;
      }
      // Chrome background service requests are not application failures.
      if (
        /https?:\/\//.test(entry.url ?? '') &&
        !/https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(entry.url ?? '')
      )
        return;
      if (entry.level === 'error') record('browser', `${entry.url ?? ''}: ${entry.text}`);
      if (entry.level === 'warning') record('browser', entry.text, true);
    }
  }
  async #enable(session: string): Promise<void> {
    try {
      await this.#send('Runtime.enable', {}, session);
      await this.#send('Log.enable', {}, session).catch(() => undefined);
      await this.#send('Network.enable', {}, session);
      await this.#send(
        'Target.setAutoAttach',
        { autoAttach: true, waitForDebuggerOnStart: false, flatten: true },
        session,
      ).catch(() => undefined);
    } catch {
      /* A target can disappear during navigation. */
    }
  }
}
