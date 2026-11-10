import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clients, company, contact, footer, markets, nav, plans, services, systems } from '../content/site'
import { MarketsMap } from './MarketsMap'
import { Logo } from './Logo'

/** Each service's colour. */
const SVC_COLOR = ['#18306F', '#A5370A', '#0B4246', '#860F30']
const AUTO_MS = 3400

/** A small live drawing of what each service does, shown when its panel opens. */
function ServiceArt({ i }: { i: number }) {
  if (i === 0)
    // automation: a task moving through three steps
    return (
      <svg viewBox="0 0 160 100" className="sa sa--flow">
        <path d="M36 50h24M96 50h24" className="sa__line" />
        {[0, 60, 120].map((x, k) => (
          <rect key={x} x={x} y="36" width="40" height="28" rx="8" className="sa__box" style={{ animationDelay: `${k * 0.8}s` }} />
        ))}
        <circle cx="20" cy="50" r="5" className="sa__dot" />
      </svg>
    )
  if (i === 1)
    // custom software: code being written line by line
    return (
      <svg viewBox="0 0 160 100" className="sa sa--code">
        {[120, 86, 140, 64, 104].map((w, k) => (
          <rect key={k} x={k % 2 ? 14 : 0} y={k * 18 + 4} width={w} height="9" rx="4.5" className="sa__ln" style={{ animationDelay: `${k * 0.35}s` }} />
        ))}
        <rect x="146" y="76" width="3" height="13" className="sa__caret" />
      </svg>
    )
  if (i === 2)
    // integrations: data flowing between a hub and four systems
    return (
      <svg viewBox="0 0 160 100" className="sa sa--hub">
        {[[14, 14], [146, 14], [14, 86], [146, 86]].map(([x, y]) => (
          <g key={`${x}${y}`}>
            <path d={`M80 50L${x} ${y}`} className="sa__wire" />
            <rect x={x - 12} y={y - 12} width="24" height="24" rx="7" className="sa__box" />
          </g>
        ))}
        <circle cx="80" cy="50" r="22" className="sa__ring" />
        <circle cx="80" cy="50" r="14" className="sa__core" />
      </svg>
    )
  // websites: a page assembling itself
  return (
    <svg viewBox="0 0 160 100" className="sa sa--web">
      <rect x="0" y="0" width="160" height="100" rx="10" className="sa__frame" />
      {[12, 22, 32].map((x) => (
        <circle key={x} cx={x} cy="11" r="3" className="sa__core" />
      ))}
      <rect x="10" y="26" width="90" height="24" rx="6" className="sa__part" />
      {[10, 58, 106].map((x, k) => (
        <rect key={x} x={x} y="60" width="44" height="30" rx="6" className="sa__part" style={{ animationDelay: `${0.3 + k * 0.2}s` }} />
      ))}
    </svg>
  )
}

export function Services() {
  const [open, setOpen] = useState(0)
  const [held, setHeld] = useState(false)
  // panels take turns opening by themselves until the visitor points at one
  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setOpen((n) => (n + 1) % services.items.length), AUTO_MS)
    return () => window.clearInterval(id)
  }, [held])
  const pick = (i: number) => {
    setOpen(i)
    setHeld(true)
  }
  // a soft light that follows the pointer inside a panel
  const glow = (e: React.PointerEvent<HTMLLIElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <section className="section sv" id="services" data-nav="light" aria-labelledby="services-title">
      <div className="sv__float" aria-hidden="true">
        <i className="f1" />
        <i className="f2" />
        <i className="f3" />
        <i className="f4" />
        <i className="f5" />
      </div>
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
              onPointerMove={glow}
            >
              <span className="sv__num" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="sv__viz" aria-hidden="true">
                <ServiceArt i={i} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {i === open && !held && <span key={open} className="sv__timer" style={{ animationDuration: `${AUTO_MS}ms` }} aria-hidden="true" />}
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
        <Logo className="ft__mark" title={company.name} />
      </div>
    </footer>
  )
}
