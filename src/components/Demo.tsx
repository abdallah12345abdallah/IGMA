import { useEffect, useState } from 'react'
import { contact, demo, markets, systems, type SystemId } from '../content/site'
import { onDemoRequest } from '../demoEvents'

type Market = 'egypt' | 'saudi'
const OTHER = 'other'

/** Words that point to each system or market in what the visitor writes. Checked in this order. */
const SYSTEM_WORDS: [string, RegExp][] = [
  ['restaurant', /مطعم|مطاعم|كافيه|كافي|مقهى|مطبخ|طاولة|طاولات|كاشير|منيو/i],
  ['logistics', /شحن|شحنات|توصيل|سائق|سواق|لوجست|مندوب/i],
  ['gym', /جيم|نادي|صالة رياض|رياضي|أعضاء|اشتراكات الأعضاء/i],
  ['hr', /موظف|رواتب|حضور|انصراف|إجاز|اجاز|توظيف|\bhr\b/i],
  ['learning', /تعليم|دورات|كورس|طلاب|طالب|أكاديم|اكاديم|محتوى/i],
  ['erp', /erp|حسابات|محاسب|مخزن|مخزون|مشتريات|فواتير|أتمت|اتمت|موافق|مصنع|توزيع|excel|إكسل|اكسل/i],
  [OTHER, /نظام خاص|خاص فينا|خاص بنا|موقع|تطبيق|ربط/i],
]
const MARKET_WORDS: [Market, RegExp][] = [
  ['egypt', /مصر|القاهرة|الجيزة|إسكندرية|اسكندرية|المنصورة/],
  ['saudi', /السعودية|الرياض|جدة|الدمام|مكة|المدينة|الخبر/],
]
const PROMPTS = ['عندي مطعمين في الرياض والطلبات بتضيع', 'شركة شحن في السعودية وبدنا نتابع السائقين', 'مصنع في مصر والمخزون كله على Excel', 'بدنا نظام خاص لطريقة شغلنا']

/**
 * Demo request in one smart line: the visitor describes the business in their own words,
 * the page picks up the system and the market from them (both can be changed with a tap),
 * and a WhatsApp message is prepared for the right office. There is no server.
 */
export function Demo({ initial, title }: { initial?: SystemId; title?: string }) {
  const [story, setStory] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [system, setSystem] = useState<string>(initial ?? systems[0].id)
  const [market, setMarket] = useState<Market>('egypt')
  const [errors, setErrors] = useState<{ name?: string; company?: string }>({})
  const [link, setLink] = useState<string | null>(null)

  useEffect(() => onDemoRequest((id) => setSystem(id)), [])

  const read = (text: string) => {
    setStory(text)
    const sys = SYSTEM_WORDS.find(([, re]) => re.test(text))
    if (sys) setSystem(sys[0])
    const mk = MARKET_WORDS.find(([, re]) => re.test(text))
    if (mk) setMarket(mk[0])
  }

  const sys = systems.find((s) => s.id === system)
  const sysLabel = sys?.name ?? demo.other
  const office = markets.regions.find((r) => r.id === market)?.name ?? ''
  const ready = !!name.trim() && !!company.trim()

  const cycleSystem = () => {
    const ids = [...systems.map((s) => s.id as string), OTHER]
    setSystem(ids[(ids.indexOf(system) + 1) % ids.length])
  }

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
    const text = [`طلب عرض توضيحي: ${sysLabel}`, `الاسم: ${name.trim()}`, `الشركة: ${company.trim()}`, story.trim() ? `التفاصيل: ${story.trim()}` : '']
      .filter(Boolean)
      .join('\n')
    const url = `https://wa.me/${contact[market].whatsapp}?text=${encodeURIComponent(text)}`
    setLink(url)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <section className="demo sm" id="demo" data-nav="light" aria-labelledby="demo-title">
      <div className="container">
        <header className="sm__head">
          <p className="kicker">{demo.kicker}</p>
          <h2 id="demo-title">{title ?? 'احكِ لنا عن شركتك بكلماتك.'}</h2>
        </header>

        {link ? (
          <div className="sm__done" role="status">
            <h3>{demo.sentTitle}</h3>
            <p>{demo.sentBody}</p>
            <div className="sm__actions">
              <a className="sm__send" href={link} target="_blank" rel="noreferrer">
                {demo.sentLink}
              </a>
              <button type="button" className="sm__again" onClick={() => setLink(null)}>
                {demo.again}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="sm__box">
              <div className="sm__in">
                <label className="sr-only" htmlFor="demo-story">
                  احكِ لنا عن شركتك وما الذي تريد تحسينه
                </label>
                <textarea id="demo-story" rows={2} value={story} onChange={(e) => read(e.target.value)} placeholder="مثلًا: عندي مطعمين في الرياض والطلبات بتضيع بين الصالة والمطبخ" />
                <div className="sm__tags">
                  <button type="button" className="sm__tag" style={{ ['--c' as string]: sys?.color ?? '#0a1916' }} onClick={cycleSystem} aria-label={`النظام: ${sysLabel}. اضغط للتغيير`}>
                    <small>النظام</small> {sys?.short ?? 'نظام خاص'}
                  </button>
                  <button type="button" className="sm__tag" onClick={() => setMarket(market === 'egypt' ? 'saudi' : 'egypt')} aria-label={`المكتب: ${office}. اضغط للتغيير`}>
                    <small>المكتب</small> {office}
                  </button>
                  <span className={`sm__tag ${name.trim() ? 'is-set' : 'is-empty'}`}>{name.trim() ? <><small>الاسم</small> {name.trim()}</> : 'اسمك؟'}</span>
                  <span className={`sm__tag ${company.trim() ? 'is-set' : 'is-empty'}`}>{company.trim() ? <><small>الشركة</small> {company.trim()}</> : 'شركتك؟'}</span>
                  <button className="sm__send" type="submit" aria-disabled={!ready}>
                    أرسل
                  </button>
                </div>
              </div>
            </div>

            <div className="sm__prompts">
              {PROMPTS.map((p) => (
                <button key={p} type="button" onClick={() => read(p)}>
                  {p}
                </button>
              ))}
            </div>

            <div className="sm__who">
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
            </div>
            <p className="sm__fine">نفهم من كلامك النظام والبلد، وتقدر تغيّرهم بالضغط على الوسم.</p>
          </form>
        )}
      </div>
    </section>
  )
}
