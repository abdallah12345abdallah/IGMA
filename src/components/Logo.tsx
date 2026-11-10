import { useId } from 'react'

/** Square-Kufic letters on a 5-unit grid: [x, y, w, h] per block, in grid units. */
const LETTERS: [number, number, number, number][][] = [
  // I
  [[0, 0, 1, 5]],
  // G (its small inner square is drawn on its own so it can pulse)
  [[0, 0, 4, 1], [0, 0, 1, 5], [0, 4, 4, 1], [3, 2, 1, 3]],
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
 * With `live`, a spark circles the amber link, the links pull apart and lock again now and
 * then, and the square inside the G pulses.
 */
export function Logo({ className, title = 'IGMA', live = false }: { className?: string; title?: string; live?: boolean }) {
  const id = useId().replace(/:/g, '')
  let x = SYMBOL_W + GAP
  const blocks: string[] = []
  let gDot = 0
  LETTERS.forEach((letter, i) => {
    letter.forEach(([bx, by, w, h]) => blocks.push(`M${x + bx * U} ${by * U}h${w * U}v${h * U}h${-w * U}z`))
    if (i === 1) gDot = x + 2 * U
    x += (WIDTHS[i] + 1) * U
  })
  const width = x - U
  const ring = <rect x="7" y="31" width="50" height="50" rx="14" fill="none" stroke="currentColor" strokeWidth="13" />
  return (
    <svg className={`${className ?? ''} ${live ? 'logo--live' : ''}`} viewBox={`0 0 ${width} 25`} role="img" aria-label={title}>
      {/* the links are drawn on a 100-unit box and scaled down to the 25-unit cap height */}
      <g transform="scale(0.325) translate(-0.5 -10.5)">
        <defs>
          <clipPath id={`over-${id}`}>
            <rect x="46" y="56" width="22" height="22" />
          </clipPath>
        </defs>
        <g className="logo__one">{ring}</g>
        <g className="logo__two">
          <rect x="43" y="17" width="50" height="50" rx="14" fill="none" stroke="var(--logo-accent, #f2b25c)" strokeWidth="13" />
          {live && <rect className="logo__spark" x="43" y="17" width="50" height="50" rx="14" fill="none" strokeWidth="13" pathLength={100} />}
        </g>
        <g className="logo__one" clipPath={`url(#over-${id})`}>
          {ring}
        </g>
      </g>
      <path d={blocks.join('')} fill="currentColor" />
      <rect className="logo__dot" x={gDot} y={2 * U} width={U} height={U} fill="currentColor" />
    </svg>
  )
}
