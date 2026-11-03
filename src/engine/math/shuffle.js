// Reconstructed application source. Third-party implementations are npm imports.
function shuffleInPlace(i) {
  for (let e = i.length - 1; e > 0; e--) {
    const t = Math.floor(Math.random() * (e + 1));
    [i[e], i[t]] = [i[t], i[e]];
  }
}
export { shuffleInPlace };
