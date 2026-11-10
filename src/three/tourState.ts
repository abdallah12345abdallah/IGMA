/**
 * Shared between the scroll logic (DOM) and the 3D loop.
 * `pos` is 0 for the overview and 1..6 for each system, with fractions in between.
 */
/** How long the lamp takes to drop in before it switches on. */
export const LAMP_DROP_MS = 1000

export const tour = {
  pos: 0,
  /** Share of the 3D files downloaded, 0..1 */
  progress: 0,
  /** Set by the page so a click on a pedestal in the overview can jump to that system. */
  /** When the opening (lamp drops in and switches on) started, in performance.now() ms. null = not yet */
  introAt: null as null | number,
  /** Which system the opening view shows; follows the rotating word in the headline. */
  heroIdx: 0,
  onPick: null as null | ((index: number) => void),
}
