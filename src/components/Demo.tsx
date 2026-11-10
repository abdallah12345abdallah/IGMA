import { useEffect, useMemo, useState } from 'react'
import { contact, demo, markets, systems, type SystemId } from '../content/site'
import { onDemoRequest } from '../demoEvents'

type Market = 'egypt' | 'saudi'
const OTHER = 'other'

/** Times we offer for a demo (about 45 minutes each), in the office's own time zone. */
const SLOTS = ['١٠:٠٠ ص', '١١:٣٠ ص', '١:٠٠ م', '٢:٣٠ م', '٤:٠٠ م', '٥:٣٠ م', '٧:٠٠ م', '٨:٣٠ م']

/** The next five working days: Friday is off in both markets, Saturday too in Egypt. */
function workdays(market: Market) {
  const out: Date[] = []
  const d = new Date()
  d.setDate(d.getDate() + 1)
  while (out.length < 5) {
    const wd = d.getDay()
    if (!(wd === 5 || (market === 'egypt' && wd === 6))) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('ar-EG', o)
const dayShort = fmt({ weekday: 'short' })
const dayNum = fmt({ day: 'numeric' })
const dayLong = fmt({ weekday: 'long', day: 'numeric', month: 'long' })

/**
 * Demo request as a booking: the visitor picks a day and a time, and the form prepares a
 * WhatsApp message to the right office with that suggested slot. There is no server.
 */
export function Demo({ initial, title }: { initial?: SystemId; title?: string }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [system, setSystem] = useState<string>(initial ?? systems[0].id)
  const [market, setMarket] = useState<Market>('egypt')
  const [message, setMessage] = useState('')
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState(SLOTS[2])
  const [errors, setErrors] = useState<{ name?: string; company?: string }>({})
  const [link, setLink] = useState<string | null>(null)

  useEffect(() => onDemoRequest((id) => setSystem(id)), [])

  const days = useMemo(() => workdays(market), [market])
  const office = markets.regions.find((r) => r.id === market)?.name ?? ''
  const when = `${dayLong.format(days[day])}، ${slot} (بتوقيت ${office})`

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
    const text = [`طلب عرض توضيحي: ${sysLabel}`, `الاسم: ${name.trim()}`, `الشركة: ${company.trim()}`, `الموعد المقترح: ${when}`, message.trim() ? `التفاصيل: ${message.trim()}` : '']
      .filter(Boolean)
      .join('\n')
    const url = `https://wa.me/${contact[market].whatsapp}?text=${encodeURIComponent(text)}`
    setLink(url)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <section className="demo" id="demo" data-nav="light" aria-labelledby="demo-title">
      <div className="container">
        <header className="head">
          <p className="kicker">{demo.kicker}</p>
          <h2 id="demo-title">{title ?? 'اختر موعدًا يناسبك، ونتواصل لتأكيده.'}</h2>
          <p className="head__body">{demo.body}</p>
        </header>

        {link ? (
          <div className="bk__panel bk__done" role="status">
            <h3>{demo.sentTitle}</h3>
            <p>{demo.sentBody}</p>
            <p className="bk__when">
              <small>الموعد المقترح</small>
              <b>{when}</b>
            </p>
            <div className="bk__actions">
              <a className="bk__send" href={link} target="_blank" rel="noreferrer">
                {demo.sentLink}
              </a>
              <button type="button" className="bk__again" onClick={() => setLink(null)}>
                {demo.again}
              </button>
            </div>
          </div>
        ) : (
          <form className="bk" onSubmit={submit} noValidate>
            <div className="bk__panel">
              <h3 id="bk-day">اليوم</h3>
              <p className="bk__sub">أيام العمل القادمة</p>
              <div className="bk__days" role="group" aria-labelledby="bk-day">
                {days.map((d, i) => (
                  <button key={d.toDateString()} type="button" aria-pressed={i === day} aria-label={dayLong.format(d)} onClick={() => setDay(i)}>
                    <small>{dayShort.format(d)}</small>
                    <b>{dayNum.format(d)}</b>
                  </button>
                ))}
              </div>
              <h3 id="bk-time" className="bk__gap">
                الوقت
              </h3>
              <p className="bk__sub">مدة العرض حوالي ٤٥ دقيقة</p>
              <div className="bk__slots" role="group" aria-labelledby="bk-time">
                {SLOTS.map((t) => (
                  <button key={t} type="button" aria-pressed={t === slot} onClick={() => setSlot(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="bk__tz" role="group" aria-label={demo.fields.market}>
                {markets.regions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={r.id === market}
                    onClick={() => {
                      setMarket(r.id)
                      setDay(0)
                    }}
                  >
                    بتوقيت {r.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bk__panel bk__summary">
              <h3>تفاصيلك</h3>
              <div className="field">
                <label htmlFor="demo-name">{demo.fields.name}</label>
                <input
                  id="demo-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (e.target.value.trim()) setErrors((x) => ({ ...x, name: undefined }))
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'err-name' : undefined}
                />
                {errors.name && (
                  <p className="field__error" id="err-name">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="demo-company">{demo.fields.company}</label>
                <input
                  id="demo-company"
                  name="organization"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value)
                    if (e.target.value.trim()) setErrors((x) => ({ ...x, company: undefined }))
                  }}
                  aria-invalid={!!errors.company}
                  aria-describedby={errors.company ? 'err-company' : undefined}
                />
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
                <label htmlFor="demo-message">{demo.fields.message}</label>
                <textarea id="demo-message" name="message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <p className="bk__when" aria-live="polite">
                <small>الموعد المقترح</small>
                <b key={when}>{when}</b>
              </p>
              <button className="bk__send" type="submit">
                احجز عبر واتساب
              </button>
              <p className="bk__legal">الموعد اقتراح منك، ونؤكده معك على واتساب.</p>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
