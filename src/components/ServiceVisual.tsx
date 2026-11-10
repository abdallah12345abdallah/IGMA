/**
 * A small live illustration for each service: always running, no scroll trigger.
 * Pure SVG and CSS so it costs almost nothing.
 */
export type ServiceKind = 'flow' | 'code' | 'nodes' | 'web'

export function ServiceVisual({ kind }: { kind: ServiceKind }) {
  if (kind === 'code')
    return (
      <div className="sv sv--code" aria-hidden="true">
        <i>
          <b>const</b> order = <b>await</b> igma.create(<em>'purchase'</em>)
        </i>
        <i>
          <u>// manager approval</u>
        </i>
        <i>
          <b>if</b> (order.total &gt; limit) approve(order)
        </i>
        <i>
          notify(<em>'warehouse'</em>, order.id)
        </i>
        <i>
          <u>// done ✓</u>
        </i>
      </div>
    )
  if (kind === 'web')
    return (
      <div className="sv sv--web" aria-hidden="true">
        <div className="sv-browser">
          <div className="sv-top">
            <span />
            <span />
            <span />
          </div>
          <div className="sv-blk sv-blk--hero" />
          <div className="sv-blk" />
          <div className="sv-blk" />
          <div className="sv-row">
            <div className="sv-blk" />
            <div className="sv-blk" />
            <div className="sv-blk" />
          </div>
        </div>
      </div>
    )
  if (kind === 'nodes') {
    const n: [number, number, string][] = [
      [70, 60, 'ERP'],
      [330, 60, 'المتجر'],
      [70, 200, 'البنك'],
      [330, 200, 'الشحن'],
    ]
    return (
      <svg className="sv" viewBox="0 0 400 260" aria-hidden="true">
        {n.map(([x, y]) => (
          <path key={x + '' + y} d={`M${x} ${y} L200 130`} className="sv-line" />
        ))}
        {n.map(([x, y], i) => (
          <circle key={'d' + i} r="4" className="sv-dot">
            <animateMotion dur={`${1.6 + i * 0.35}s`} repeatCount="indefinite" path={`M${x} ${y} L200 130`} />
          </circle>
        ))}
        <circle cx="200" cy="130" r="34" className="sv-hub" />
        <text x="200" y="136" textAnchor="middle" className="sv-lbl sv-lbl--b">
          IGMA
        </text>
        {n.map(([x, y, l]) => (
          <g key={l}>
            <circle cx={x} cy={y} r="27" className="sv-node" />
            <text x={x} y={y + 5} textAnchor="middle" className="sv-lbl">
              {l}
            </text>
          </g>
        ))}
      </svg>
    )
  }
  const st: [number, string][] = [
    [330, 'طلب شراء'],
    [200, 'موافقة المدير'],
    [70, 'إشعار المخزن'],
  ]
  return (
    <svg className="sv" viewBox="0 0 400 260" aria-hidden="true">
      <path d="M70 120 L330 120" className="sv-line" />
      <circle r="6" className="sv-dot">
        <animateMotion dur="2.8s" repeatCount="indefinite" path="M330 120 L70 120" />
      </circle>
      {st.map(([x, l], i) => (
        <g key={l}>
          <rect x={x - 56} y="84" width="112" height="72" rx="10" className="sv-node" />
          <text x={x} y="126" textAnchor="middle" className="sv-lbl">
            {l}
          </text>
          <circle cx={x - 44} cy="96" r="6" className="sv-pulse" style={{ animationDelay: `${i * 0.9}s` }} />
        </g>
      ))}
      <text x="200" y="210" textAnchor="middle" className="sv-lbl sv-lbl--dim">
        بدون رسائل ولا جداول
      </text>
    </svg>
  )
}
