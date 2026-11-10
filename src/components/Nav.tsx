import { useEffect, useState } from 'react'
import { company, contact, hero, nav } from '../content/site'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [light, setLight] = useState(false)

  useEffect(() => {
    const check = () => {
      const sections = document.querySelectorAll('[data-nav="light"]')
      let on = false
      sections.forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= 36 && r.bottom >= 36) on = true
      })
      setLight(on)
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
    <header className={`nav ${light ? 'nav--ink' : ''}`}>
      <a className="nav__brand" href="#top" aria-label={`${company.name}، الصفحة الرئيسية`} onClick={close} dir="ltr">
        {company.name}
      </a>
      <nav className="nav__links" aria-label="القائمة الرئيسية">
        {nav.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      <a className="nav__cta" href="#demo">
        {hero.primary}
      </a>
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
