// Reconstructed application source. Third-party implementations are npm imports.
import {
  initializePrivateField,
  writePrivateField,
  readPrivateField,
  readPrivateMethod,
} from '../core/private-fields.js';
import { environment } from '../core/environment.ts';
import { AudioListener, PositionalAudio, Audio } from 'three';
import { events } from '../core/events.ts';
import { runtime } from '../rendering/runtime.ts';
import { frameClock } from '../core/frame-clock.ts';
import { asyncTasks } from '../core/async.ts';
import { audioBufferLoader } from '../loaders/audio.ts';
var Kr;
var sn;
var xo;
var en;
var er;
var js;
var bn;
var lA;
var Iu;
var hc;
var uc;
var Bu;
var Mn;
var nr;
var Pu;
var cA;
var Du;
var hA;
var Ru;
var uA;
var Uu;
var dA;
var Lu;
var fA;
class AudioController {
  constructor({ camera: e = null, volume: t = 1, muted: s = true } = {}) {
    initializePrivateField(this, uc);
    initializePrivateField(this, Mn);
    initializePrivateField(this, Pu);
    initializePrivateField(this, Du);
    initializePrivateField(this, Ru);
    initializePrivateField(this, Uu);
    initializePrivateField(this, Lu);
    initializePrivateField(this, Kr, null);
    initializePrivateField(this, sn, 1);
    initializePrivateField(this, xo, 0);
    initializePrivateField(this, en, true);
    initializePrivateField(this, er, environment.visible);
    initializePrivateField(this, js, new AudioListener());
    initializePrivateField(this, bn, new Map());
    initializePrivateField(this, lA, 0.1);
    initializePrivateField(this, Iu, 0);
    initializePrivateField(this, hc, false);
    writePrivateField(this, Kr, e);
    if (readPrivateField(this, Kr)) readPrivateField(this, Kr).add(readPrivateField(this, js));
    writePrivateField(this, sn, t);
    writePrivateField(this, en, s);
    readPrivateField(this, js).setMasterVolume(readPrivateField(this, xo));
    events.on('visibility_change', readPrivateMethod(this, Pu, cA), this);
    events.on('webgl_audio_mute_toggle', readPrivateMethod(this, Du, hA), this);
    events.on('webgl_audio_global_volume', readPrivateMethod(this, Ru, uA), this);
    events.on('webgl_prerender', readPrivateMethod(this, Uu, dA), this);
    runtime.audio.contextReady
      .then(() => {
        if (readPrivateField(this, en)) events.emit('webgl_audio_mute_toggle');
        readPrivateMethod(this, Mn, nr).call(this, readPrivateField(this, sn));
      })
      .catch(() => {
        console.warn('audio failed to set volume');
      });
  }
  get muted() {
    return readPrivateField(this, en);
  }
  addAudio({
    name: e = 'default',
    url: t,
    volume: s = 1,
    autoPlay: n = false,
    loop: r = false,
    playbackRate: a = 1,
    offset: o = 0,
    sync: l = false,
    syncOffset: c = 0,
    minTimeBetweenPlays: h = 0,
  } = {}) {
    return readPrivateMethod(this, Lu, fA).call(this, {
      name: e,
      url: t,
      volume: s,
      autoPlay: n,
      loop: r,
      playbackRate: a,
      offset: o,
      sync: l,
      syncOffset: c,
      minTimeBetweenPlays: h,
    });
  }
  addPositionalAudio({
    name: e = 'default',
    url: t,
    volume: s = 1,
    autoPlay: n = true,
    loop: r = true,
    playbackRate: a = 1,
    offset: o = 0,
    sync: l = false,
    syncOffset: c = 0,
    minTimeBetweenPlays: h = 0,
    refDistance: d = 1,
    rolloffFactor: u = 1,
    distanceModel: f = 'inverse',
    maxDistance: p = 1e4,
    directionalCone: A = [360, 0, 0],
  } = {}) {
    return readPrivateMethod(this, Lu, fA).call(this, {
      name: e,
      url: t,
      volume: s,
      autoPlay: n,
      loop: r,
      playbackRate: a,
      offset: o,
      sync: l,
      syncOffset: c,
      minTimeBetweenPlays: h,
      positional: {
        refDistance: d,
        rolloffFactor: u,
        distanceModel: f,
        maxDistance: p,
        directionalCone: A,
      },
    });
  }
  playAudio(e = 'default', t = 0) {
    const s = readPrivateField(this, bn).get(e);
    if (!(!s || !readPrivateMethod(this, uc, Bu).call(this)))
      if (frameClock.time - s._timeLastPlayed > s._minTimeBetweenPlays) {
        s._timeLastPlayed = frameClock.time;
        s.stop().play(t);
      }
  }
  setAudioVolume(e = 'default', t = 1) {
    const s = readPrivateField(this, bn).get(e);
    if (s) {
      s.individualVolume = t;
      s.setVolume(s.individualVolume);
    }
  }
  async dispose({ delay: e = 0, duration: t = 0.35 } = {}) {
    events.off('webgl_audio_global_volume', readPrivateMethod(this, Ru, uA), this);
    if (e > 0) await asyncTasks.wait(e);
    writePrivateField(this, sn, 0);
    readPrivateMethod(this, Mn, nr).call(this, readPrivateField(this, sn));
    if (t > 0) await asyncTasks.wait(t);
    events.off('visibility_change', readPrivateMethod(this, Pu, cA), this);
    events.off('webgl_audio_mute_toggle', readPrivateMethod(this, Du, hA), this);
    events.off('webgl_prerender', readPrivateMethod(this, Uu, dA), this);
    if (readPrivateField(this, js)) {
      if (readPrivateField(this, Kr)) readPrivateField(this, Kr).remove(readPrivateField(this, js));
      readPrivateField(this, js).gain.disconnect(runtime.audio.context.destination);
    }
    writePrivateField(this, js, null);
    readPrivateField(this, bn).clear();
    writePrivateField(this, hc, true);
  }
}
{
  Kr = new WeakMap();
  sn = new WeakMap();
  xo = new WeakMap();
  en = new WeakMap();
  er = new WeakMap();
  js = new WeakMap();
  bn = new WeakMap();
  lA = new WeakMap();
  Iu = new WeakMap();
  hc = new WeakMap();
  uc = new WeakSet();
  Bu = function () {
    return runtime.audio.context.state === 'running';
  };
  Mn = new WeakSet();
  nr = function (i = 1) {
    let e = i;
    if (!readPrivateField(this, er) || readPrivateField(this, en)) e = 0;
    if (e !== readPrivateField(this, xo)) {
      writePrivateField(this, xo, e);
      readPrivateField(this, js).gain.gain.setTargetAtTime(
        readPrivateField(this, xo),
        Math.max(0.1, runtime.audio.context.currentTime),
        0.35,
      );
    }
  };
  Pu = new WeakSet();
  cA = function (i) {
    if (i) {
      if (!readPrivateField(this, er)) {
        writePrivateField(this, er, true);
        readPrivateMethod(this, Mn, nr).call(this, readPrivateField(this, sn));
      }
    } else if (readPrivateField(this, er)) {
      writePrivateField(this, er, false);
      readPrivateMethod(this, Mn, nr).call(this, 0);
    }
  };
  Du = new WeakSet();
  hA = function () {
    writePrivateField(this, en, !readPrivateField(this, en));
    if (readPrivateField(this, en)) readPrivateMethod(this, Mn, nr).call(this, 0);
    else readPrivateMethod(this, Mn, nr).call(this, readPrivateField(this, sn));
    events.emit('webgl_audio_update_mute', readPrivateField(this, en));
  };
  Ru = new WeakSet();
  uA = function (i = 1) {
    writePrivateField(this, sn, i);
    readPrivateMethod(this, Mn, nr).call(this, readPrivateField(this, sn));
  };
  Uu = new WeakSet();
  dA = function () {
    if (!readPrivateField(this, er) || !readPrivateMethod(this, uc, Bu).call(this)) return;
    const i = frameClock.time - runtime.audio.context.currentTime,
      e = Math.abs(i - readPrivateField(this, Iu)) > readPrivateField(this, lA);
    readPrivateField(this, bn).forEach((t) => {
      if (t && e && t._animationSync) {
        t.pause();
        t._progress =
          ((frameClock.time + t._animationSyncOffset) * t.playbackRate) %
          (t.duration || t.buffer.duration);
        t.play();
      }
    });
    if (e) writePrivateField(this, Iu, i);
  };
  Lu = new WeakSet();
  fA = async function ({
    name: i,
    url: e,
    volume: t,
    autoPlay: s,
    loop: n,
    playbackRate: r,
    offset: a,
    sync: o,
    syncOffset: l,
    minTimeBetweenPlays: c,
    positional: h = null,
  } = {}) {
    if (readPrivateField(this, bn).has(i)) throw new Error(`audio ${i} already exists`);
    readPrivateField(this, bn).set(i, null);
    try {
      const d = await audioBufferLoader.load(e);
      if (!d || readPrivateField(this, hc)) return;
      const u = new (h ? PositionalAudio : Audio)(readPrivateField(this, js));
      u.setBuffer(d);
      u.setLoop(n);
      u.setPlaybackRate(r);
      u.offset = a;
      u._animationSync = o;
      u._animationSyncOffset = l;
      u._minTimeBetweenPlays = c;
      u._timeLastPlayed = 0;
      if (h) {
        u.setRefDistance(h.refDistance);
        u.setRolloffFactor(h.rolloffFactor);
        u.setDistanceModel(h.distanceModel);
        u.setMaxDistance(h.maxDistance);
        u.setDirectionalCone(...h.directionalCone);
      }
      u.individualVolume = t;
      u.setVolume(u.individualVolume);
      if (s)
        runtime.audio.contextReady
          .then(() => {
            if (readPrivateMethod(this, uc, Bu).call(this) && !readPrivateField(this, hc)) u.play();
          })
          .catch(() => {
            console.warn(`audio ${i} failed to play`);
          });
      readPrivateField(this, bn).set(i, u);
      return u;
    } catch (d) {
      console.log(d);
    }
  };
}
export {
  Kr,
  sn,
  xo,
  en,
  er,
  js,
  bn,
  lA,
  Iu,
  hc,
  uc,
  Bu,
  Mn,
  nr,
  Pu,
  cA,
  Du,
  hA,
  Ru,
  uA,
  Uu,
  dA,
  Lu,
  fA,
  AudioController,
};
