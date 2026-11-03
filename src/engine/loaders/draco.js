// Reconstructed application source. Third-party implementations are npm imports.
import {
  initializePrivateField,
  writePrivateField,
  readPrivateField,
  readPrivateMethod,
} from '../core/private-fields.js';
import { FileLoader, BufferGeometry, BufferAttribute } from 'three';
import { WorkerPool } from './worker-pool.ts';
function dracoWorkerMain() {
  let i = null;
  onmessage = function (o) {
    const l = o.data;
    if (l.init) {
      i = new Promise((c) => {
        DracoDecoderModule({
          onModuleLoaded: (h) => {
            c({
              draco: h,
            });
          },
          ...l.init,
        });
      });
      return;
    }
    i.then((c) => {
      const h = c.draco,
        d = new h.Decoder();
      try {
        const u = s(h, d, l.buffer),
          f = u.attributes.map((p) => p.array.buffer);
        if (u.index) f.push(u.index.array.buffer);
        self.postMessage(
          {
            geometry: u,
          },
          f,
        );
      } catch (u) {
        console.error(u);
        self.postMessage({
          error: true,
        });
      } finally {
        h.destroy(d);
      }
    });
  };
  const e = [
      'Int8Array',
      'Uint8Array',
      'Uint8ClampedArray',
      'Int16Array',
      'Uint16Array',
      'Int32Array',
      'Uint32Array',
      'Float32Array',
      'Float64Array',
    ],
    t = new TextDecoder();
  function s(o, l, c) {
    let h = null,
      d = null;
    const u = t.decode(new Uint8Array(c.slice(0, 5))) === 'DRACO';
    if (u) h = new Int8Array(c);
    else {
      const v = new Uint32Array(c.slice(0, 4))[0];
      d = JSON.parse(t.decode(c.slice(4, 4 + v)));
      h = new Int8Array(c.slice(4 + v));
    }
    let f = null,
      p = null;
    const A = l.GetEncodedGeometryType(h);
    if (A === o.TRIANGULAR_MESH) {
      f = new o.Mesh();
      p = l.DecodeArrayToMesh(h, h.byteLength, f);
    } else if (A === o.POINT_CLOUD) {
      f = new o.PointCloud();
      p = l.DecodeArrayToPointCloud(h, h.byteLength, f);
    } else throw new Error('THREE.DRACOLoader: Unexpected geometry type.');
    if (!p.ok() || f.ptr === 0)
      throw new Error(`THREE.DRACOLoader: Decoding failed: ${p.error_msg()}`);
    if (u) {
      const v = new o.MetadataQuerier(),
        y = l.GetMetadata(f);
      if (v.HasEntry(y, 'info')) d = JSON.parse(v.GetStringEntry(y, 'info'));
      o.destroy(v);
    }
    const m = {},
      g = {};
    d.attributes.forEach((v, y) => {
      const S = v[0];
      m[S] = y;
      g[S] = e[v[1]];
    });
    const x = {
      index: null,
      attributes: [],
      userData: {},
    };
    if (d.userData) x.userData = d.userData;
    for (const v in m) {
      const y = self[g[v]];
      let S = null,
        w = null;
      w = m[v];
      S = l.GetAttributeByUniqueId(f, w);
      const C = r(o, l, f, v, y, S);
      x.attributes.push(C);
    }
    if (A === o.TRIANGULAR_MESH) x.index = n(o, l, f);
    o.destroy(f);
    return x;
  }
  function n(o, l, c) {
    const h = c.num_faces() * 3,
      d = h * 4,
      u = o._malloc(d);
    l.GetTrianglesUInt32Array(c, d, u);
    const f = new Uint32Array(o.HEAPF32.buffer, u, h).slice();
    o._free(u);
    return {
      array: f,
      itemSize: 1,
    };
  }
  function r(o, l, c, h, d, u) {
    const f = u.num_components(),
      p = c.num_points() * f,
      A = p * d.BYTES_PER_ELEMENT,
      m = a(o, d),
      g = o._malloc(A);
    l.GetAttributeDataArrayForAllPoints(c, u, m, A, g);
    const x = new d(o.HEAPF32.buffer, g, p).slice();
    o._free(g);
    return {
      name: h,
      array: x,
      itemSize: f,
    };
  }
  function a(o, l) {
    switch (l) {
      case Float32Array:
        return o.DT_FLOAT32;
      case Int8Array:
        return o.DT_INT8;
      case Int16Array:
        return o.DT_INT16;
      case Int32Array:
        return o.DT_INT32;
      case Uint8Array:
        return o.DT_UINT8;
      case Uint16Array:
        return o.DT_UINT16;
      case Uint32Array:
        return o.DT_UINT32;
    }
  }
}
var Yr;
var yu;
var Ao;
var no;
var go;
var Ll;
var Sh;
var Um;
var kw;
var Lm;
var zw;
class MetadataDracoLoader {
  constructor() {
    initializePrivateField(this, Ll);
    initializePrivateField(this, Um);
    initializePrivateField(this, Lm);
    initializePrivateField(this, Yr, new Map());
    initializePrivateField(this, yu, new FileLoader().setResponseType('arraybuffer'));
    initializePrivateField(this, Ao, '');
    initializePrivateField(this, no, null);
    initializePrivateField(this, go, new WorkerPool());
  }
  setDecoderPath(e) {
    writePrivateField(this, Ao, e);
  }
  setPath(e) {
    readPrivateField(this, yu).setPath(e);
  }
  setWorkerLimit(e) {
    readPrivateField(this, go).setWorkerLimit(e);
    return this;
  }
  loadAsync(e) {
    if (readPrivateField(this, Yr).has(e)) return readPrivateField(this, Yr).get(e);
    const t = new Promise((s, n) => {
      Promise.all([
        readPrivateMethod(this, Um, kw).call(this),
        readPrivateField(this, yu).loadAsync(e),
      ])
        .then(([_r, a]) =>
          readPrivateField(this, go).postMessage(
            {
              buffer: a,
            },
            [a],
          ),
        )
        .then((r) => {
          if (r.data.error) n(new Error(`buffer "${e}" could not be decoded.`));
          else s(readPrivateMethod(this, Lm, zw).call(this, r.data.geometry));
        })
        .catch((r) => {
          n(new Error(r));
        });
    });
    readPrivateField(this, Yr).set(e, t);
    return t;
  }
  dispose() {
    readPrivateField(this, go).dispose();
    readPrivateField(this, Yr).forEach((e) => e.then((t) => t.dispose()));
    readPrivateField(this, Yr).clear();
  }
}
{
  Yr = new WeakMap();
  yu = new WeakMap();
  Ao = new WeakMap();
  no = new WeakMap();
  go = new WeakMap();
  Ll = new WeakSet();
  Sh = function (i, e) {
    const t = new FileLoader();
    t.setResponseType(e);
    return t.loadAsync(i);
  };
  Um = new WeakSet();
  kw = function () {
    if (readPrivateField(this, no)) return readPrivateField(this, no);
    const i = [],
      e = typeof WebAssembly != 'object';
    if (e)
      i.push(
        readPrivateMethod(this, Ll, Sh).call(
          this,
          `${readPrivateField(this, Ao)}draco_decoder.js`,
          'text',
        ),
      );
    else {
      i.push(
        readPrivateMethod(this, Ll, Sh).call(
          this,
          `${readPrivateField(this, Ao)}draco_wasm_wrapper.js`,
          'text',
        ),
      );
      i.push(
        readPrivateMethod(this, Ll, Sh).call(
          this,
          `${readPrivateField(this, Ao)}draco_decoder.wasm`,
          'arraybuffer',
        ),
      );
    }
    writePrivateField(
      this,
      no,
      Promise.all(i).then((t) => {
        const s = dracoWorkerMain.toString(),
          n = [
            '/* draco decoder */',
            t[0],
            '',
            '/* worker */',
            s.substring(s.indexOf('{') + 1, s.lastIndexOf('}')),
          ].join(`
`),
          r = URL.createObjectURL(new Blob([n])),
          a = e
            ? {}
            : {
                wasmBinary: t[1],
              };
        readPrivateField(this, go).setWorkerCreator(() => {
          const o = new Worker(r);
          o.postMessage({
            init: a,
          });
          return o;
        });
      }),
    );
    return readPrivateField(this, no);
  };
  Lm = new WeakSet();
  zw = function (i) {
    const e = new BufferGeometry();
    if (i.index) e.setIndex(new BufferAttribute(i.index.array, 1));
    for (let t = 0; t < i.attributes.length; t++) {
      const s = i.attributes[t],
        n = s.name,
        r = s.array,
        a = s.itemSize;
      e.setAttribute(n, new BufferAttribute(r, a));
    }
    if (i.userData) e.userData = i.userData;
    return e;
  };
}
export { dracoWorkerMain, Yr, yu, Ao, no, go, Ll, Sh, Um, kw, Lm, zw, MetadataDracoLoader };
