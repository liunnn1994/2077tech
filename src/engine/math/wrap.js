// Reconstructed application source. Third-party implementations are npm imports.
const fractionalPart = (i) => i - Math.floor(i);
const wrapSigned = (i, e) => fractionalPart((i + e) / (2 * e)) * 2 * e - e;
export { fractionalPart, wrapSigned };
