import type { CSSProperties } from 'react'

/**
 * The element that gives each system stop its own identity, drawn from that system's world.
 * The working-cycle steps are always the <li>s of `.steps`; the tour lights them one by one
 * as the visitor scrolls. Everything marked `deco` is illustration and is hidden on phones.
 */
export function StopArt({ id, flow }: { id: string; flow: string[] }) {
  const steps = (render?: (step: string, k: number) => React.ReactNode) => (
    <ol className="stop-steps" aria-label="دورة العمل">
      {flow.map((step, k) => (
        <li key={step} style={{ ['--k' as string]: k } as CSSProperties}>
          {render ? render(step, k) : step}
        </li>
      ))}
    </ol>
  )

  if (id === 'erp')
    // one ledger for the whole company: a single record lights up across the departments
    return (
      <div className="art ledger">
        <div className="ledger__row ledger__head deco">
          <span>السجل</span>
          <span>المشتريات</span>
          <span>المخزن</span>
          <span>المبيعات</span>
          <span>الحسابات</span>
        </div>
        <div className="ledger__row deco">
          <span>PO-117</span>
          <span>✓</span>
          <span>✓</span>
          <span>✓</span>
          <span>✓</span>
        </div>
        <div className="ledger__row ledger__live">
          <b className="deco">PO-118</b>
          {steps((s) => <span>{s}</span>)}
        </div>
        <div className="ledger__foot deco">
          <span>رقم واحد في كل الأقسام</span>
          <span>آخر تحديث: الآن</span>
        </div>
      </div>
    )

  if (id === 'logistics')
    // a waybill, stamped at each stage
    return (
      <div className="art waybill">
        <div className="waybill__top deco">
          <span>بوليصة شحن</span>
          <span dir="ltr">#2041</span>
        </div>
        <div className="waybill__fields deco">
          <span>
            <small>من</small>فرع الرياض
          </span>
          <span>
            <small>إلى</small>عميل · جدة
          </span>
          <span>
            <small>السائق</small>مسار 4
          </span>
          <span>
            <small>التحصيل</small>عند التسليم
          </span>
        </div>
        <div className="waybill__code deco" />
        {steps((s) => <span>{s}</span>)}
      </div>
    )

  if (id === 'restaurant')
    // a kitchen ticket hanging from the rail
    return (
      <div className="art ticket">
        <b className="deco">طاولة 7 · طلب #312</b>
        <ul className="ticket__items deco">
          <li>برجر لحم ×2</li>
          <li>سلطة أفوكادو</li>
          <li>كيكة فراولة</li>
        </ul>
        {steps((s) => <span>{s}</span>)}
      </div>
    )

  if (id === 'gym')
    // a membership ring that closes as the cycle goes round
    return (
      <div className="art gymring">
        <div className="gymring__dial deco">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <circle className="gymring__track" cx="18" cy="18" r="16" pathLength={100} />
            <circle className="gymring__fill" cx="18" cy="18" r="16" pathLength={100} />
          </svg>
          <span>
            <b>24</b>يوم على التجديد
          </span>
        </div>
        {steps()}
      </div>
    )

  if (id === 'hr') {
    // a staff card on a lanyard
    const vals = ['2024', '08:52', '12 يوم', 'مارس']
    return (
      <div className="art idcard">
        <span className="idcard__photo deco" />
        <b className="deco">موظف #E-214</b>
        {steps((s, k) => (
          <>
            <span>{s}</span>
            <em className="deco">{vals[k]}</em>
          </>
        ))}
      </div>
    )
  }

  if (id === 'learning')
    // the course page: progress and lessons
    return (
      <div className="art course">
        <div className="course__pct deco" aria-hidden="true">
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <div className="course__bar deco">
          <i />
        </div>
        {steps()}
      </div>
    )

  // your next system: the project stages as labels on the modules
  return <div className="art chips">{steps()}</div>
}
