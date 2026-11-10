import { useEffect, useState } from 'react'
import { tour } from '../three/tourState'

/** How long each system holds in the opening view; the 3D swap follows the same beat. */
export const ROTATE_MS = 5200

/**
 * A headline word that changes every couple of seconds, each in its own colour.
 * All words share one grid cell so the line never jumps in width.
 */
export function Rotator({ words, colors, run, reduced }: { words: string[]; colors: string[]; run: boolean; reduced: boolean }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!run || reduced) return
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), ROTATE_MS)
    return () => window.clearInterval(id)
  }, [run, reduced, words.length])
  // the 3D scene shows the same system as the word
  useEffect(() => {
    tour.heroIdx = i
    window.dispatchEvent(new CustomEvent('hero-rotate', { detail: i }))
  }, [i])
  const prev = (i - 1 + words.length) % words.length
  return (
    <span className="w rot-wrap" style={{ ['--i' as string]: 2 }}>
      <span className="rot" aria-live="off">
        <span className="sr-only">{words.join('، ')}</span>
        {words.map((w, n) => (
          <span key={w} aria-hidden="true" className={`rot__w ${n === i ? 'is-on' : n === prev ? 'is-out' : ''}`} style={{ ['--wc' as string]: colors[n % colors.length] }}>
            {w}
          </span>
        ))}
      </span>
    </span>
  )
}
