import { useId } from 'react'

/** Square-Kufic letters on a 5-unit grid: [x, y, w, h] per block, in grid units. */
const SOLID: [number, number, number, number][][] = [
  // I
  [[0, 0, 1, 5]],
  // G
  [[0, 0, 4, 1], [0, 0, 1, 5], [0, 4, 4, 1], [3, 2, 1, 3], [2, 2, 1, 1]],
  // M
  [[0, 0, 5, 1], [0, 0, 1, 5], [2, 0, 1, 5], [4, 0, 1, 5]],
]
/** The A is drawn in dots, one per module. */
const A_CELLS: [number, number][] = [
  [0, 0], [1, 0], [2, 0], [3, 0],
  [0, 1], [3, 1],
  [0, 2], [1, 2], [2, 2], [3, 2],
  [0, 3], [3, 3],
  [0, 4], [3, 4],
]
const WIDTHS = [1, 4, 5, 4]
const U = 5 // one grid unit
const SYMBOL_W = 32 // the links, scaled to the letters' height
const GAP = 8

/**
 * IGMA: two interlocking links (one in the current text colour, the other in --logo-accent)
 * and the name set as square Kufic, with the A in dots.
 * With `live`, the accent link runs as a moving dashed line and the links breathe.
 */
export function Logo({ className, title = 'IGMA', live = false }: { className?: string; title?: string; live?: boolean }) {
  const id = useId().replace(/:/g, '')
  const origins: number[] = []
  let x = SYMBOL_W + GAP
  WIDTHS.forEach((w) => {
    origins.push(x)
    x += (w + 1) * U
  })
  const width = x - U
  const blocks = SOLID.flatMap((letter, i) => letter.map(([bx, by, w, h]) => `M${origins[i] + bx * U} ${by * U}h${w * U}v${h * U}h${-w * U}z`))
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
          <rect className="logo__run" x="43" y="17" width="50" height="50" rx="14" fill="none" stroke="var(--logo-accent, #f0c27a)" strokeWidth="13" />
        </g>
        <g className="logo__one" clipPath={`url(#over-${id})`}>
          {ring}
        </g>
      </g>
      <path d={blocks.join('')} fill="currentColor" />
      {A_CELLS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={origins[3] + cx * U + U / 2} cy={cy * U + U / 2} r={2.2} fill="currentColor" />
      ))}
    </svg>
  )
}
