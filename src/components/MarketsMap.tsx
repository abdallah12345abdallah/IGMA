import { useMemo } from 'react'

/**
 * A dotted map of Egypt, the Red Sea and Saudi Arabia. Both countries are filled in their
 * colour, the two offices pulse, and a dot travels the route between them.
 * Outlines are simplified on purpose; at this dot size only the silhouette matters.
 */
const W = 1000
const H = 520
const LON0 = 23
const LON1 = 58
const LAT0 = 33.5
const LAT1 = 14.5
const px = (lon: number, lat: number): [number, number] => [((lon - LON0) / (LON1 - LON0)) * W, ((LAT0 - lat) / (LAT0 - LAT1)) * H]

const EGYPT: [number, number][] = [[25, 31.6], [29.5, 30.9], [32.3, 31.3], [34.2, 31.3], [34.9, 29.5], [34.25, 27.75], [32.6, 29.9], [33.6, 27.3], [35.5, 23.9], [36.9, 22], [25, 22]]
const SAUDI: [number, number][] = [[34.6, 28.1], [36.6, 29.2], [38, 31.5], [42, 31.1], [44.7, 29.2], [46.5, 29.1], [48.4, 28.5], [49.6, 26.7], [50.8, 25], [51.6, 24.3], [52, 23], [55.7, 22], [55, 20], [52, 19], [48.9, 18.3], [46.5, 17.3], [43.3, 16.7], [42.8, 16.4], [42.5, 17.5], [41.2, 19.5], [39.2, 21.5], [38.5, 23.6], [37, 25.3], [35.6, 27.4]]

const GIZA = px(31.2, 30.0)
const RIYADH = px(46.7, 24.7)

function inside(lon: number, lat: number, poly: [number, number][]) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

export function MarketsMap() {
  const dots = useMemo(() => {
    const out: { x: number; y: number; k: 0 | 1 | 2 }[] = []
    for (let lat = LAT0; lat > LAT1; lat -= 0.5)
      for (let lon = LON0; lon < LON1; lon += 0.5) {
        const [x, y] = px(lon, lat)
        out.push({ x, y, k: inside(lon, lat, EGYPT) ? 1 : inside(lon, lat, SAUDI) ? 2 : 0 })
      }
    return out
  }, [])
  const [gx, gy] = GIZA
  const [rx, ry] = RIYADH
  const route = `M${gx} ${gy} Q ${(gx + rx) / 2} ${Math.min(gy, ry) - 120} ${rx} ${ry}`
  const [sx, sy] = px(37.5, 21.5)

  return (
    <svg className="mm" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.k ? 4.4 : 2.2} className={d.k === 1 ? 'mm__eg' : d.k === 2 ? 'mm__sa' : 'mm__sea-dot'} />
      ))}
      <path id="mm-route" d={route} className="mm__route" />
      <circle r="7" className="mm__traveller">
        <animateMotion dur="4s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear">
          <mpath href="#mm-route" />
        </animateMotion>
      </circle>
      {[
        { x: gx, y: gy, cls: 'mm__eg', name: 'الجيزة' },
        { x: rx, y: ry, cls: 'mm__sa', name: 'الرياض' },
      ].map((o) => (
        <g key={o.name}>
          <circle cx={o.x} cy={o.y} r="10" className={o.cls} />
          <circle cx={o.x} cy={o.y} r="10" className={`mm__ring ${o.cls}`} />
          <text x={o.x} y={o.y + 36} textAnchor="middle" className="mm__city">
            {o.name}
          </text>
        </g>
      ))}
      <text x={sx} y={sy} textAnchor="middle" className="mm__sea" transform={`rotate(52 ${sx} ${sy})`}>
        البحر الأحمر
      </text>
    </svg>
  )
}
