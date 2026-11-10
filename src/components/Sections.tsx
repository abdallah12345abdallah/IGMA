import { useState } from 'react'
import { clients, company, contact, footer, markets, nav, plans, services, systems } from '../content/site'

export function Services() {
  return (
    <section className="section" id="services" data-nav="light" aria-labelledby="services-title">
      <div className="container">
        <header className="head">
          <p className="kicker">{services.kicker}</p>
          <h2 id="services-title">{services.title}</h2>
          <p className="head__body">{company.summary}</p>
        </header>
        <ul className="services">
          {services.items.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Markets() {
  const [id, setId] = useState<'egypt' | 'saudi'>('egypt')
  const region = markets.regions.find((r) => r.id === id) ?? markets.regions[0]
  const office = contact[id]
  return (
    <section className="section section--ink" id="markets" aria-labelledby="markets-title">
      <div className="container markets">
        <header className="head">
          <p className="kicker">{markets.kicker}</p>
          <h2 id="markets-title">{markets.title}</h2>
          <div className="switch" role="group" aria-label="اختر السوق">
            {markets.regions.map((r) => (
              <button key={r.id} type="button" aria-pressed={r.id === id} onClick={() => setId(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
        </header>
        <div className="market" key={id}>
          <p className="market__who">{region.audience}</p>
          <ul>
            {region.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="market__how">{region.delivery}</p>
          <p className="market__office">
            {office.address}
            <a href={`tel:+${office.whatsapp}`} dir="ltr">
              {office.phone}
            </a>
          </p>
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
