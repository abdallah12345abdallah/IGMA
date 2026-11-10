import { useEffect, useRef, useState } from 'react'
import { scrollToY } from '../smoothScroll'

/**
 * Back to the top: a burnt-brown square on the right inside a thin amber frame that fills
 * with how far down the page the visitor is. It leans slightly towards the pointer.
 * Appears once the 3D tour is behind the visitor.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const frame = useRef<SVGRectElement>(null)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const tour = document.getElementById('tour')
      setShown(!!tour && tour.getBoundingClientRect().bottom < 90)
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      frame.current?.style.setProperty('stroke-dashoffset', String(100 - p * 100))
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

  // a slight pull towards the pointer
  const lean = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`)
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height - 0.5) * 10}px`)
  }
  const rest = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty('--mx', '0px')
    e.currentTarget.style.setProperty('--my', '0px')
  }

  return (
    <button
      ref={btn}
      type="button"
      className={`totop ${shown ? 'is-shown' : ''}`}
      onClick={() => scrollToY(0)}
      onPointerMove={lean}
      onPointerLeave={rest}
      aria-label="العودة إلى أعلى الصفحة"
      tabIndex={shown ? 0 : -1}
    >
      <svg className="totop__frame" viewBox="0 0 66 66" aria-hidden="true">
        <rect className="totop__track" x="1" y="1" width="64" height="64" rx="13" pathLength={100} />
        <rect ref={frame} className="totop__fill" x="1" y="1" width="64" height="64" rx="13" pathLength={100} />
      </svg>
      <span className="totop__box" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
        </svg>
      </span>
    </button>
  )
}
