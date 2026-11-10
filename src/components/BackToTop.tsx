import { useEffect, useRef, useState } from 'react'
import { scrollToY } from '../smoothScroll'

/**
 * Back to the top. Appears once the 3D tour is behind the visitor; the line around its edge
 * fills with how far down the page they are.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false)
  const ring = useRef<SVGRectElement>(null)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const tour = document.getElementById('tour')
      setShown(!!tour && tour.getBoundingClientRect().bottom < 90)
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      ring.current?.style.setProperty('stroke-dashoffset', String(100 - p * 100))
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
    <button type="button" className={`totop ${shown ? 'is-shown' : ''}`} onClick={() => scrollToY(0)} aria-label="العودة إلى أعلى الصفحة" tabIndex={shown ? 0 : -1}>
      <span className="totop__label" aria-hidden="true">
        للأعلى
      </span>
      <span className="totop__box" aria-hidden="true">
        <svg viewBox="0 0 52 52">
          <rect className="totop__track" x="1.5" y="1.5" width="49" height="49" rx="9" pathLength={100} />
          <rect ref={ring} className="totop__ring" x="1.5" y="1.5" width="49" height="49" rx="9" pathLength={100} />
        </svg>
        <span className="totop__arrow">↑</span>
      </span>
    </button>
  )
}
