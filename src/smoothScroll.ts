import Lenis from 'lenis'

let lenis: Lenis | null = null

/** Smooth scrolling with Lenis. Skipped entirely when the visitor prefers reduced motion. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({ autoRaf: true, lerp: 0.11, smoothWheel: true })
  document.documentElement.classList.add('has-lenis')

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

/** Holds the page still while the 3D scene finishes loading. */
export function lockScroll(on: boolean) {
  document.documentElement.classList.toggle('is-locked', on)
  if (lenis) {
    if (on) lenis.stop()
    else lenis.start()
  }
}
