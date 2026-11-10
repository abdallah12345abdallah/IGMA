/**
 * Shared between the scroll logic (DOM) and the 3D loop.
 * `pos` is 0 for the overview and 1..6 for each system, with fractions in between.
 */
export const tour = {
  pos: 0,
  /** Share of the 3D files downloaded, 0..1 */
  progress: 0,
  /** Set by the page so a click on a pedestal in the overview can jump to that system. */
  onPick: null as null | ((index: number) => void),
}
