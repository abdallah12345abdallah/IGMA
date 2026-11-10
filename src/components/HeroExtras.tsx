import { useEffect, useState } from 'react'
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
