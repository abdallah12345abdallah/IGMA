import { lazy, Suspense, useState } from 'react'
import { journeyCopy, systemPage, systems, type SystemContent } from '../content/site'
import { useIsMobile, useReducedMotion, useWebGLSupport } from '../hooks/useMediaFlags'
import { Demo } from './Demo'
const Showroom = lazy(() => import('../three/Showroom'))

/** One page per system, generated from its entry in content/site.ts. */
export function SystemPage({ system }: { system: SystemContent }) {
  const reduced = useReducedMotion()
  const mobile = useIsMobile()
  const webgl = useWebGLSupport()
  const [ready, setReady] = useState(false)
  const stop = systems.findIndex((s) => s.id === system.id) + 1

  return (
    <>
      <section className="sys-hero" style={{ ['--c' as string]: system.color }} aria-labelledby="sys-title">
        <div className="sys-hero__stage" aria-hidden="true">
          {webgl !== true || !ready ? <img className="sys-poster" src={`/stops/d-${stop}.webp`} alt="" /> : null}
          {webgl ? (
            <Suspense fallback={null}>
              <Showroom fixedStop={stop} centered reduced={reduced} mobile={mobile} onReady={() => setReady(true)} />
            </Suspense>
          ) : null}
        </div>
        <div className="sys-hero__copy">
          <a className="sys-back" href="#systems">
            {systemPage.back}
          </a>
          <p className="eyebrow">
            {system.name} <span aria-hidden="true">·</span> {system.market}
          </p>
          <h1 id="sys-title">{system.title}</h1>
          <p className="stop__body">{system.body}</p>
          <p className="stop__audience">
            <b>{journeyCopy.audience}</b> {system.audience}
          </p>
          <ol className="flow flow--static">
            {system.flow.map((s) => (
              <li key={s} className="is-lit">
                {s}
              </li>
            ))}
          </ol>
          <p className="stop__proof">{system.proof}</p>
          <div className="actions">
            <a className="btn btn--on" href="#demo">
              {journeyCopy.demo}
            </a>
          </div>
        </div>
      </section>

      <section className="section" data-nav="light" aria-labelledby="sys-problems">
        <div className="container split">
          <h2 id="sys-problems">{systemPage.problems}</h2>
          <ul className="problems">
            {system.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--sand2" data-nav="light" aria-labelledby="sys-cap">
        <div className="container">
          <h2 id="sys-cap" className="section-title">
            {systemPage.capabilities}
          </h2>
          <ul className="caps">
            {system.capabilities.map((c) => (
              <li key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" data-nav="light" aria-labelledby="sys-steps">
        <div className="container">
          <h2 id="sys-steps" className="section-title">
            {systemPage.stepsTitle}
          </h2>
          <ol className="steps">
            {systemPage.steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Demo key={system.id} initial={system.id} title={systemPage.demoTitle} />
    </>
  )
}
