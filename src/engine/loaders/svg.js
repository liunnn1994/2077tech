// Reconstructed application source. Third-party implementations are npm imports.
import { Texture } from 'three';
class SvgTextureLoader {
  constructor() {
    this.svgTextureCache = new Map();
    this.path = '';
  }
  loadAsync(e) {
    if (this.svgTextureCache.has(e)) return this.svgTextureCache.get(e);
    const t = new Promise((s, n) => {
      fetch(this.path + e)
        .then((r) => r.text())
        .then((r) => {
          const a = document.createElement('div');
          a.innerHTML = r;
          const o = a.querySelector('svg'),
            l = o.width.baseVal.value,
            c = o.height.baseVal.value,
            h = document.createElement('canvas'),
            d = h.getContext('2d'),
            u = document.createElement('img');
          u.onload = () => {
            h.width = l;
            h.height = c;
            d.drawImage(u, 0, 0);
            s(new Texture(h));
          };
          u.setAttribute('src', `data:image/svg+xml;base64,${window.btoa(r)}`);
        })
        .catch((_r) => n(new Error(`fetch for "${e}" responded with 404: Not Found.`)));
    });
    this.svgTextureCache.set(e, t);
    return t;
  }
  setPath(path) {
    this.path = path;
  }
  dispose() {
    this.svgTextureCache.forEach((e) =>
      e.then((t) => {
        var s;
        return (s = t.dispose) == null ? void 0 : s.call(t);
      }),
    );
    this.svgTextureCache.clear();
  }
}
export { SvgTextureLoader };
