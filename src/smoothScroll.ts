import Lenis from 'lenis'

let lenis: Lenis | null = null

/** Smooth scrolling with Lenis. Skipped entirely when the visitor prefers reduced motion. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({ autoRaf: true, lerp: 0.11, smoothWheel: true })
  document.documentElement.classList.add('has-lenis')
  // Respect a lock that was set before smooth scrolling existed (the opening loader).
  if (document.documentElement.classList.contains('is-locked')) lenis.stop()

  // In-page links (#services, #demo...) glide instead of jumping.
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element).closest('a[href^="#"]') as HTMLAnchorElement | null
    if (!a || !lenis) return
    const hash = a.getAttribute('href') ?? ''
    if (hash.length < 2 || hash.startsWith('#/')) return
    const el = document.getElementById(hash.slice(1))
    if (!el || window.location.hash.startsWith('#/')) return
    e.preventDefault()
    history.replaceState(null, '', hash)
    lenis.scrollTo(el, { offset: 0 })
  }
  document.addEventListener('click', onClick)
  return () => {
    document.removeEventListener('click', onClick)
    lenis?.destroy()
    lenis = null
    document.documentElement.classList.remove('has-lenis')
  }
}

export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate })
  else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' })
}

export function scrollToEl(el: Element, immediate = false) {
  if (lenis) lenis.scrollTo(el as HTMLElement, { immediate })
  else el.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth' })
}

const block = (e: Event) => e.preventDefault()
const KEYS = new Set([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'])
const blockKeys = (e: KeyboardEvent) => {
  if (KEYS.has(e.key)) e.preventDefault()
}

/** Freezes the page (used while the opening plays). overflow:hidden alone does not stop wheel scrolling in every browser. */
export function lockScroll(on: boolean) {
  document.documentElement.classList.toggle('is-locked', on)
  const opts = { passive: false } as AddEventListenerOptions
  if (on) {
    window.scrollTo(0, 0)
    window.addEventListener('wheel', block, opts)
    window.addEventListener('touchmove', block, opts)
    window.addEventListener('keydown', blockKeys)
  } else {
    window.removeEventListener('wheel', block, opts)
    window.removeEventListener('touchmove', block, opts)
    window.removeEventListener('keydown', blockKeys)
  }
  if (lenis) {
    if (on) lenis.stop()
    else lenis.start()
  }
}
