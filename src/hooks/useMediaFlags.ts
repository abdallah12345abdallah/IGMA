import { useEffect, useState } from 'react'

function useMediaQuery(query: string) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** True when the OS asks for reduced motion. All scroll/pointer animation is gated on this. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** True on narrow viewports (used to lower 3D quality and simplify layout decisions). */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}

/** Detects WebGL support once. Returns null while unknown, then true/false. */
export function useWebGLSupport() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl2') || c.getContext('webgl')
      setOk(!!gl)
    } catch {
      setOk(false)
    }
  }, [])
  return ok
}
