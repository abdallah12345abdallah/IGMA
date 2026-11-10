import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Nav } from './components/Nav'
import { BackToTop } from './components/BackToTop'
import { Tour } from './components/Tour'
import { Clients, Footer, Markets, Plans, Services } from './components/Sections'
import { Demo } from './components/Demo'
import { SystemPage } from './components/SystemPage'
import { systems } from './content/site'
import { scrollToEl, scrollToY, startSmoothScroll } from './smoothScroll'

const Showroom = lazy(() => import('./three/Showroom'))

/** Hash routes keep the site deployable on any static host: `#/systems/erp`. */
function parseRoute() {
  const m = window.location.hash.match(/^#\/systems\/([a-z]+)/)
  return m ? (systems.find((s) => s.id === m[1]) ?? null) : null
}

/** Dev-only view used to render the fallback images: `/?capture=<stop>&m=1`. */
function Capture({ stop, mobile }: { stop: number; mobile: boolean }) {
  return (
    <div id="capture" style={{ position: 'fixed', inset: 0 }}>
      <Suspense fallback={null}>
        <Showroom reduced mobile={mobile} fixedStop={stop} dpr={1} onReady={() => setTimeout(() => document.body.setAttribute('data-captured', '1'), 600)} />
      </Suspense>
    </div>
  )
}

export default function App() {
  const [system, setSystem] = useState(parseRoute)
  const [pending, setPending] = useState<string | null>(null)
  const current = useRef(system)
  const params = new URLSearchParams(window.location.search)
  const capture = params.get('capture')

  // The home tour starts smooth scrolling itself once its 3D is ready; other pages start it now.
  useEffect(() => {
    if (capture === null && system) startSmoothScroll()
  }, [capture, system])

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash
      const cur = current.current
      // A system page has its own demo form, so stay on the page.
      if (cur && hash === '#demo') {
        history.replaceState(null, '', `#/systems/${cur.id}`)
        const el = document.getElementById('demo')
        if (el) scrollToEl(el)
        return
      }
      const next = parseRoute()
      current.current = next
      setSystem(next)
      if (next) scrollToY(0, true)
      else if (cur && hash.length > 1) setPending(hash)
      else if (cur) scrollToY(0, true)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Coming back from a system page to a section of the home page.
  useEffect(() => {
    if (!pending || system) return
    const t = window.setTimeout(() => {
      const el = document.querySelector(pending)
      if (el) scrollToEl(el, true)
      setPending(null)
    }, 80)
    return () => window.clearTimeout(t)
  }, [pending, system])

  if (capture !== null) return <Capture stop={Number(capture)} mobile={params.has('m')} />

  return (
    <>
      <a className="skip" href="#main">
        تخطَّ إلى المحتوى
      </a>
      <span id="top" />
      <Nav />
      <main id="main">
        {system ? (
          <SystemPage key={system.id} system={system} />
        ) : (
          <>
            <Tour />
            <Services />
            <Markets />
            <Plans />
            <Clients />
            <Demo />
          </>
        )}
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
