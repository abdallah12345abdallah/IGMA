import { useEffect, useRef, useState } from 'react'
import { company } from '../content/site'
import { LAMP_DROP_MS, tour } from '../three/tourState'
import { lockScroll } from '../smoothScroll'

const MAX_WAIT_MS = 20000 // never hold the visitor longer than this
const ar = (n: number) => Math.round(n).toLocaleString('ar-EG')

/**
 * Opening screen: the IGMA wordmark fills from the bottom as the 3D files download,
 * then shrinks into the logo position in the header and the page appears.
 */
export function IntroLoader({ done, reduced, onGone }: { done: boolean; reduced: boolean; onGone?: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const solidRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const finish = done || timedOut

  useEffect(() => {
    lockScroll(true)
    const t = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS)
    return () => {
      window.clearTimeout(t)
      lockScroll(false)
    }
  }, [])

  // Follow the real download progress; hold at 99% while the scene is being prepared.
  useEffect(() => {
    if (leaving) return
    let raf = 0
    const tick = () => {
      const p = finish ? 1 : Math.min(0.99, tour.progress)
      if (solidRef.current) solidRef.current.style.clipPath = `inset(${(1 - p) * 140 - 40}% -40% -40% -40%)`
      if (pctRef.current) pctRef.current.textContent = `${ar(p * 100)}٪`
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [finish, leaving])

  // Exit: the wordmark flies to the header logo, then the cover fades.
  useEffect(() => {
    if (!finish || leaving) return
    const hold = window.setTimeout(() => {
      const mark = markRef.current
      const logo = document.querySelector('.nav__brand')
      if (mark && logo && !reduced) {
        const a = mark.getBoundingClientRect()
        const b = logo.getBoundingClientRect()
        const s = b.height / a.height
        const dx = b.left + b.width / 2 - (a.left + a.width / 2)
        const dy = b.top + b.height / 2 - (a.top + a.height / 2)
        mark.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`
      }
      // The lamp is already hanging in place behind the dark; it switches on now, in step with the dark clearing.
      tour.introAt = performance.now() - LAMP_DROP_MS
      setLeaving(true)
    }, 260)
    return () => window.clearTimeout(hold)
  }, [finish, leaving, reduced])

  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(() => {
      lockScroll(false)
      setGone(true)
      onGone?.()
    }, reduced ? 250 : 1100)
    return () => window.clearTimeout(t)
  }, [leaving, reduced, onGone])

  if (gone) return null
  return (
    <div className={`intro-loader ${leaving ? 'is-leaving' : ''}`} ref={wrapRef} role="status" aria-live="polite" aria-label="جاري تحميل الموقع">
      <div className="intro-loader__mark" ref={markRef} dir="ltr" aria-hidden="true">
        <span className="intro-loader__outline">{company.name}</span>
        <span className="intro-loader__solid" ref={solidRef}>
          {company.name}
        </span>
      </div>
      <span className="intro-loader__pct" ref={pctRef}>
        ٠٪
      </span>
    </div>
  )
}
