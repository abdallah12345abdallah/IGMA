import { useEffect, useState } from 'react'
import { clients, company, contact, footer, markets, nav, plans, services, systems } from '../content/site'
import { ServiceVisual, type ServiceKind } from './ServiceVisual'
import { MarketsMap } from './MarketsMap'

/** Each service's live illustration and its accent from the system palette. */
const SVC_LOOK: { kind: ServiceKind; color: string }[] = [
  { kind: 'flow', color: '#18306F' },
  { kind: 'code', color: '#A5370A' },
  { kind: 'nodes', color: '#0B4246' },
  { kind: 'web', color: '#860F30' },
]

export function Services() {
  return (
    <section className="section svc" id="services" data-nav="light" aria-labelledby="services-title">
      <div className="container">
        <header className="svc__head">
          <div>
            <p className="kicker">{services.kicker}</p>
            <h2 id="services-title">{services.title}</h2>
          </div>
          <p className="svc__lede">{company.summary}</p>
        </header>
        <ul className="svc__grid">
          {services.items.map((s, k) => (
            <li key={s.title} className="svc__item" style={{ ['--c' as string]: SVC_LOOK[k].color }}>
              <div className="svc__vis">
                <ServiceVisual kind={SVC_LOOK[k].kind} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
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

export function Plans() {
  return (
    <section className="section" id="plans" data-nav="light" aria-labelledby="plans-title">
      <div className="container">
        <header className="head">
          <p className="kicker">{plans.kicker}</p>
          <h2 id="plans-title">{plans.title}</h2>
        </header>
        <ul className="models">
          {plans.models.map((m) => (
            <li key={m.name}>
              <h3>{m.name}</h3>
              <p>
                <b>مناسب لـ</b> {m.fits}
              </p>
              <p>
                <b>التحصيل</b> {m.billing}
              </p>
            </li>
          ))}
        </ul>
        <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="plans-title">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">البند</span>
                </th>
                {plans.columns.map((c, i) => (
                  <th scope="col" key={c} dir="auto" className={i === 1 ? 'is-main' : ''}>
                    {c}
                    <small>{plans.columnNotes[i]}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {r.values.map((v, i) => (
                    <td key={i} className={i === 1 ? 'is-main' : ''}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="plans__note">{plans.note}</p>
        <ul className="rules">
          {plans.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Clients() {
  return (
    <section className="section section--sand2" id="clients" data-nav="light" aria-labelledby="clients-title">
      <div className="container">
        <header className="head">
          <p className="kicker">{clients.kicker}</p>
          <h2 id="clients-title">{clients.title}</h2>
        </header>
        <ul className="clients">
          {clients.items.map((c) => {
            const sys = systems.find((s) => s.id === c.id)
            return (
              <li key={c.sector} style={{ ['--c' as string]: sys?.color }}>
                <a href={`#/systems/${c.id}`}>
                  <h3>{c.sector}</h3>
                  <p dir="auto">{c.system}</p>
                  <span>{c.place}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <p className="footer__statement">{footer.statement}</p>
        <div className="footer__grid">
          <div>
            <p className="footer__mark" dir="ltr">
              {company.name}
            </p>
            <p dir="ltr" className="footer__desc">
              {company.descriptor}
            </p>
            <p>{company.promise}</p>
          </div>
          <div>
            <h2>{contact.egypt.label}</h2>
            <p>{contact.egypt.address}</p>
            <a href={`tel:+${contact.egypt.whatsapp}`} dir="ltr">
              {contact.egypt.phone}
            </a>
          </div>
          <div>
            <h2>{contact.saudi.label}</h2>
            <p>{contact.saudi.address}</p>
            <a href={`tel:+${contact.saudi.whatsapp}`} dir="ltr">
              {contact.saudi.phone}
            </a>
          </div>
          <div>
            <h2>{footer.sections}</h2>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
              <li>
                <a href={contact.facebook} target="_blank" rel="noreferrer">
                  {footer.social}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="footer__legal">
          © {year} {company.name}
        </p>
      </div>
    </footer>
  )
}
