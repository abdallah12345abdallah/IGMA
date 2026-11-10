import { useEffect, useRef, useState } from 'react'
import { contact, demo, markets, systems, type SystemId } from '../content/site'
import { onDemoRequest } from '../demoEvents'

type Market = 'egypt' | 'saudi'
const OTHER = 'other'

function useOfficeClock(tz: string) {
  const fmt = () => new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => {
    setT(fmt())
    const id = window.setInterval(() => setT(fmt()), 30000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tz])
  return t
}

const clock = () => new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' }).format(new Date())

/**
 * Demo request. There is no server: the form prepares a WhatsApp message to the right office,
 * and a phone beside it shows that message being written as the visitor types.
 */
export function Demo({ initial, title }: { initial?: SystemId; title?: string }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [system, setSystem] = useState<string>(initial ?? systems[0].id)
  const [market, setMarket] = useState<Market>('egypt')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; company?: string }>({})
  const [link, setLink] = useState<string | null>(null)
  const [time] = useState(clock)
  const [typing, setTyping] = useState(false)
  const [bump, setBump] = useState(0)
  const typingTimer = useRef(0)
  const phoneRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  // every keystroke: the chat header says "typing", and the bubble pops when the text settles
  const touched = () => {
    setTyping(true)
    window.clearTimeout(typingTimer.current)
    typingTimer.current = window.setTimeout(() => {
      setTyping(false)
      setBump((n) => n + 1)
    }, 700)
  }
  // the phone leans slightly toward the pointer
  useEffect(() => {
    const stage = stageRef.current
    const phone = phoneRef.current
    if (!stage || !phone || window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return
    const move = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      phone.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`
    }
    const leave = () => (phone.style.transform = '')
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerleave', leave)
    return () => {
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerleave', leave)
    }
  }, [])
  const officeTime = useOfficeClock(market === 'egypt' ? 'Africa/Cairo' : 'Asia/Riyadh')
  const sysIndex = systems.findIndex((x) => x.id === system)
  const ready = !!name.trim() && !!company.trim()

  useEffect(() => onDemoRequest((id) => setSystem(id)), [])

  const sysLabel = systems.find((s) => s.id === system)?.name ?? demo.other
  const text = [`طلب عرض توضيحي: ${sysLabel}`, name.trim() && `الاسم: ${name.trim()}`, company.trim() && `الشركة: ${company.trim()}`, message.trim() && `التفاصيل: ${message.trim()}`]
    .filter(Boolean)
    .join('\n')
  const office = markets.regions.find((r) => r.id === market)?.name ?? ''

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
    const url = `https://wa.me/${contact[market].whatsapp}?text=${encodeURIComponent(text)}`
    setLink(url)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <section className="demo" id="demo" data-nav="light" aria-labelledby="demo-title">
      <div className="demo__drift" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <div className="container demo__grid">
        <div className="demo__main">
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
                <a className="demo__send" href={link} target="_blank" rel="noreferrer">
                  {demo.sentLink}
                </a>
                <button type="button" className="demo__again" onClick={() => setLink(null)}>
                  {demo.again}
                </button>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="demo-name">{demo.fields.name}</label>
                <input id="demo-name" name="name" autoComplete="name" value={name} onChange={(e) => {
                    setName(e.target.value)
                    touched()
                    if (e.target.value.trim()) setErrors((x) => ({ ...x, name: undefined }))
                  }} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
                {errors.name && (
                  <p className="field__error" id="err-name">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="demo-company">{demo.fields.company}</label>
                <input id="demo-company" name="organization" autoComplete="organization" value={company} onChange={(e) => {
                    setCompany(e.target.value)
                    touched()
                    if (e.target.value.trim()) setErrors((x) => ({ ...x, company: undefined }))
                  }} aria-invalid={!!errors.company} aria-describedby={errors.company ? 'err-company' : undefined} />
                {errors.company && (
                  <p className="field__error" id="err-company">
                    {errors.company}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="demo-system">{demo.fields.system}</label>
                <select id="demo-system" name="system" value={system} onChange={(e) => {
                    setSystem(e.target.value)
                    setBump((n) => n + 1)
                  }}>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                  <option value={OTHER}>{demo.other}</option>
                </select>
              </div>
              <div className="field">
                <span className="field__label" id="demo-market-label">
                  {demo.fields.market}
                </span>
                <div className="demo__seg" role="group" aria-labelledby="demo-market-label">
                  {markets.regions.map((r) => (
                    <button key={r.id} type="button" aria-pressed={r.id === market} onClick={() => {
                        setMarket(r.id)
                        setBump((n) => n + 1)
                      }}>
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field field--wide">
                <label htmlFor="demo-message">{demo.fields.message}</label>
                <textarea id="demo-message" name="message" rows={3} value={message} onChange={(e) => {
                    setMessage(e.target.value)
                    touched()
                  }} />
              </div>
              <button className="demo__send field--wide" type="submit">
                {demo.submit}
              </button>
            </form>
          )}
        </div>

        {/* the message as it will arrive, written live, with a few cards floating around it */}
        <div className="demo__stage" ref={stageRef} aria-hidden="true">
          <div className="demo__float demo__float--sys" key={'s' + system}>
            {sysIndex >= 0 ? <img src={`/stops/d-${sysIndex + 1}.webp`} alt="" /> : <span className="demo__plus">+</span>}
            <span>
              <small>النظام</small>
              <b>{sysIndex >= 0 ? systems[sysIndex].short : 'نظام خاص'}</b>
            </span>
          </div>
          <div className="demo__float demo__float--office" key={'o' + market}>
            <i />
            <span>
              <small>مكتب {office}</small>
              <b>{officeTime}</b>
            </span>
          </div>
          <div className={`demo__float demo__float--ready ${ready ? 'is-ready' : ''}`}>{ready ? 'جاهزة للإرسال ✓' : 'اكتب اسمك وشركتك'}</div>
          <div className="phone" ref={phoneRef}>
          <div className="phone__screen">
            <div className="phone__top">
              <span className="phone__avatar" dir="ltr">
                IGMA
              </span>
              <div>
                <b>IGMA · {office}</b>
                <small>{typing ? 'يكتب الآن…' : 'متصل'}</small>
              </div>
            </div>
            <div className="phone__chat">
              <div className="bubble bubble--in">
                أهلًا بك في IGMA. احكِ لنا عن شركتك ونرتب لك عرضًا توضيحيًا.
                <span className="bubble__time">{time}</span>
              </div>
              <div className="bubble bubble--out" key={bump}>
                {text}
                <span className="bubble__time">
                  {time} {link ? '✓✓' : ''}
                </span>
              </div>
            </div>
            <div className="phone__input">
              <span>اكتب رسالة</span>
              <i>➤</i>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}
