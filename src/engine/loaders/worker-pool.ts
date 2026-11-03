/** FIFO worker scheduling. Each worker owns at most one pending request. */
export interface WorkerFailure {
  error: true;
  message: string;
}
interface Job {
  request: unknown;
  transfer: Transferable[];
  resolve: (event: MessageEvent<unknown>) => void;
  reject: (error: Error) => void;
}
interface WorkerSlot {
  worker: Worker;
  job?: Job;
  timer?: ReturnType<typeof setTimeout>;
  message: (event: MessageEvent<unknown>) => void;
  error: (event: ErrorEvent) => void;
  messageerror: () => void;
}
export class WorkerPool {
  #limit: number;
  #timeout: number;
  #creator?: () => Worker;
  #queue: Job[] = [];
  #slots: (WorkerSlot | undefined)[] = [];

  constructor(pool = 4, timeoutMilliseconds = 60_000) {
    this.#validateLimit(pool);
    if (!Number.isFinite(timeoutMilliseconds) || timeoutMilliseconds < 0) {
      throw new RangeError('Worker timeout must be a finite nonnegative number.');
    }
    this.#limit = pool;
    this.#timeout = timeoutMilliseconds;
  }
  setWorkerCreator(creator: () => Worker): void {
    this.#creator = creator;
  }
  setWorkerLimit(limit: number): void {
    this.#validateLimit(limit);
    this.#limit = limit;
    this.#slots.forEach((slot, index) => {
      if (slot && !slot.job && index >= limit) this.#retire(index, slot);
    });
    this.#drain();
  }
  postMessage<TResponse = unknown, TRequest = unknown>(
    request: TRequest,
    transfer: Transferable[] = [],
  ): Promise<MessageEvent<TResponse>> {
    return new Promise((resolve, reject) => {
      this.#queue.push({
        request,
        transfer,
        resolve: (event) => resolve(event as MessageEvent<TResponse>),
        reject,
      });
      this.#drain();
    });
  }
  dispose(): void {
    const error = new DOMException('Worker pool disposed.', 'AbortError');
    for (const job of this.#queue.splice(0)) job.reject(error);
    this.#slots.forEach((slot, index) => {
      if (!slot) return;
      slot.job?.reject(error);
      this.#retire(index, slot);
    });
    this.#slots = [];
  }
  #validateLimit(limit: number): void {
    if (!Number.isInteger(limit) || limit < 1)
      throw new RangeError('Worker limit must be a positive integer.');
  }
  #createSlot(index: number): WorkerSlot {
    if (!this.#creator) throw new Error('Set a worker creator before posting a request.');
    const worker = this.#creator();
    const slot: WorkerSlot = {
      worker,
      message: (event) => this.#complete(index, slot, event),
      error: (event) => {
        event.preventDefault();
        this.#fail(index, slot, new Error(event.message || 'Worker execution failed.'));
      },
      messageerror: () =>
        this.#fail(index, slot, new Error('Worker response could not be deserialized.')),
    };
    worker.addEventListener('message', slot.message);
    worker.addEventListener('error', slot.error);
    worker.addEventListener('messageerror', slot.messageerror);
    this.#slots[index] = slot;
    return slot;
  }
  #drain(): void {
    while (this.#queue.length) {
      const active = this.#slots.filter((slot) => slot?.job).length;
      if (active >= this.#limit) return;
      let index = 0;
      while (index < this.#limit && this.#slots[index]?.job) index++;
      if (index >= this.#limit) return;
      const job = this.#queue.shift();
      if (!job) return;
      let slot: WorkerSlot;
      try {
        slot = this.#slots[index] ?? this.#createSlot(index);
      } catch (error: unknown) {
        job.reject(error instanceof Error ? error : new Error(String(error)));
        continue;
      }
      slot.job = job;
      if (this.#timeout > 0) {
        slot.timer = setTimeout(
          () => this.#fail(index, slot, new Error('Worker request timed out.')),
          this.#timeout,
        );
      }
      try {
        slot.worker.postMessage(job.request, job.transfer);
      } catch (error: unknown) {
        clearTimeout(slot.timer);
        slot.job = undefined;
        job.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }
  #complete(index: number, slot: WorkerSlot, event: MessageEvent<unknown>): void {
    if (this.#slots[index] !== slot || !slot.job) return;
    clearTimeout(slot.timer);
    const job = slot.job;
    slot.job = undefined;
    job.resolve(event);
    if (index >= this.#limit) this.#retire(index, slot);
    this.#drain();
  }
  #fail(index: number, slot: WorkerSlot, error: Error): void {
    if (this.#slots[index] !== slot) return;
    slot.job?.reject(error);
    this.#retire(index, slot);
    this.#drain();
  }
  #retire(index: number, slot: WorkerSlot): void {
    clearTimeout(slot.timer);
    slot.worker.removeEventListener('message', slot.message);
    slot.worker.removeEventListener('error', slot.error);
    slot.worker.removeEventListener('messageerror', slot.messageerror);
    slot.worker.terminate();
    this.#slots[index] = undefined;
  }
}
