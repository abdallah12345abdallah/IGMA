import { useEffect, useState } from 'react'
import { contact, demo, markets, systems, type SystemId } from '../content/site'
import { onDemoRequest } from '../demoEvents'

type Market = 'egypt' | 'saudi'
const OTHER = 'other'

/** Demo request. There is no server: the form prepares a WhatsApp message to the right office. */
export function Demo({ initial, title }: { initial?: SystemId; title?: string }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [system, setSystem] = useState<string>(initial ?? systems[0].id)
  const [market, setMarket] = useState<Market>('egypt')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; company?: string }>({})
  const [link, setLink] = useState<string | null>(null)

  useEffect(() => onDemoRequest((id) => setSystem(id)), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!name.trim()) next.name = demo.errors.name
    if (!company.trim()) next.company = demo.errors.company
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(next.name ? 'demo-name' : 'demo-company')?.focus()
      return
    }
    const sysLabel = systems.find((s) => s.id === system)?.name ?? demo.other
    const text = [`طلب عرض توضيحي: ${sysLabel}`, `الاسم: ${name.trim()}`, `الشركة: ${company.trim()}`, message.trim() ? `التفاصيل: ${message.trim()}` : '']
      .filter(Boolean)
      .join('\n')
    const url = `https://wa.me/${contact[market].whatsapp}?text=${encodeURIComponent(text)}`
    setLink(url)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <section className="demo" id="demo" aria-labelledby="demo-title">
      <div className="container demo__grid">
        <header className="head">
          <p className="kicker">{demo.kicker}</p>
          <h2 id="demo-title">{title ?? demo.title}</h2>
          <p className="head__body">{demo.body}</p>
        </header>

        {link ? (
          <div className="form form--done" role="status">
            <h3>{demo.sentTitle}</h3>
            <p>{demo.sentBody}</p>
            <div className="actions">
              <a className="btn btn--on" href={link} target="_blank" rel="noreferrer">
                {demo.sentLink}
              </a>
              <button type="button" className="btn btn--ghost" onClick={() => setLink(null)}>
                {demo.again}
              </button>
            </div>
          </div>
        ) : (
          <form className="form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="demo-name">{demo.fields.name}</label>
              <input id="demo-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
              {errors.name && (
                <p className="field__error" id="err-name">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="demo-company">{demo.fields.company}</label>
              <input id="demo-company" name="organization" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} aria-invalid={!!errors.company} aria-describedby={errors.company ? 'err-company' : undefined} />
              {errors.company && (
                <p className="field__error" id="err-company">
                  {errors.company}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="demo-system">{demo.fields.system}</label>
              <select id="demo-system" name="system" value={system} onChange={(e) => setSystem(e.target.value)}>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value={OTHER}>{demo.other}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="demo-market">{demo.fields.market}</label>
              <select id="demo-market" name="market" value={market} onChange={(e) => setMarket(e.target.value as Market)}>
                {markets.regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field field--wide">
              <label htmlFor="demo-message">{demo.fields.message}</label>
              <textarea id="demo-message" name="message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <button className="btn btn--on btn--block field--wide" type="submit">
              {demo.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
