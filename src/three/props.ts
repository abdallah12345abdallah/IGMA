/**
 * Props we build ourselves where no good free scan exists (gym gear, a shipping pallet).
 * Sizes are real-world metres so they sit naturally next to the scanned models.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const CHROME = new THREE.MeshStandardMaterial({ color: '#d5d9dc', metalness: 1, roughness: 0.18 })
const RUBBER = new THREE.MeshStandardMaterial({ color: '#17181a', roughness: 0.82 })
const CAST = new THREE.MeshStandardMaterial({ color: '#232527', metalness: 0.55, roughness: 0.55 })

/** A rubber hex dumbbell, about 30 cm long. */
export function dumbbell() {
  const g = new THREE.Group()
  const hex = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6
    if (i === 0) hex.moveTo(Math.cos(a) * 0.062, Math.sin(a) * 0.062)
    else hex.lineTo(Math.cos(a) * 0.062, Math.sin(a) * 0.062)
  }
  hex.closePath()
  const head = new THREE.ExtrudeGeometry(hex, { depth: 0.036, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.005, bevelSegments: 3 })
  head.translate(0, 0, -0.018).rotateY(Math.PI / 2)
  ;[-1, 1].forEach((d) => {
    const m = new THREE.Mesh(head, RUBBER)
    m.position.x = d * 0.082
    g.add(m)
  })
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.14, 24).rotateZ(Math.PI / 2), CHROME))
  return g
}

/** A cast-iron kettlebell, 16 kg size. */
export function kettlebell() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.105, 40, 28), CAST)
  body.scale.set(1, 0.92, 1)
  body.position.y = 0.097
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.072, 0.012, 32), CAST)
  foot.position.y = 0.006
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 16, 40, Math.PI), CAST)
  handle.position.y = 0.2
  handle.scale.set(1, 0.85, 1)
  const leg = new THREE.CylinderGeometry(0.016, 0.016, 0.06, 16)
  ;[-1, 1].forEach((d) => {
    const m = new THREE.Mesh(leg, CAST)
    m.position.set(d * 0.07, 0.175, 0)
    g.add(m)
  })
  g.add(body, foot, handle)
  return g
}

/** A short stack of rubber bumper plates. */
export function plates() {
  const g = new THREE.Group()
  const sizes = [0.225, 0.225, 0.19, 0.16]
  let y = 0
  sizes.forEach((r, i) => {
    const t = i < 2 ? 0.06 : 0.045
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 56), RUBBER)
    disc.position.y = y + t / 2
    disc.rotation.y = i * 0.7
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, t + 0.004, 32), CHROME)
    hub.position.y = y + t / 2
    g.add(disc, hub)
    y += t
  })
  return g
}

/** A standard wooden shipping pallet, 1.2 x 0.8 m. */
export function pallet() {
  const g = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({ color: '#b8935f', roughness: 0.92 })
  const woodDark = new THREE.MeshStandardMaterial({ color: '#9c7a4a', roughness: 0.95 })
  const board = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.004), m)
    b.position.set(x, y + h / 2, z)
    g.add(b)
  }
  // bottom boards
  ;[-0.34, 0, 0.34].forEach((z) => board(1.2, 0.022, 0.1, 0, 0, z, woodDark))
  // blocks
  ;[-0.55, 0, 0.55].forEach((x) => [-0.34, 0, 0.34].forEach((z) => board(0.1, 0.078, 0.1, x, 0.022, z, woodDark)))
  // stringers
  ;[-0.34, 0, 0.34].forEach((z) => board(1.2, 0.022, 0.1, 0, 0.1, z, wood))
  // top deck
  for (let i = 0; i < 7; i++) board(0.1, 0.022, 0.8, -0.55 + i * (1.1 / 6), 0.122, 0, i % 2 ? wood : woodDark)
  return g
}

const STEEL = new THREE.MeshStandardMaterial({ color: '#b9c0c5', metalness: 1, roughness: 0.24 })
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: '#9aa1a6', metalness: 1, roughness: 0.4 })
const CERAMIC = new THREE.MeshStandardMaterial({ color: '#f4f2ee', roughness: 0.25 })

/** A stainless-steel kitchen prep counter with an undershelf, 1.4 x 0.65 m, 90 cm high. */
export function steelCounter() {
  const g = new THREE.Group()
  const W = 1.4
  const D = 0.65
  const H = 0.9
  const top = new THREE.Mesh(new RoundedBoxGeometry(W, 0.04, D, 3, 0.008), STEEL)
  top.position.y = H - 0.02
  const splash = new THREE.Mesh(new RoundedBoxGeometry(W, 0.1, 0.02, 3, 0.006), STEEL)
  splash.position.set(0, H + 0.05, -D / 2 + 0.01)
  const shelf = new THREE.Mesh(new RoundedBoxGeometry(W - 0.08, 0.02, D - 0.08, 2, 0.005), STEEL_DARK)
  shelf.position.y = 0.2
  g.add(top, splash, shelf)
  const leg = new THREE.CylinderGeometry(0.02, 0.02, H - 0.04, 16)
  ;[-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = new THREE.Mesh(leg, STEEL)
      l.position.set(sx * (W / 2 - 0.05), (H - 0.04) / 2, sz * (D / 2 - 0.05))
      g.add(l)
    }),
  )
  // stacked steel trays on the undershelf
  for (let i = 0; i < 2; i++)
    for (let k = 0; k < 3; k++) {
      const tray = new THREE.Mesh(new RoundedBoxGeometry(0.53, 0.065, 0.32, 2, 0.012), STEEL_DARK)
      tray.position.set(-0.32 + i * 0.6, 0.245 + k * 0.068, 0)
      g.add(tray)
    }
  return g
}

/** A stainless stock pot with a lid. */
export function stockPot() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 48, 1, true), STEEL)
  body.position.y = 0.11
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.01, 48), STEEL_DARK)
  base.position.y = 0.005
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.135, 48, 12, 0, Math.PI * 2, 0, 0.35), STEEL)
  lid.position.y = 0.22 - 0.13 * Math.cos(0.35) + 0.005
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), STEEL_DARK)
  knob.position.y = 0.262
  const handle = new THREE.TorusGeometry(0.03, 0.007, 8, 20, Math.PI)
  ;[-1, 1].forEach((d) => {
    const h = new THREE.Mesh(handle, STEEL)
    h.position.set(d * 0.135, 0.18, 0)
    h.rotation.set(0, d > 0 ? -Math.PI / 2 : Math.PI / 2, -Math.PI / 2)
    g.add(h)
  })
  g.add(body, base, lid, knob)
  return g
}

/** A white serving plate. */
export function plate() {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.018, 48), CERAMIC)
  p.position.y = 0.009
  const g = new THREE.Group()
  g.add(p)
  return g
}

const MATTE_BLACK = new THREE.MeshStandardMaterial({ color: '#1b1c1e', roughness: 0.55, metalness: 0.3 })
const PAD = new THREE.MeshStandardMaterial({ color: '#202124', roughness: 0.7 })

/** A modern adjustable weight bench, about 1.25 m long. */
export function bench() {
  const g = new THREE.Group()
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.07, 0.3, 4, 0.03), PAD)
  seat.position.set(0.32, 0.47, 0)
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.07, 0.3, 4, 0.03), PAD)
  back.position.set(-0.22, 0.6, 0)
  back.rotation.z = -0.4
  const rail = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.06, 0.08, 2, 0.01), MATTE_BLACK)
  rail.position.set(0, 0.25, 0)
  rail.rotation.z = 0.02
  const footF = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.05, 0.5, 2, 0.01), MATTE_BLACK)
  footF.position.set(0.55, 0.025, 0)
  const footB = footF.clone()
  footB.position.x = -0.55
  const postF = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.24, 0.06, 2, 0.008), MATTE_BLACK)
  postF.position.set(0.52, 0.14, 0)
  const postB = postF.clone()
  postB.position.x = -0.52
  const seatPost = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.2, 0.06, 2, 0.008), MATTE_BLACK)
  seatPost.position.set(0.32, 0.35, 0)
  const backPost = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.4, 0.05, 2, 0.008), MATTE_BLACK)
  backPost.position.set(-0.12, 0.42, 0)
  backPost.rotation.z = 0.5
  g.add(seat, back, rail, footF, footB, postF, postB, seatPost, backPost)
  return g
}

/** A two-tier rack with five pairs of hex dumbbells. */
export function dumbbellRack() {
  const g = new THREE.Group()
  const W = 1.2
  const frame = (x: number) => {
    const leg = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.72, 0.05, 2, 0.008), MATTE_BLACK)
    leg.position.set(x, 0.36, 0)
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.04, 0.5, 2, 0.008), MATTE_BLACK)
    foot.position.set(x, 0.02, 0)
    g.add(leg, foot)
  }
  frame(-W / 2 + 0.04)
  frame(W / 2 - 0.04)
  const tiers = [
    { y: 0.4, z: 0.1, tilt: 0.25 },
    { y: 0.68, z: -0.06, tilt: 0.25 },
  ]
  tiers.forEach((t, k) => {
    const shelf = new THREE.Mesh(new RoundedBoxGeometry(W, 0.03, 0.22, 2, 0.008), MATTE_BLACK)
    shelf.position.set(0, t.y, t.z)
    shelf.rotation.x = t.tilt
    g.add(shelf)
    for (let i = 0; i < 5; i++) {
      const d = dumbbell()
      const s = (k ? 0.85 : 1.15) - i * 0.07
      d.scale.setScalar(s)
      d.position.set(-0.45 + i * 0.225, t.y + 0.07 * s, t.z)
      d.rotation.set(t.tilt, Math.PI / 2, 0)
      g.add(d)
    }
  })
  return g
}

/** A competition kettlebell in its weight colour. */
export function kettlebellColor(color: string) {
  const g = kettlebell()
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.15 })
  g.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh) mesh.material = m
  })
  return g
}

/** A rolled-up yoga mat. */
export function yogaMat() {
  const g = new THREE.Group()
  const roll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.62, 40).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#2f6f6a', roughness: 0.75 }),
  )
  roll.position.y = 0.075
  const end = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 32).rotateY(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#244f4b', roughness: 0.8 }))
  end.position.set(0.312, 0.075, 0)
  g.add(roll, end)
  return g
}

/** A rubber medicine ball. */
export function medBall() {
  const g = new THREE.Group()
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 40, 28), new THREE.MeshStandardMaterial({ color: '#2a2b2e', roughness: 0.6 }))
  ball.position.y = 0.13
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.131, 0.012, 8, 48), new THREE.MeshStandardMaterial({ color: '#e0b43a', roughness: 0.5 }))
  band.position.y = 0.13
  g.add(ball, band)
  return g
}

/* ---------- modern warehouse ---------- */
const KRAFT = new THREE.MeshStandardMaterial({ color: '#c99a62', roughness: 0.88 })
const TAPE = new THREE.MeshStandardMaterial({ color: '#d9b27c', roughness: 0.45 })
const LABEL = (() => {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 160
  const x = c.getContext('2d')!
  x.fillStyle = '#fbfaf7'
  x.fillRect(0, 0, 256, 160)
  x.fillStyle = '#111'
  for (let i = 0; i < 46; i++) {
    const w = [2, 3, 5][i % 3]
    x.fillRect(14 + i * 5, 92, w, 52)
  }
  x.fillRect(14, 16, 150, 14)
  x.fillRect(14, 40, 100, 10)
  x.fillRect(14, 60, 120, 10)
  x.fillStyle = '#0F5257'
  x.fillRect(196, 14, 46, 46)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })
})()

/** A clean shipping carton with tape and a barcode label. */
export function carton(w = 0.5, h = 0.36, d = 0.4) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.008), KRAFT)
  body.position.y = h / 2
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.002, d + 0.002), TAPE)
  tape.position.y = h + 0.001
  const tapeF = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.002), TAPE)
  tapeF.position.set(0, h - 0.04, d / 2 + 0.001)
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), LABEL)
  label.position.set(w * 0.22, h * 0.45, d / 2 + 0.002)
  g.add(body, tape, tapeF, label)
  return g
}
export const cartonL = () => carton(0.6, 0.4, 0.45)
export const cartonS = () => carton(0.42, 0.3, 0.34)

/** A stackable plastic tote in a brand colour. */
export function tote(color = '#0F5257') {
  const g = new THREE.Group()
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.55 })
  const W = 0.6
  const D = 0.4
  const H = 0.3
  const t = 0.018
  const bottom = new THREE.Mesh(new RoundedBoxGeometry(W - 0.04, t, D - 0.04, 2, 0.006), m)
  bottom.position.y = t / 2
  g.add(bottom)
  const wall = (w: number, d: number, x: number, z: number) => {
    const s = new THREE.Mesh(new RoundedBoxGeometry(w, H, d, 2, 0.006), m)
    s.position.set(x, H / 2, z)
    g.add(s)
  }
  wall(W, t, 0, D / 2 - t / 2)
  wall(W, t, 0, -D / 2 + t / 2)
  wall(t, D, W / 2 - t / 2, 0)
  wall(t, D, -W / 2 + t / 2, 0)
  // handle cut-outs suggested by dark slots
  const slot = new THREE.Mesh(new RoundedBoxGeometry(0.012, 0.04, 0.14, 2, 0.006), new THREE.MeshBasicMaterial({ color: '#0a0a0a' }))
  ;[-1, 1].forEach((sx) => {
    const sl = slot.clone()
    sl.position.set(sx * (W / 2 + 0.001), H - 0.06, 0)
    g.add(sl)
  })
  return g
}

/** A modern hand pallet truck: forks, a hydraulic body and a tiller handle. */
export function palletJack() {
  const g = new THREE.Group()
  const paint = new THREE.MeshStandardMaterial({ color: '#e8b130', roughness: 0.4 })
  const fork = new RoundedBoxGeometry(1.1, 0.06, 0.16, 2, 0.01)
  ;[-0.17, 0.17].forEach((z) => {
    const f = new THREE.Mesh(fork, paint)
    f.position.set(0.15, 0.06, z)
    g.add(f)
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 20).rotateX(Math.PI / 2), RUBBER)
    wheel.position.set(0.66, 0.035, z)
    g.add(wheel)
  })
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.3, 0.5, 3, 0.03), paint)
  body.position.set(-0.48, 0.2, 0)
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.28, 20), CHROME)
  pump.position.set(-0.5, 0.45, 0)
  const tiller = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 12), MATTE_BLACK)
  tiller.position.set(-0.68, 0.9, 0)
  tiller.rotation.z = 0.35
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 10, 24), MATTE_BLACK)
  grip.position.set(-0.86, 1.42, 0)
  grip.rotation.y = Math.PI / 2
  const steer = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 24).rotateX(Math.PI / 2), RUBBER)
  steer.position.set(-0.52, 0.08, 0)
  g.add(body, pump, tiller, grip, steer)
  return g
}

/* ---------- modern study corner ---------- */
const OAK = new THREE.MeshStandardMaterial({ color: '#c8a27a', roughness: 0.6 })
const WHITE_MATTE = new THREE.MeshStandardMaterial({ color: '#f1efea', roughness: 0.55 })

/** A minimal desk: oak top on slim white legs, 1.2 x 0.6 m. */
export function modernDesk() {
  const g = new THREE.Group()
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.03, 0.6, 3, 0.01), OAK)
  top.position.y = 0.735
  g.add(top)
  const leg = new RoundedBoxGeometry(0.04, 0.72, 0.04, 2, 0.008)
  ;[-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = new THREE.Mesh(leg, WHITE_MATTE)
      l.position.set(sx * 0.55, 0.36, sz * 0.25)
      g.add(l)
    }),
  )
  const rail = new THREE.Mesh(new RoundedBoxGeometry(1.06, 0.06, 0.02, 2, 0.006), WHITE_MATTE)
  rail.position.set(0, 0.68, -0.25)
  g.add(rail)
  return g
}

/** An ergonomic task chair: mesh back, padded seat, gas lift and a five-star base. */
export function taskChair() {
  const g = new THREE.Group()
  const fabric = new THREE.MeshStandardMaterial({ color: '#2b2d31', roughness: 0.85 })
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.07, 0.46, 4, 0.03), fabric)
  seat.position.y = 0.48
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.52, 0.04, 4, 0.02), fabric)
  back.position.set(0, 0.82, -0.22)
  back.rotation.x = -0.12
  const spine = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.32, 0.03, 2, 0.01), MATTE_BLACK)
  spine.position.set(0, 0.56, -0.25)
  spine.rotation.x = -0.4
  const lift = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.34, 16), CHROME)
  lift.position.y = 0.27
  g.add(seat, back, spine, lift)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.03, 0.04, 2, 0.01), MATTE_BLACK)
    arm.position.set(Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15)
    arm.rotation.y = -a
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), MATTE_BLACK)
    wheel.position.set(Math.cos(a) * 0.29, 0.03, Math.sin(a) * 0.29)
    g.add(arm, wheel)
  }
  ;[-1, 1].forEach((d) => {
    const armrest = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.03, 0.26, 2, 0.01), MATTE_BLACK)
    armrest.position.set(d * 0.27, 0.68, 0)
    const post = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.18, 0.03, 2, 0.008), MATTE_BLACK)
    post.position.set(d * 0.27, 0.58, -0.04)
    g.add(armrest, post)
  })
  return g
}

/** A stack of new paperback books in fresh colours. */
export function bookStack() {
  const g = new THREE.Group()
  const covers = ['#0B6E4F', '#f1efea', '#B45309', '#1E3A8A', '#e7b93a']
  let y = 0
  covers.forEach((c, i) => {
    const h = 0.025 + (i % 2) * 0.01
    const w = 0.24 - (i % 3) * 0.02
    const book = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.17, 2, 0.003), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }))
    book.position.set((i % 2 ? 0.01 : -0.01), y + h / 2, 0)
    book.rotation.y = (i - 2) * 0.06
    const pages = new THREE.Mesh(new THREE.BoxGeometry(w - 0.012, h - 0.006, 0.006), WHITE_MATTE)
    pages.position.set(book.position.x, y + h / 2, 0.083)
    pages.rotation.y = book.rotation.y
    g.add(book, pages)
    y += h
  })
  return g
}

/** Over-ear headphones lying on the desk. */
export function headphones() {
  const g = new THREE.Group()
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 10, 36, Math.PI), MATTE_BLACK)
  band.rotation.x = -Math.PI / 2
  band.position.y = 0.025
  g.add(band)
  ;[-1, 1].forEach((d) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 24), MATTE_BLACK)
    cup.position.set(d * 0.085, 0.015, 0)
    g.add(cup)
  })
  return g
}

/** A ceramic mug. */
export function mug() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.038, 0.095, 32), WHITE_MATTE)
  body.position.y = 0.0475
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 8, 20), WHITE_MATTE)
  handle.position.set(0.045, 0.05, 0)
  g.add(body, handle)
  return g
}

/* ---------- modern HR corner ---------- */
/** A low, handle-less white cabinet with an oak top, 1.4 x 0.45 m, 75 cm high. */
export function sideboard() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.68, 0.45, 3, 0.012), WHITE_MATTE)
  body.position.y = 0.06 + 0.34
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.42, 0.03, 0.47, 3, 0.008), OAK)
  top.position.y = 0.755
  g.add(body, top)
  // door seams
  for (let i = 1; i < 4; i++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.6, 0.002), MATTE_BLACK)
    seam.position.set(-0.7 + i * 0.35, 0.4, 0.226)
    g.add(seam)
  }
  ;[-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 10), MATTE_BLACK)
      leg.position.set(sx * 0.64, 0.03, sz * 0.18)
      g.add(leg)
    }),
  )
  return g
}

/** Standing ring binders in a row. */
export function folders() {
  const g = new THREE.Group()
  const colors = ['#3F6212', '#f1efea', '#10231F', '#3F6212', '#e7b93a']
  colors.forEach((c, i) => {
    const f = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.31, 0.25, 2, 0.006), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }))
    f.position.set(i * 0.065, 0.155, 0)
    f.rotation.z = i === 4 ? -0.18 : 0
    if (i === 4) f.position.x += 0.03
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.08), WHITE_MATTE)
    label.position.set(f.position.x, 0.2, 0.126)
    label.rotation.z = f.rotation.z
    g.add(f, label)
  })
  return g
}

/** An employee ID badge on a lanyard, lying flat. */
export function badge() {
  const g = new THREE.Group()
  const card = new THREE.Mesh(new RoundedBoxGeometry(0.054, 0.004, 0.086, 2, 0.002), WHITE_MATTE)
  card.position.y = 0.002
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.0045, 0.02), new THREE.MeshStandardMaterial({ color: '#3F6212' }))
  stripe.position.set(0, 0.0025, -0.03)
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.006, 6, 40), new THREE.MeshStandardMaterial({ color: '#10231F', roughness: 0.8 }))
  strap.rotation.x = Math.PI / 2
  strap.scale.set(1, 1.4, 1)
  strap.position.set(0, 0.004, -0.15)
  g.add(card, stripe, strap)
  return g
}

/** A minimal round desk clock. */
export function deskClock() {
  const g = new THREE.Group()
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.035, 40).rotateX(Math.PI / 2), OAK)
  ring.position.y = 0.09
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.07, 40), WHITE_MATTE)
  face.position.set(0, 0.09, 0.0181)
  const hand = (len: number, a: number) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.004, len, 0.002), MATTE_BLACK)
    h.geometry.translate(0, len / 2, 0)
    h.position.set(0, 0.09, 0.02)
    h.rotation.z = a
    g.add(h)
  }
  hand(0.05, -0.9)
  hand(0.035, 2.2)
  const stand = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.012, 0.04, 2, 0.004), OAK)
  stand.position.y = 0.006
  g.add(ring, face, stand)
  return g
}

/** A light grey lounge chair on oak legs. */
export function loungeChair() {
  const g = new THREE.Group()
  const fabric = new THREE.MeshStandardMaterial({ color: '#c9c6bf', roughness: 0.9 })
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.14, 0.6, 5, 0.05), fabric)
  seat.position.y = 0.42
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.5, 0.14, 5, 0.05), fabric)
  back.position.set(0, 0.7, -0.26)
  back.rotation.x = -0.18
  g.add(seat, back)
  ;[-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.36, 12), OAK)
      leg.position.set(sx * 0.27, 0.18, sz * 0.23)
      leg.rotation.set(sz * 0.12, 0, -sx * 0.12)
      g.add(leg)
    }),
  )
  return g
}
