import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { hero, journeyCopy, systems, tourStops } from '../content/site'
import { STATIONS } from '../three/stations'
import { tour } from '../three/tourState'
import { useIsMobile, useReducedMotion, useWebGLSupport } from '../hooks/useMediaFlags'
import { requestDemo } from '../demoEvents'
import { scrollToY, startSmoothScroll } from '../smoothScroll'
import { Words } from './Words'
import { IntroLoader } from './IntroLoader'
import { Rotator } from './Rotator'
import { StopArt, StopScene } from './StopArt'

const Showroom = lazy(() => import('../three/Showroom'))

const STOPS = tourStops.length + 1 // the overview + one stop per system + your next project
const TAIL = 0.5 // extra hold on the last system
const SEGMENT_SVH = 115 // scroll distance per stop: raise it for a slower tour
const HOLD = 0.5 // share of each stop where the camera rests
const STEPS_FROM = 0.12 // the steps start lighting after this share of the rest, once the content has settled
const STEPS_TO = 0.9 // and are all lit by this share
const HEADLINE_DELAY_MS = 250 // after the loader has gone and the lamp is on
const MAX_WAIT_MS = 20000 // turn on smooth scrolling after this even if the 3D is still loading

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const smooth = (v: number) => {
  const c = clamp(v, 0, 1)
  return c * c * (3 - 2 * c)
}
const SAND = '#C6C0B2'
const SCROLL_BROWN = '#7a3a12' // the scrollbar outside the tour

export function Tour() {
  const reduced = useReducedMotion()
  const mobile = useIsMobile()
  const webgl = useWebGLSupport()
  const rootRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const stopRefs = useRef<(HTMLElement | null)[]>([])
  const lit = useRef<number[]>(tourStops.map(() => -1))
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [posterGone, setPosterGone] = useState(false)
  // The still image fades into the live scene instead of being swapped in one frame.
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => setPosterGone(true), 900)
    return () => window.clearTimeout(t)
  }, [ready])
  const onReady = useCallback(() => {
    setReady(true)
  }, [])
  // The opening headline rises only after the loader hands over to the page.
  const [introDone, setIntroDone] = useState(false)
  const onIntroGone = useCallback(() => {
    // The loader has gone: drop the lamp, switch it on, then bring in the headline.
    if (tour.introAt == null) tour.introAt = performance.now()
    const wait = reduced ? 0 : HEADLINE_DELAY_MS
    window.setTimeout(() => {
      setIntroDone(true)
    }, wait)
  }, [reduced])
  const heroIn = introDone || webgl === false

  // Native scrolling stays on while the scene loads (it never stutters); the smoother
  // scrolling joins once the 3D is ready, or straight away when there is no 3D.
  useEffect(() => {
    if (ready || webgl === false) startSmoothScroll()
    if (ready || webgl !== true) return
    const give = window.setTimeout(() => startSmoothScroll(), MAX_WAIT_MS)
    return () => window.clearTimeout(give)
  }, [ready, webgl])

  const goTo = useCallback((stop: number) => {
    const root = rootRef.current
    if (!root) return
    const span = root.offsetHeight - window.innerHeight
    scrollToY(root.offsetTop + span * ((stop + 0.15) / (STOPS - 1 + TAIL)))
  }, [])

  useEffect(() => {
    tour.onPick = (i) => goTo(i + 1)
    return () => {
      tour.onPick = null
    }
  }, [goTo])

  useEffect(() => {
    const root = rootRef.current
    const pin = pinRef.current
    if (!root || !pin) return
    let raf = 0
    const read = () => {
      raf = 0
      const r = root.getBoundingClientRect()
      const span = root.offsetHeight - window.innerHeight
      const u = clamp((-r.top / span) * (STOPS - 1 + TAIL), 0, STOPS - 1)
      const k = Math.floor(u)
      const f = k + smooth((u - k - HOLD) / (1 - HOLD))
      tour.pos = f
      const idx = Math.round(f)
      setActive(idx)
      pin.style.setProperty('--c', idx === 0 ? SAND : tourStops[idx - 1].color)
      document.documentElement.style.setProperty('--sb', idx === 0 ? SCROLL_BROWN : tourStops[idx - 1].color)
      const dark = idx !== 0
      pin.dataset.tone = dark ? 'dark' : 'light'
      pin.dataset.layout = idx === 0 ? 'hero' : STATIONS[idx - 1].shot.layout
      if (!dark) pin.dataset.nav = 'light'
      else delete pin.dataset.nav
      // Light up each system's working cycle step by step while its stop holds.
      tourStops.forEach((s, i) => {
        const el = stopRefs.current[i]
        if (!el) return
        const local = clamp((u - (i + 1)) / HOLD, 0, 1)
        const p = (local - STEPS_FROM) / (STEPS_TO - STEPS_FROM)
        const n = idx === i + 1 && p >= 0 ? Math.min(s.flow.length - 1, Math.floor(p * s.flow.length)) : -1
        if (n !== lit.current[i]) {
          lit.current[i] = n
          el.querySelectorAll('.stop-steps li').forEach((li, j) => li.classList.toggle('is-lit', j <= n))
        }
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting)
        if (!e.isIntersecting) document.documentElement.style.setProperty('--sb', SCROLL_BROWN)
      },
      { rootMargin: '100px' },
    )
    io.observe(root)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      io.disconnect()
    }
  }, [])

  return (
    <div className="tour" id="tour" ref={rootRef} style={{ height: `calc(100svh + ${(STOPS - 1 + TAIL) * SEGMENT_SVH}svh)` }}>
      <span id="systems" className="tour__anchor" style={{ top: `${1.15 * SEGMENT_SVH}svh` }} />
      {webgl !== false ? <IntroLoader done={ready} reduced={reduced} onGone={onIntroGone} /> : null}
      <div className="tour__pin" ref={pinRef} data-tone="light" data-nav="light" style={{ ['--c' as string]: SAND }}>
        {webgl !== true || !posterGone ? (
          <div className={`posters ${webgl === true && ready ? 'is-fading' : ''}`} aria-hidden="true">
            {Array.from({ length: STOPS }, (_, i) => (
              <img key={i} src={`/stops/${mobile ? 'm' : 'd'}-${i}.webp`} alt="" className={i === active ? 'is-on' : ''} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            ))}
          </div>
        ) : null}
        <div className="tour__canvas" aria-hidden="true">
          {webgl ? (
            <Suspense fallback={null}>
              <Showroom reduced={reduced} mobile={mobile} intro interactive paused={!visible && ready} onReady={onReady} />
            </Suspense>
          ) : null}
        </div>
        <div className="scrim" aria-hidden="true" />

        <section className={`stop stop--hero ${active === 0 && heroIn ? 'is-active' : active > 0 ? 'is-past' : ''}`} inert={active !== 0} aria-labelledby="hero-title">
          <p className="s-meta">{hero.eyebrow}</p>
          <h1 className="s-title" id="hero-title">
            <Words text={hero.title} />{' '}
            <Rotator words={hero.rotate} colors={systems.map((s) => s.color)} run={active === 0 && heroIn} reduced={reduced} />
            <span className="s-accent">
              <Words text={hero.accent} offset={3} />
              <svg viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 9 C 60 3, 120 12, 180 6 S 270 4, 298 8" pathLength={1} />
              </svg>
            </span>
          </h1>
          <div className="s-copy">
            <p>{hero.lede}</p>
          </div>
          <div className="s-actions">
            <a className="btn btn--solid" href="#demo">
              {hero.primary}
            </a>
            <a className="btn btn--line" href="#systems" onClick={(e) => (e.preventDefault(), goTo(STOPS - 1))}>
              {hero.secondary}
            </a>
          </div>
          <div className="s-work proof">
            <span>{hero.proofLabel}</span>
            <ul>
              {hero.proof.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </section>

        {tourStops.map((s, i) => (
          <section
            key={s.id}
            ref={(el) => {
              stopRefs.current[i] = el
            }}
            className={`stop stop--${STATIONS[i].shot.layout} stop--${s.id} ${s.custom ? 'stop--custom' : ''} ${active === i + 1 ? 'is-active' : active > i + 1 ? 'is-past' : ''}`}
            inert={active !== i + 1}
            aria-labelledby={`stop-${s.id}`}
          >
            <p className="s-meta">
              <span className="s-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                {journeyCopy.counter(i)} · {s.market}
              </span>
            </p>
            <h2 className="s-title" id={`stop-${s.id}`}>
              <Words text={s.title} />
            </h2>
            <div className="s-copy">
              <p>{s.body}</p>
              <p className="s-audience">
                <b>{journeyCopy.audience}</b> {s.audience}
              </p>
              <p className="s-proof">{s.proof}</p>
            </div>
            <div className="s-work">
              <StopArt id={s.id} flow={s.flow} />
            </div>
            <StopScene id={s.id} reduced={reduced} />
            <div className="s-actions">
              {s.custom ? (
                <>
                  <a className="btn btn--solid" href="#demo" onClick={() => requestDemo('other')}>
                    {journeyCopy.customCta}
                  </a>
                  <a className="btn btn--line" href="#services">
                    {journeyCopy.customMore}
                  </a>
                </>
              ) : (
                <>
                  <a className="btn btn--solid" href="#demo" onClick={() => requestDemo(s.id as (typeof systems)[number]['id'])}>
                    {journeyCopy.demo}
                  </a>
                  <a className="btn btn--line" href={`#/systems/${s.id}`}>
                    {journeyCopy.details}
                  </a>
                </>
              )}
            </div>
          </section>
        ))}

        <nav className="rail" aria-label="محطات الجولة">
          {['الكل', ...tourStops.map((s) => s.short)].map((label, i) => (
            <button key={label} type="button" aria-current={active === i ? 'step' : undefined} onClick={() => goTo(i)}>
              <i aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
