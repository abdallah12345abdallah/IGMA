import { useEffect, useRef, useState } from 'react'
import { ROTATE_MS } from './Rotator'

/**
 * Six short bars in the systems' colours under the opening headline. The bar of the system
 * on screen fills over the time it is shown, so visitors see there are six and which one
 * this is.
 */
export function HeroTicks({ colors, run }: { colors: string[]; run: boolean }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const on = (e: Event) => setI((e as CustomEvent<number>).detail)
    window.addEventListener('hero-rotate', on)
    return () => window.removeEventListener('hero-rotate', on)
  }, [])
  return (
    <span className={`hero-ticks ${run ? 'is-run' : ''}`} aria-hidden="true">
      {colors.map((c, n) => (
        <i key={c + n} className={n === i ? 'is-on' : n < i ? 'is-done' : ''} style={{ ['--tc' as string]: c, ['--dur' as string]: `${ROTATE_MS}ms` }}>
          {n === i && <b key={i} />}
        </i>
      ))}
    </span>
  )
}

/**
 * Fine dust drifting in the lamp's beam over the opening view. Large screens only; it runs
 * only while the opening view is on screen and the tab is visible.
 */
export function LampDust({ on }: { on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv || !on) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) return
    const ctx = cv.getContext('2d')!
    let W = 0
    let H = 0
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = cv.clientWidth
      H = cv.clientHeight
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    // the beam: a cone from just under the lamp down to the floor
    const apex = () => ({ x: W * 0.5, y: H * 0.26 })
    const halfAt = (y: number) => Math.max(0, (y - apex().y) * 0.42)
    type M = { x: number; y: number; r: number; vx: number; vy: number; ph: number; tw: number }
    const spawn = (anywhere: boolean): M => {
      const a = apex()
      const y = anywhere ? a.y + Math.random() * (H * 0.95 - a.y) : H * 0.95
      const h = halfAt(y)
      return { x: a.x + (Math.random() * 2 - 1) * h, y, r: 0.6 + Math.random() * 1.6, vx: (Math.random() - 0.5) * 0.08, vy: -(0.05 + Math.random() * 0.12), ph: Math.random() * 6.28, tw: 0.4 + Math.random() * 1.2 }
    }
    const motes = Array.from({ length: 90 }, () => spawn(true))
    let raf = 0
    let t = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      t += 1 / 60
      ctx.clearRect(0, 0, W, H)
      const a = apex()
      for (let k = 0; k < motes.length; k++) {
        const m = motes[k]
        m.x += m.vx + Math.sin(t * 0.6 + m.ph) * 0.08
        m.y += m.vy
        const h = halfAt(m.y)
        const off = Math.abs(m.x - a.x) / Math.max(1, h)
        if (m.y < a.y + 8 || off > 1.05) {
          motes[k] = spawn(false)
          continue
        }
        // brighter in the middle of the beam, fading towards its edges and its top
        const edge = 1 - Math.min(1, off) ** 2
        const top = Math.min(1, (m.y - a.y) / (H * 0.12))
        const alpha = (0.18 + 0.32 * (0.5 + 0.5 * Math.sin(t * m.tw + m.ph))) * edge * top
        ctx.fillStyle = `rgba(255, 246, 225, ${alpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, 6.283)
        ctx.fill()
      }
    }
    frame()
    window.addEventListener('resize', size)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      ctx.clearRect(0, 0, W, H)
    }
  }, [on])
  return <canvas ref={ref} className={`lamp-dust ${on ? 'is-on' : ''}`} aria-hidden="true" />
}
