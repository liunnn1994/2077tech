import { gsap } from 'gsap';
import { events } from './events';
import type { FramePhase } from './event-types';

export interface FrameClock {
  /** GSAP ticker time in seconds. */
  readonly time: number;
  /** Quantized difference between consecutive ticker times, in milliseconds. */
  readonly delta: number;
  readonly frame: number;
  readonly averageFPS: number;
  readonly maxFPS: number;
  /** Time-step ratio relative to 60 Hz, capped at five nominal frames. */
  readonly ratio: number;
}

export const easingFunctions = gsap.parseEase();

const targetFramesPerSecond = 60;
const minimumRateFraction = 0.2;
const minimumFramesPerSecond = targetFramesPerSecond * minimumRateFraction;
const maximumDeltaRatio = targetFramesPerSecond / minimumFramesPerSecond;
const fpsSampleWindowSeconds = 0.5;
const minimumFpsSamples = 5;

let timeSeconds = 0;
let deltaMilliseconds = 16;
let frameIndex = 0;
let averageFramesPerSecond = 60;
let maximumFramesPerSecond = 0;
let previousSampleTimeSeconds = 0;
const frameDurations: number[] = [];
const framePhases: readonly FramePhase[] = ['webgl_prerender', 'webgl_render', 'webgl_postrender'];

export const frameClock: FrameClock = {
  get time() {
    return timeSeconds;
  },
  get delta() {
    return deltaMilliseconds;
  },
  get frame() {
    return frameIndex;
  },
  get averageFPS() {
    return averageFramesPerSecond;
  },
  get maxFPS() {
    return maximumFramesPerSecond;
  },
  get ratio() {
    return Math.min(maximumDeltaRatio, deltaMilliseconds / (1000 / targetFramesPerSecond));
  },
};

function tick(nextTimeSeconds: number): void {
  const elapsedMilliseconds = Math.round((nextTimeSeconds - timeSeconds) * 1000);
  frameDurations.push(elapsedMilliseconds);
  if (
    nextTimeSeconds - previousSampleTimeSeconds >= fpsSampleWindowSeconds &&
    frameDurations.length >= minimumFpsSamples
  ) {
    const totalMilliseconds = frameDurations.reduce((total, duration) => total + duration, 0);
    const averageMilliseconds = totalMilliseconds / frameDurations.length;
    const measuredFramesPerSecond = Math.round(1000 / averageMilliseconds);
    maximumFramesPerSecond = Math.max(maximumFramesPerSecond, measuredFramesPerSecond);
    averageFramesPerSecond = measuredFramesPerSecond;
    frameDurations.length = 0;
    previousSampleTimeSeconds = nextTimeSeconds;
    // Preserve ordering: FPS observers run before this frame's public clock is
    // advanced, followed by prerender, render and postrender in that order.
    events.emit('webgl_average_fps_update', averageFramesPerSecond);
  }
  timeSeconds = nextTimeSeconds;
  deltaMilliseconds = elapsedMilliseconds;
  frameIndex++;
  for (const phase of framePhases) events.emit(phase, nextTimeSeconds, elapsedMilliseconds);
}

gsap.ticker.add(tick);
import.meta.hot?.dispose(() => {
  gsap.ticker.remove(tick);
});
