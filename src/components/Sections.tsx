import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clients, company, contact, footer, markets, nav, plans, services, systems } from '../content/site'
import { MarketsMap } from './MarketsMap'

/** Each service's colour, and the little live drawing shown when its panel opens (x, y, w, h). */
const SVC_COLOR = ['#18306F', '#A5370A', '#0B4246', '#860F30']
const SVC_VIZ: [number, number, number, number][][] = [
  // automation: three steps in a row
  [[0, 40, 40, 22], [55, 40, 40, 22], [110, 40, 40, 22]],
  // custom software: lines of code
  [[0, 0, 120, 10], [0, 18, 90, 10], [0, 36, 140, 10], [0, 54, 70, 10], [0, 72, 110, 10]],
  // integrations: a hub and four systems
  [[60, 34, 30, 30], [0, 0, 26, 26], [124, 0, 26, 26], [0, 74, 26, 26], [124, 74, 26, 26]],
  // websites: a page
  [[0, 0, 150, 18], [0, 26, 100, 30], [0, 64, 46, 30], [52, 64, 46, 30], [104, 64, 46, 30]],
]

export function Services() {
  const [open, setOpen] = useState(0)
  const [held, setHeld] = useState(false)
  // panels take turns opening by themselves until the visitor points at one
  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setOpen((n) => (n + 1) % services.items.length), 3400)
    return () => window.clearInterval(id)
  }, [held])
  const pick = (i: number) => {
    setOpen(i)
    setHeld(true)
  }
  return (
    <section className="section sv" id="services" aria-labelledby="services-title">
      <div className="container">
        <header className="sv__head">
          <div>
            <p className="kicker">{services.kicker}</p>
            <h2 id="services-title">{services.title}</h2>
          </div>
          <p className="sv__lede">{company.summary}</p>
        </header>
        <ul className="sv__rows" onMouseLeave={() => setHeld(false)}>
          {services.items.map((item, i) => (
            <li
              key={item.title}
              className={`sv__row ${i === open ? 'is-open' : ''}`}
              style={{ ['--c' as string]: SVC_COLOR[i] }}
              tabIndex={0}
              onMouseEnter={() => pick(i)}
              onFocus={() => pick(i)}
            >
              <span className="sv__num" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="sv__viz" aria-hidden="true">
                {SVC_VIZ[i].map(([x, y, w, h], k) => (
                  <i key={k} style={{ left: x, top: y, width: w, height: h, animationDelay: `${k * 0.3}s` }} />
                ))}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Each market's office city and time zone, for the route and the live clock. */
const MARKET_CITY = {
  egypt: { city: 'الجيزة', tz: 'Africa/Cairo' },
  saudi: { city: 'الرياض', tz: 'Asia/Riyadh' },
} as const

function useClock(tz: string) {
  const fmt = () => new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = window.setInterval(() => setT(fmt()), 30000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tz])
  return t
}

function MarketClock({ tz }: { tz: string }) {
  return <span className="mk__time">{useClock(tz)}</span>
}

export function Markets() {
  return (
    <section className="section mk" id="markets" data-nav="light" aria-labelledby="markets-title">
      <div className="container">
        <header className="mk__head">
          <p className="kicker">{markets.kicker}</p>
          <h2 id="markets-title">{markets.title}</h2>
        </header>
        <div className="mk__map">
          <MarketsMap />
          {markets.regions.map((r) => {
            const office = contact[r.id]
            const city = MARKET_CITY[r.id]
            return (
              <article key={r.id} className={`mk__card mk__card--${r.id}`} aria-labelledby={`mk-${r.id}`}>
                <h3 id={`mk-${r.id}`}>{r.name}</h3>
                <p className="mk__meta">
                  <span>{city.city}</span>
                  <MarketClock tz={city.tz} />
                </p>
                <p className="mk__who">{r.audience}</p>
                <ul className="mk__focus">
                  {r.focus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="mk__how">{r.delivery}</p>
                <p className="mk__office">
                  <span>{office.address}</span>
                  <a href={`https://wa.me/${office.whatsapp}`} target="_blank" rel="noopener noreferrer" dir="ltr">
                    {office.phone}
                  </a>
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Accent per contract model. */
const MODEL_COLOR = ['#18306F', '#0B5A3E', '#A5370A']
const isNone = (v: string) => v === '—'

export function Plans() {
  // the rules run as a slow ticker; repeated so the loop has no gap
  const ticker = [...plans.rules, ...plans.rules, ...plans.rules, ...plans.rules]
  return (
    <section className="section pl" id="plans" data-nav="light" aria-labelledby="plans-title">
      <div className="pl__aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="container pl__in">
        <header className="head">
          <p className="kicker">{plans.kicker}</p>
          <h2 id="plans-title">{plans.title}</h2>
        </header>
        <ul className="pl__models">
          {plans.models.map((m, i) => (
            <li key={m.name} className="pl__glass" style={{ ['--c' as string]: MODEL_COLOR[i] }}>
              <b>{m.name}</b>
              {m.fits} · {m.billing}
            </li>
          ))}
        </ul>
        <div className="pl__cards">
          {plans.columns.map((c, j) => (
            <article key={c} className={`pl__card pl__glass ${j === 1 ? 'is-main' : ''}`} aria-labelledby={`pl-${j}`}>
              <h3 id={`pl-${j}`} dir="ltr">
                {c}
              </h3>
              <p className="pl__tag">{plans.columnNotes[j]}</p>
              <ul>
                {plans.rows.map((r) => (
                  <li key={r.label} className={isNone(r.values[j]) ? 'no' : ''}>
                    <span>{r.label}</span>
                    <span>{isNone(r.values[j]) ? 'غير متاح' : r.values[j]}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="pl__note">{plans.note}</p>
      </div>
      {/* the rules run edge to edge, outside the content column */}
      <div className="pl__ticker">
        <ul className="sr-only">
          {plans.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div aria-hidden="true">
          {ticker.map((r, i) => (
            <span key={i}>{r}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Where each polaroid hangs on the board (right %, top %) and how it tilts. */
const PIN_SPOTS = [
  { right: 4, top: 7, r: -6 },
  { right: 36, top: 3, r: 4 },
  { right: 70, top: 8, r: -3 },
  { right: 8, top: 57, r: 5 },
  { right: 68, top: 58, r: -4 },
]

export function Clients() {
  const boardRef = useRef<HTMLDivElement>(null)
  const [strings, setStrings] = useState<string[]>([])
  // Red strings run from each pin to IGMA in the middle; redrawn whenever the board changes size.
  useLayoutEffect(() => {
    const bd = boardRef.current
    if (!bd) return
    const draw = () => {
      const b = bd.getBoundingClientRect()
      const hub = bd.querySelector('.cl__hub')?.getBoundingClientRect()
      if (!hub) return
      const hx = hub.left + hub.width / 2 - b.left
      const hy = hub.top + hub.height / 2 - b.top
      setStrings(
        [...bd.querySelectorAll('.cl__pol')].map((p) => {
          const r = p.getBoundingClientRect()
          const x = r.left + r.width / 2 - b.left
          const y = r.top + 4 - b.top
          return `M${x} ${y} Q ${(x + hx) / 2} ${Math.max(y, hy) + 40} ${hx} ${hy}`
        }),
      )
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(bd)
    return () => ro.disconnect()
  }, [])

  return (
    <section className="section cl" id="clients" data-nav="light" aria-labelledby="clients-title">
      <div className="container">
        <header className="head">
          <p className="kicker">{clients.kicker}</p>
          <h2 id="clients-title">{clients.title}</h2>
        </header>
        <div className="cl__board" ref={boardRef}>
          <svg className="cl__strings" aria-hidden="true">
            {strings.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>
          <div className="cl__hub">
            <b dir="ltr">IGMA</b>
            <small>نظام واحد، عملاء حقيقيون</small>
          </div>
          <ul className="cl__pols">
            {clients.items.map((c, i) => {
              const k = systems.findIndex((s) => s.id === c.id)
              const spot = PIN_SPOTS[i % PIN_SPOTS.length]
              return (
                <li
                  key={c.sector}
                  className="cl__pol"
                  style={{ ['--c' as string]: systems[k]?.color, ['--r' as string]: `${spot.r}deg`, ['--x' as string]: `${spot.right}%`, ['--y' as string]: `${spot.top}%` }}
                >
                  <a href={`#/systems/${c.id}`}>
                    {/* the system's own scene from the 3D tour */}
                    <img src={`/stops/d-${k + 1}.webp`} alt={`بيئة عمل ${c.sector}`} loading="lazy" decoding="async" />
                    <b>{c.sector}</b>
                    <small>
                      {c.system} · {c.place}
                    </small>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

const OFFICES = [
  { id: 'egypt' as const, tz: 'Africa/Cairo' },
  { id: 'saudi' as const, tz: 'Asia/Riyadh' },
]
const officeTime = (tz: string) => new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date())

/**
 * The IGMA wordmark drawn from thousands of points. They scatter away from the cursor and
 * gather back, like the systems in the opening view. Runs only while the footer is on screen.
 */
function ParticleMark() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; s: number }
    let pts: P[] = []
    let W = 0
    let H = 0
    let raf = 0
    let running = false
    const m = { x: -9999, y: -9999 }

    const build = () => {
      const r = cv.getBoundingClientRect()
      if (!r.width) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = Math.round(r.width)
      H = Math.round(r.height)
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const o = document.createElement('canvas')
      o.width = W
      o.height = H
      const x = o.getContext('2d')!
      const fs = Math.min(H * 0.92, W * 0.3)
      x.font = `900 ${fs}px "Readex Pro", Alexandria, sans-serif`
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.fillText('IGMA', W / 2, H / 2 + fs * 0.04)
      const d = x.getImageData(0, 0, W, H).data
      const step = W < 500 ? 3 : 4
      const next: P[] = []
      for (let yy = 0; yy < H; yy += step)
        for (let xx = 0; xx < W; xx += step)
          if (d[(yy * W + xx) * 4 + 3] > 128) next.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: xx, ty: yy, s: 1.3 + Math.random() * 1.3 })
      pts = next
      if (reduced) {
        pts.forEach((p) => {
          p.x = p.tx
          p.y = p.ty
        })
        draw()
      }
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of pts) {
        const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 6)
        ctx.fillStyle = sp > 0.15 ? `rgba(255, 214, 140, ${0.65 + sp * 0.35})` : 'rgba(246, 226, 196, 0.6)'
        ctx.fillRect(p.x, p.y, p.s, p.s)
      }
    }
    const frame = () => {
      raf = requestAnimationFrame(frame)
      for (const p of pts) {
        const dx = p.x - m.x
        const dy = p.y - m.y
        const d2 = dx * dx + dy * dy
        if (d2 < 12000) {
          const f = (12000 - d2) / 12000
          const dd = Math.sqrt(d2 + 1)
          p.vx += (dx / dd) * f * 5
          p.vy += (dy / dd) * f * 5
        }
        p.vx = (p.vx + (p.tx - p.x) * 0.05) * 0.82
        p.vy = (p.vy + (p.ty - p.y) * 0.05) * 0.82
        p.x += p.vx
        p.y += p.vy
      }
      draw()
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running && !reduced) {
        running = true
        frame()
      } else if (!e.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      m.x = e.clientX - r.left
      m.y = e.clientY - r.top
    }
    const leave = () => {
      m.x = m.y = -9999
    }
    const ro = new ResizeObserver(build)
    document.fonts.ready.then(() => {
      build()
      ro.observe(cv)
      io.observe(cv)
    })
    cv.addEventListener('pointermove', move)
    cv.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      cv.removeEventListener('pointermove', move)
      cv.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <canvas ref={ref} className="ft__mark" role="img" aria-label="IGMA" />
}

export function Footer() {
  const year = new Date().getFullYear()
  const [, tick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 30000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <footer className="ft" id="contact">
      <div className="container ft__grid">
        <div className="ft__info">
          <p className="ft__statement">{footer.statement}</p>
          <div className="ft__offices">
            {OFFICES.map((o) => {
              const c = contact[o.id]
              return (
                <div key={o.id}>
                  <b>{c.label}</b>
                  <span>{c.address}</span>
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" dir="ltr">
                    {c.phone}
                  </a>
                  <small>{officeTime(o.tz)} الآن</small>
                </div>
              )
            })}
          </div>
          <nav className="ft__nav" aria-label={footer.sections}>
            {nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
            <a href={contact.facebook} target="_blank" rel="noreferrer">
              {footer.social}
            </a>
          </nav>
          <p className="ft__legal">
            © {year} {company.name} · <span dir="ltr">{company.descriptor}</span>
          </p>
        </div>
        <ParticleMark />
      </div>
    </footer>
  )
}
