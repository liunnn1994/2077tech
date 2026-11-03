// Reconstructed application source. Third-party implementations are npm imports.
import { AudioController } from './audio-controller.js';
import { siteConfig } from '../../config/site-config.js';
import { events } from '../core/events.ts';
class AudioDirector {
  constructor(mainController) {
    this.mainController = mainController;
    this._controller = new AudioController({
      volume: siteConfig.volume,
      muted: siteConfig.muted,
    });
    this.init();
  }
  init() {
    this._controller.addAudio({
      name: 'music-bg',
      url: 'music-highq.ogg',
      volume: 0.2,
      autoPlay: true,
      loop: true,
    });
    this._controller.addAudio({
      name: 'room-bg',
      url: 'room.ogg',
      volume: 0.45,
      autoPlay: true,
      loop: true,
    });
    this._controller.addAudio({
      name: 'wind',
      url: 'wind.ogg',
      volume: 0,
      autoPlay: true,
      loop: true,
    });
    this._controller.addAudio({
      name: 'structure',
      url: 'structure.ogg',
      volume: 0,
      autoPlay: true,
      loop: true,
    });
    this._controller.addAudio({
      name: 'beeps',
      url: 'beeps.ogg',
      volume: 0.5,
      minTimeBetweenPlays: 0.4,
    });
    this._controller.addAudio({
      name: 'beeps2',
      url: 'beeps2.ogg',
      volume: 0.5,
      minTimeBetweenPlays: 0.4,
    });
    this._controller.addAudio({
      name: 'beeps3',
      url: 'beeps3.ogg',
      volume: 0.5,
      minTimeBetweenPlays: 0.4,
    });
    this._controller.addAudio({
      name: 'click-project',
      url: 'click-project.ogg',
      volume: 0.5,
    });
    this._controller.addAudio({
      name: 'enter-project',
      url: 'enter-project.ogg',
      volume: 0.5,
    });
    this._controller.addAudio({
      name: 'leave-project',
      url: 'leave-project.ogg',
      volume: 0.5,
    });
    this._controller.addAudio({
      name: 'shard',
      url: 'shard.ogg',
      volume: 0,
      autoPlay: true,
      loop: true,
    });
    this._controller.addAudio({
      name: 'project-text',
      url: 'project-text.ogg',
      volume: 0.5,
    });
    this._controller.addAudio({
      name: 'portals',
      url: 'circles.ogg',
      volume: 0,
      autoPlay: true,
      loop: true,
    });
    this._controller.addAudio({
      name: 'particles',
      url: 'particles.ogg',
      volume: 0,
      autoPlay: true,
      loop: true,
    });
    this._controller.addAudio({
      name: 'logo',
      url: 'logo.ogg',
      volume: 0.3,
    });
    this._controller.addAudio({
      name: 'ui-long',
      url: 'ui-long.ogg',
      volume: 0.3,
    });
    this._controller.addAudio({
      name: 'ui-short',
      url: 'ui-short.ogg',
      volume: 0.3,
    });
    this._controller.addAudio({
      name: 'manifesto',
      url: 'manifesto.ogg',
      volume: 0.3,
    });
    events.on('webgl_set_audio_volume', this.setAudioVolume, this);
    events.on('webgl_play_audio', this.playAudio, this);
  }
  setAudioVolume(e, t = 1) {
    this._controller.setAudioVolume(e, t);
  }
  playAudio(e) {
    this._controller.playAudio(e);
  }
}
export { AudioDirector };
