import { useId } from 'react'

/** Square-Kufic letters on a 5-unit grid: [x, y, w, h] per block, in grid units. */
const LETTERS: [number, number, number, number][][] = [
  // I
  [[0, 0, 1, 5]],
  // G
  [[0, 0, 4, 1], [0, 0, 1, 5], [0, 4, 4, 1], [3, 2, 1, 3], [2, 2, 1, 1]],
  // M
  [[0, 0, 5, 1], [0, 0, 1, 5], [2, 0, 1, 5], [4, 0, 1, 5]],
  // A
  [[0, 0, 4, 1], [0, 0, 1, 5], [3, 0, 1, 5], [0, 2, 4, 1]],
]
const WIDTHS = [1, 4, 5, 4]
const U = 5 // one grid unit
const SYMBOL_W = 32 // the links, scaled to the letters' height
const GAP = 8

/**
 * IGMA: two interlocking links (the brown one in the current text colour, the other in
 * --logo-accent) and the name set as square Kufic on one grid.
 */
export function Logo({ className, title = 'IGMA' }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, '')
  let x = SYMBOL_W + GAP
  const blocks: string[] = []
  LETTERS.forEach((letter, i) => {
    letter.forEach(([bx, by, w, h]) => blocks.push(`M${x + bx * U} ${by * U}h${w * U}v${h * U}h${-w * U}z`))
    x += (WIDTHS[i] + 1) * U
  })
  const width = x - U
  const ring = <rect x="7" y="31" width="50" height="50" rx="14" fill="none" stroke="currentColor" strokeWidth="13" />
  return (
    <svg className={className} viewBox={`0 0 ${width} 25`} role="img" aria-label={title}>
      {/* the links are drawn on a 100-unit box and scaled down to the 25-unit cap height */}
      <g transform="scale(0.325) translate(-0.5 -10.5)">
        <defs>
          <clipPath id={`over-${id}`}>
            <rect x="46" y="56" width="22" height="22" />
          </clipPath>
        </defs>
        {ring}
        <rect x="43" y="17" width="50" height="50" rx="14" fill="none" stroke="var(--logo-accent, #e9a23b)" strokeWidth="13" />
        <g clipPath={`url(#over-${id})`}>{ring}</g>
      </g>
      <path d={blocks.join('')} fill="currentColor" />
    </svg>
  )
}
