/// <reference types="cypress" />
import { WorkerPool } from '../../src/engine/loaders/worker-pool.ts';

interface Request {
  id: number;
  mode?: 'crash' | 'hang';
  delay?: number;
}
interface Response {
  id: number;
  active: number;
}

// These are native browser Workers executing JavaScript in separate threads.
// No Worker, timer, message, or browser globals are stubbed.
const source = `let active = 0;
self.onmessage = ({data}) => {
  if (data.mode === 'crash') throw new Error('worker-test-crash');
  if (data.mode === 'hang') return;
  active++;
  const concurrent = active;
  setTimeout(() => { active--; self.postMessage({id: data.id, active: concurrent}); }, data.delay || 0);
};`;

describe('WorkerPool / native browser workers', () => {
  const pools: WorkerPool[] = [];
  const urls: string[] = [];
  const workers: Worker[] = [];
  function createPool(limit = 1, timeout = 5000) {
    const pool = new WorkerPool(limit, timeout);
    const url = URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
    urls.push(url);
    pools.push(pool);
    let created = 0;
    pool.setWorkerCreator(() => {
      created++;
      return new Worker(url);
    });
    return { pool, created: () => created };
  }
  afterEach(() => {
    for (const pool of pools.splice(0)) pool.dispose();
    for (const worker of workers.splice(0)) worker.terminate();
    for (const url of urls.splice(0)) URL.revokeObjectURL(url);
  });
  it('observes an error from the first worker instruction without pausing its startup', () => {
    cy.task('browser:start');
    cy.then(
      () =>
        new Promise<void>((resolve, reject) => {
          const url = URL.createObjectURL(
            new Blob(['console.error("worker-startup-probe"); self.postMessage("ready");'], {
              type: 'application/javascript',
            }),
          );
          urls.push(url);
          const worker = new Worker(url);
          workers.push(worker);
          worker.onmessage = () => resolve();
          worker.onerror = (error) => reject(new Error(error.message));
        }),
    );
    cy.task('browser:report').then((value) => {
      const report = value as { errors: { targetType: string; text: string }[] };
      expect(
        report.errors.some(
          (error) => error.targetType === 'worker' && error.text.includes('worker-startup-probe'),
        ),
      ).to.eq(true);
    });
  });
  it('dispatches queued work FIFO while reusing one native worker', () => {
    cy.then(async () => {
      const { pool, created } = createPool();
      const completed: number[] = [];
      const jobs = [80, 10, 0].map((delay, index) =>
        pool.postMessage<Response, Request>({ id: index + 1, delay }).then((event) => {
          expect(event.type).to.eq('message');
          expect(event.data.active).to.eq(1);
          completed.push(event.data.id);
        }),
      );
      await Promise.all(jobs);
      expect(completed).to.deep.eq([1, 2, 3]);
      expect(created()).to.eq(1);
    });
  });
  it('enforces the configured concurrency without overlapping requests on a worker', () => {
    cy.then(async () => {
      const { pool, created } = createPool(2);
      const results = await Promise.all(
        Array.from({ length: 8 }, (_, id) =>
          pool.postMessage<Response, Request>({ id, delay: 30 }),
        ),
      );
      expect(created()).to.eq(2);
      expect(results.map((event) => event.data.id)).to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7]);
      for (const event of results) expect(event.data.active).to.eq(1);
    });
  });
  it('rejects a thrown worker error and continues queued work on a replacement worker', () => {
    cy.then(async () => {
      const { pool, created } = createPool();
      const results = await Promise.allSettled([
        pool.postMessage<Response, Request>({ id: 1, mode: 'crash' }),
        pool.postMessage<Response, Request>({ id: 2 }),
      ]);
      const failed = results[0];
      const recovered = results[1];
      expect(failed?.status).to.eq('rejected');
      if (failed?.status === 'rejected') {
        const reason: unknown = failed.reason;
        expect(reason).to.be.instanceOf(Error);
        expect(reason instanceof Error ? reason.message : '').to.include('worker-test-crash');
      }
      expect(recovered?.status).to.eq('fulfilled');
      if (recovered?.status === 'fulfilled') expect(recovered.value.data.id).to.eq(2);
      expect(created()).to.eq(2);
    });
  });
  it('times out a silent worker and drains its queue on a replacement worker', () => {
    cy.then(async () => {
      const { pool, created } = createPool(1, 1000);
      const results = await Promise.allSettled([
        pool.postMessage<Response, Request>({ id: 1, mode: 'hang' }),
        pool.postMessage<Response, Request>({ id: 2 }),
      ]);
      const failed = results[0];
      const recovered = results[1];
      expect(failed?.status).to.eq('rejected');
      if (failed?.status === 'rejected') {
        const reason: unknown = failed.reason;
        expect(reason instanceof Error ? reason.message : '').to.include('timed out');
      }
      expect(recovered?.status).to.eq('fulfilled');
      if (recovered?.status === 'fulfilled') expect(recovered.value.data.id).to.eq(2);
      expect(created()).to.eq(2);
    });
  });
  it('rejects running and queued work on dispose and can be reused afterwards', () => {
    cy.then(async () => {
      const { pool, created } = createPool();
      const pending = Promise.allSettled([
        pool.postMessage<Response, Request>({ id: 1, mode: 'hang' }),
        pool.postMessage<Response, Request>({ id: 2 }),
      ]);
      expect(created()).to.eq(1);
      pool.dispose();
      const results = await pending;
      expect(results).to.have.length(2);
      for (const result of results) {
        expect(result.status).to.eq('rejected');
        if (result.status === 'rejected') {
          const reason: unknown = result.reason;
          expect(reason instanceof DOMException ? reason.name : '').to.eq('AbortError');
        }
      }
      const event = await pool.postMessage<Response, Request>({ id: 3 });
      expect(event.data.id).to.eq(3);
      expect(created()).to.eq(2);
    });
  });
});
