import { gsap } from 'gsap';
import { events } from './events';
import { frameClock } from './frame-clock';

type IdleTask = (deadline: IdleDeadline) => void;
const tasks: IdleTask[] = [];
let idleHandle: number | undefined;
const requestIdle = (callback: IdleRequestCallback): number =>
  window.requestIdleCallback
    ? window.requestIdleCallback(callback)
    : window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 5 }), 16);
function drain(deadline: IdleDeadline): void {
  idleHandle = tasks.length ? requestIdle(drain) : undefined;
  for (let index = tasks.length - 1; index >= 0 && deadline.timeRemaining() > 0; index--)
    tasks[index]?.(deadline);
}
export function addIdleTask(task: IdleTask): void {
  tasks.push(task);
  idleHandle ??= requestIdle(drain);
}
export function removeIdleTask(task: IdleTask): void {
  const index = tasks.indexOf(task);
  if (index >= 0) tasks.splice(index, 1);
}
const updatedAt = new WeakMap<object, number>();
function wait(amount: number, frames?: boolean): Promise<void>;
function wait(target: object, property: string): Promise<void>;
function wait(value: number | object, mode: boolean | string = false): Promise<void> {
  if (typeof value === 'number' && mode !== true)
    return new Promise((resolve) => {
      gsap.delayedCall(value, resolve);
    });
  return new Promise((resolve) => {
    const initialFrame = frameClock.frame;
    const update = (): void => {
      const complete =
        typeof value === 'number'
          ? frameClock.frame - initialFrame >= value
          : typeof mode === 'string' && Reflect.get(value, mode) !== undefined;
      if (complete) {
        events.off('webgl_prerender', update);
        resolve();
      }
    };
    events.on('webgl_prerender', update);
  });
}
export const asyncTasks = {
  debounce(callback: () => void, delayMs: number): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(callback, delayMs);
    };
  },
  wait,
  nextFrame<T>(callback?: () => T): Promise<T | undefined> {
    return new Promise((resolve) => {
      gsap.delayedCall(0, () => resolve(callback?.()));
    });
  },
  nextIdle<T>(callback?: () => T): Promise<T | undefined> {
    return new Promise((resolve) => {
      const run = (): void => {
        removeIdleTask(run);
        resolve(callback?.());
      };
      addIdleTask(run);
    });
  },
  taskIdle(task: (done: () => void) => void, budgetMs = 2, timeoutSeconds = 10): Promise<void> {
    return new Promise((resolve) => {
      const started = Date.now();
      let done = false;
      const finish = (): void => {
        done = true;
        removeIdleTask(run);
        resolve();
      };
      const run = (deadline: IdleDeadline): void => {
        const slice = Date.now();
        while (!done && Date.now() - slice < budgetMs && deadline.timeRemaining() > 0) task(finish);
        if (!done && Date.now() - started > timeoutSeconds * 1000) finish();
      };
      addIdleTask(run);
    });
  },
  hasRunThisFrame(target: object): boolean {
    const previous = updatedAt.get(target);
    updatedAt.set(target, frameClock.time);
    return previous !== undefined && previous === frameClock.time;
  },
  async loadJson(url: string): Promise<unknown> {
    return (await fetch(url)).json();
  },
  async preload(urls: string[] = [], progress?: (fraction: number) => void): Promise<void> {
    const unique = [...new Set(urls)];
    let completed = 0;
    if (!unique.length) {
      progress?.(1);
      return;
    }
    await Promise.all(
      unique.map(async (url) => {
        try {
          await (await fetch(url)).blob();
        } finally {
          progress?.(++completed / unique.length);
        }
      }),
    );
  },
};
