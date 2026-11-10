import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { company, contact, hero, nav } from '../content/site'
import { Logo } from './Logo'

/**
 * Over the 3D tour the bar is open and transparent. Once the tour is behind the visitor it
 * splits into three floating islands (brand, links, request a demo), and a pill slides under
 * the section currently on screen.
 */
export function Nav() {
  const [open, setOpen] = useState(false)
  const [light, setLight] = useState(false)
  const [docked, setDocked] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const linksRef = useRef<HTMLElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  useEffect(() => {
    const check = () => {
      let on = false
      document.querySelectorAll('[data-nav="light"]').forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= 36 && r.bottom >= 36) on = true
      })
      setLight(on)
      const tour = document.getElementById('tour')
      setDocked(!!tour && tour.getBoundingClientRect().bottom < 90)
      // the section crossing the upper third of the screen is the current one
      const line = window.innerHeight * 0.35
      let hit: string | null = null
      nav.forEach((n) => {
        const el = document.getElementById(n.href.slice(1))
        if (!el || el.closest('#tour')) return
        const r = el.getBoundingClientRect()
        if (r.top <= line && r.bottom > line) hit = n.href
      })
      setCurrent(hit)
    }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('hashchange', check)
    window.addEventListener('resize', check)
    check()
    const t = window.setTimeout(check, 300)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', check)
      window.removeEventListener('hashchange', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  // place the sliding pill under the current link
  useLayoutEffect(() => {
    const box = linksRef.current
    const a = box && current ? box.querySelector<HTMLElement>(`a[href="${current}"]`) : null
    setPill(a && box ? { x: a.offsetLeft, w: a.offsetWidth } : null)
  }, [current, docked])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`nav ${light ? 'nav--ink' : ''} ${docked ? 'nav--docked' : ''} ${light && !docked ? 'nav--top' : ''}`}>
      <div className="nav__island nav__island--main">
        <a className="nav__brand" href="#top" aria-label={`${company.name}، الصفحة الرئيسية`} onClick={close} dir="ltr">
          <Logo title={company.name} live />
        </a>
        <nav className="nav__links" aria-label="القائمة الرئيسية" ref={linksRef}>
          {pill && <span className="nav__mark" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} aria-hidden="true" />}
          {nav.map((n) => (
            <a key={n.href} href={n.href} aria-current={current === n.href ? 'location' : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="nav__island nav__island--side">
        <a className="nav__talk" href="#contact">
          <i aria-hidden="true" />
          تواصل
        </a>
        <a className="nav__cta" href="#demo">
          {hero.primary}
          <span className="nav__arrow" aria-hidden="true">
            ←
          </span>
        </a>
      </div>
      <button className="nav__toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
        {open ? 'إغلاق' : 'القائمة'}
      </button>
      <div id="mobile-menu" className={`menu ${open ? 'menu--open' : ''}`} inert={!open}>
        {nav.map((n) => (
          <a key={n.href} href={n.href} onClick={close}>
            {n.label}
          </a>
        ))}
        <a className="menu__cta" href="#demo" onClick={close}>
          {hero.primary}
        </a>
        <p className="menu__phones" dir="ltr">
          {contact.egypt.phone}
          <br />
          {contact.saudi.phone}
        </p>
      </div>
    </header>
  )
}
