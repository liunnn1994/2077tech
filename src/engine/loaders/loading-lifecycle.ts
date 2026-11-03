/** Navigation cancels in-flight browser/worker requests. Do not report those
 * cancellations as failures of the next document or resume dependent scenes. */
let leaving = false;
const onHide = (): void => {
  leaving = true;
};
const onShow = (): void => {
  leaving = false;
};
window.addEventListener('pagehide', onHide);
window.addEventListener('pageshow', onShow);
export const isDocumentLeaving = (): boolean => leaving;
import.meta.hot?.dispose(() => {
  window.removeEventListener('pagehide', onHide);
  window.removeEventListener('pageshow', onShow);
});
