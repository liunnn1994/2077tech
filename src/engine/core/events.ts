import EventEmitter from 'eventemitter3';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { CustomBounce } from 'gsap/CustomBounce';
import type { EngineEvents } from './event-types';

/** Shared event contract; frames carry seconds and milliseconds explicitly. */
export const events = new EventEmitter<EngineEvents, unknown>();

// Register before frame-clock takes its parseEase() map. All four paths and the
// default timeline options are preserved from the observed scene choreography.
gsap.registerPlugin(CustomEase, CustomWiggle, CustomBounce);
gsap.config({ force3D: true });
gsap.defaults({ ease: 'power2.inOut', duration: 0.6, overwrite: 'auto' });

const customEases: Readonly<Record<string, string>> = {
  inOut1: 'M0,0 C0.5,0 0.1,1 1,1',
  inOut2: 'M0,0 C0.56,0 0,1 1,1',
  inOut3: 'M0,0 C0.6,0 0,1 1,1',
  inOut4: 'M0,0 C0.4,0 -0.06,1 1,1',
};
for (const [name, path] of Object.entries(customEases)) {
  CustomEase.create(name, path, { precision: 2 });
}
