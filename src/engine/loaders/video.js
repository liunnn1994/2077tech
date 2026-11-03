// Reconstructed application source. Third-party implementations are npm imports.
import { VideoTexture } from 'three';
class AutoplayVideoTexture extends VideoTexture {
  constructor(e, _autoplay = false) {
    const s = document.createElement('video');
    super(s);
    s.loop = true;
    s.muted = true;
    s.preload = 'auto';
    s.crossOrigin = 'anonymous';
    s.playsInline = true;
    const n = document.createElement('source');
    n.src = e;
    n.type = `video/${e.split('.').pop().startsWith('mp4') ? 'mp4' : 'webm'}`;
    s.appendChild(n);
    s.load();
    this._autoplay = _autoplay;
    this._videoLoadAsync = new Promise((r, a) => {
      const o = () => {
          s.removeEventListener('canplaythrough', l);
          s.removeEventListener('error', c);
        },
        l = () => {
          o();
          r(this);
        },
        c = () => {
          o();
          a(new Error(`fetch for "${e}" responded with 404: Not Found.`));
        };
      s.addEventListener('canplaythrough', l);
      s.addEventListener('error', c);
      if (s.readyState > 3) l();
    });
  }
  update() {
    if (this._autoplay && this.image.paused) this.image.play().catch(() => {});
    super.update();
  }
  dispose() {
    this.image.pause();
    this.image.currentTime = 0;
    super.dispose();
  }
}
export { AutoplayVideoTexture };
