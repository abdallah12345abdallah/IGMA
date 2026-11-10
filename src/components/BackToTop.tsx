import { useEffect, useRef, useState } from 'react'
import { scrollToY } from '../smoothScroll'

/**
 * Back to the top: a slim capsule on the right with an arrow, how far down the page the
 * visitor is, and a line along its edge that fills with it. Appears once the 3D tour is behind.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const pct = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const tour = document.getElementById('tour')
      setShown(!!tour && tour.getBoundingClientRect().bottom < 90)
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      btn.current?.style.setProperty('--p', String(p))
      if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <button ref={btn} type="button" className={`totop ${shown ? 'is-shown' : ''}`} onClick={() => scrollToY(0)} aria-label="العودة إلى أعلى الصفحة" tabIndex={shown ? 0 : -1}>
      <span className="totop__arrow" aria-hidden="true">
        <i>↑</i>
      </span>
      <span className="totop__pct" ref={pct} aria-hidden="true" dir="ltr">
        0%
      </span>
      <span className="totop__line" aria-hidden="true" />
    </button>
  )
}
