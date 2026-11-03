// Reconstructed application source. Third-party implementations are npm imports.
var defineProperty = Object.defineProperty;
var setPublicProperty = (i, e, t) =>
  e in i
    ? defineProperty(i, e, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: t,
      })
    : (i[e] = t);
var definePublicField = (i, e, t) => (
  setPublicProperty(i, typeof e != 'symbol' ? e + '' : e, t),
  t
);
var assertPrivateAccess = (i, e, t) => {
  if (!e.has(i)) throw TypeError('Cannot ' + t);
};
var readPrivateField = (i, e, t) => (
  assertPrivateAccess(i, e, 'read from private field'),
  t ? t.call(i) : e.get(i)
);
var initializePrivateField = (i, e, t) => {
  if (e.has(i)) throw TypeError('Cannot add the same private member more than once');
  if (e instanceof WeakSet) e.add(i);
  else e.set(i, t);
};
var writePrivateField = (i, e, t, s) => (
  assertPrivateAccess(i, e, 'write to private field'),
  s ? s.call(i, t) : e.set(i, t),
  t
);
var privateUpdateAccessor = (i, e, t, s) => ({
  set _(n) {
    writePrivateField(i, e, n, t);
  },
  get _() {
    return readPrivateField(i, e, s);
  },
});
var readPrivateMethod = (i, e, t) => (assertPrivateAccess(i, e, 'access private method'), t);
export {
  defineProperty,
  setPublicProperty,
  definePublicField,
  assertPrivateAccess,
  readPrivateField,
  initializePrivateField,
  writePrivateField,
  privateUpdateAccessor,
  readPrivateMethod,
};
