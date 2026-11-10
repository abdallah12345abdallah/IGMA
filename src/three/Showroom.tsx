import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { GALLERY, HERO_SHOT, HERO_SHOT_MOBILE, LAMP, MODEL_FILES, STATIONS, type Item, type Layout } from './stations'
import { blueprint, device, screenTexture } from './devices'
import { sideboard, folders, badge, deskClock, loungeChair, bookStack, headphones, modernDesk, mug, taskChair, bench, cartonL, cartonS, palletJack, tote, dumbbell, dumbbellRack, kettlebell, kettlebellColor, medBall, pallet, plate, plates, steelCounter, stockPot, yogaMat } from './props'

const BUILT: Record<string, () => THREE.Object3D> = {
  dumbbell,
  kettlebell,
  pallet,
  plates,
  steelCounter,
  stockPot,
  plate,
  bench,
  dumbbellRack,
  yogaMat,
  medBall,
  modernDesk,
  sideboard,
  folders,
  badge,
  deskClock,
  loungeChair,
  taskChair,
  bookStack,
  headphones,
  mug,
  cartonL,
  cartonS,
  palletJack,
  tote: () => tote('#0F5257'),
  toteGrey: () => tote('#3a3f44'),
  kbPink: () => kettlebellColor('#e0607e'),
  kbBlue: () => kettlebellColor('#3c6fd1'),
  kbYellow: () => kettlebellColor('#e7b93a'),
}
import { LAMP_DROP_MS, tour } from './tourState'
import { tourStops } from '../content/site'

const url = (f: string) => `/models/${f}.glb`
THREE.DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  tour.progress = total ? loaded / total : 0
}
MODEL_FILES.forEach((f) => useGLTF.preload(url(f)))

/** Background colour per stop: sand for the overview, then each system's colour. */
const SAND = new THREE.Color('#C6C0B2')
const STOP_COLORS = [SAND, ...tourStops.map((s) => new THREE.Color(s.color))]

/* ---------- one shader for (nearly) everything ----------
 * Every distinct combination of texture slots compiles its own shader, and on integrated
 * GPUs each compile blocks the page for a moment. Giving every surface the same slots
 * (neutral 1x1 textures where a model has none) lets them all share a single shader. */
const tex1 = (r: number, g: number, b: number, srgb: boolean) => {
  const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}
const WHITE = tex1(255, 255, 255, true)
const WHITE_LINEAR = tex1(255, 255, 255, false)
const FLAT_NORMAL = tex1(128, 128, 255, false)
const unified = new Map<string, THREE.Material>()
function unify(mat: THREE.Material): THREE.Material {
  const src = mat as THREE.MeshStandardMaterial
  if (!src.isMeshStandardMaterial) return mat
  const hit = unified.get(src.uuid)
  if (hit) return hit
  const m = new THREE.MeshStandardMaterial({
    color: src.color,
    map: src.map ?? WHITE,
    normalMap: src.normalMap ?? FLAT_NORMAL,
    normalScale: src.normalMap ? src.normalScale : new THREE.Vector2(1, 1),
    roughness: src.roughness,
    roughnessMap: src.roughnessMap ?? WHITE_LINEAR,
    metalness: src.metalness,
    metalnessMap: src.metalnessMap ?? WHITE_LINEAR,
    emissive: src.emissive,
    emissiveIntensity: src.emissiveIntensity,
    emissiveMap: src.emissiveMap ?? WHITE,
    alphaTest: src.alphaTest,
    transparent: src.transparent,
    opacity: src.opacity,
    side: src.side,
  })
  unified.set(src.uuid, m)
  return m
}

/* ---------- composing a station from its items ---------- */
function buildStation(index: number, scenes: Record<string, THREE.Object3D>) {
  const def = STATIONS[index]
  const stop = tourStops[index]
  const tex = def.screen ? screenTexture(def.screen, stop.color, stop.name) : null
  const station = new THREE.Group()
  const byId: Record<string, THREE.Object3D> = {}
  const devices: THREE.Object3D[] = []
  const box = new THREE.Box3()
  let tick: ((t: number) => void) | undefined
  def.items.forEach((it: Item) => {
    let obj: THREE.Object3D
    if (it.dev && tex) obj = device(it.dev, tex)
    else if (it.special && BUILT[it.special]) obj = BUILT[it.special]()
    else if (it.special === 'blueprint') {
      obj = blueprint()
      tick = obj.userData.tick
    } else obj = scenes[it.file!].clone(true)
    obj.rotation.set(it.rx ?? 0, 0, it.rz ?? 0)
    if (it.s) obj.scale.multiplyScalar(it.s)
    const holder = new THREE.Group()
    holder.add(obj)
    holder.updateMatrixWorld(true)
    box.setFromObject(obj)
    const c = box.getCenter(new THREE.Vector3())
    obj.position.set(-c.x, -box.min.y, -c.z)
    let base = 0
    if (it.on && byId[it.on]) {
      byId[it.on].updateMatrixWorld(true)
      base = new THREE.Box3().setFromObject(byId[it.on]).max.y
    }
    holder.position.set(it.x ?? 0, base, it.z ?? 0)
    holder.rotation.y = it.ry ?? 0
    station.add(holder)
    station.updateMatrixWorld(true)
    if (it.id) byId[it.id] = holder
    if (it.dev) devices.push(holder)
  })
  station.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) {
      m.castShadow = true
      m.receiveShadow = true
      m.material = Array.isArray(m.material) ? m.material.map(unify) : unify(m.material)
    }
  })
  // Measure the props only, so the device never shrinks the scene.
  devices.forEach((d) => (d.visible = false))
  const outer = new THREE.Group()
  outer.add(station)
  box.setFromObject(station)
  const size = box.getSize(new THREE.Vector3())
  station.scale.setScalar(GALLERY.stationSize / Math.max(size.x, size.z, size.y * 0.85))
  outer.updateMatrixWorld(true)
  box.setFromObject(station)
  const c = box.getCenter(new THREE.Vector3())
  station.position.set(-c.x, -box.min.y, -c.z)
  outer.userData.height = box.max.y - box.min.y
  devices.forEach((d) => (d.visible = true))
  outer.userData.tick = tick
  return outer
}

/**
 * The systems stand straight on the floor in a wedge: four in front, two behind them,
 * and the next project alone at the back. Read right to left, like the page.
 */
const ROWS = [4, 2, 1]
const SP = GALLERY.spacing

function spotPos(i: number) {
  let row = 0
  let k = i
  while (k >= ROWS[row]) k -= ROWS[row++]
  const n = ROWS[row]
  return { x: ((n - 1) / 2 - k) * SP, z: (1 - row) * GALLERY.rowDepth, ry: 0 }
}

/* ---------- camera choreography ---------- */
interface View {
  pos: THREE.Vector3
  look: THREE.Vector3
  layout: Layout | 'hero'
}

const FOV = 30
const HALF_ROW = ((ROWS[0] - 1) / 2) * SP + GALLERY.stationSize / 2

function viewFor(stop: number, mobile: boolean, aspect: number): View {
  if (stop === 0) {
    if (mobile) return { pos: new THREE.Vector3(...HERO_SHOT_MOBILE.pos), look: new THREE.Vector3(...HERO_SHOT_MOBILE.look), layout: 'hero' }
    // Pull in or back so the whole line fills the width of any screen.
    const look = new THREE.Vector3(...HERO_SHOT.look)
    const dir = new THREE.Vector3(...HERO_SHOT.pos).sub(look).normalize()
    const d = HALF_ROW / GALLERY.heroFill / (Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * aspect)
    return { pos: look.clone().addScaledVector(dir, d), look, layout: 'hero' }
  }
  const p = spotPos(stop - 1)
  const shot = STATIONS[stop - 1].shot
  const d = shot.dist * (mobile ? 1.5 : 1)
  return {
    // the shot angle is measured from the front of the station, which faces outward
    pos: new THREE.Vector3(p.x + Math.sin(shot.az + p.ry) * d, shot.height * (mobile ? 1.15 : 1), p.z + Math.cos(shot.az + p.ry) * d),
    look: new THREE.Vector3(p.x, shot.look, p.z),
    layout: shot.layout,
  }
}

/** How far the picture slides to make room for the text. */
function shiftFor(layout: View['layout'], mobile: boolean): [number, number] {
  if (mobile) return [0, layout === 'hero' ? 0.28 : 0.2]
  if (layout === 'hero') return [0, -0.24]
  if (layout === 'a') return [0.17, 0]
  if (layout === 'b') return [-0.17, 0]
  return [0, 0.25]
}

const ease = (t: number) => t * t * (3 - 2 * t)
/** Seconds a system takes to gather (or scatter) in the opening view. */
const SWAP_S = 1.5
/** How much bigger the single system is in the opening view than at its stop. */
const HERO_SCALE = 2.7

/* ---------- the lamp that hangs over the gallery and follows the visitor ---------- */
function useLamp(scenes: Record<string, THREE.Object3D>) {
  return useMemo(() => {
    const rig = new THREE.Group()
    const model = scenes[LAMP.file].clone(true)
    model.scale.setScalar(LAMP.scale)
    rig.add(model)
    rig.updateMatrixWorld(true)
    const b = new THREE.Box3().setFromObject(model)
    model.position.y -= b.max.y // hang from its top
    rig.updateMatrixWorld(true)
    const bottom = new THREE.Box3().setFromObject(model).min.y
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = false
    })
    const bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff1d6'), toneMapped: false })
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), bulbMat)
    bulb.position.y = bottom + 0.22
    rig.add(bulb)
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 40, 8), new THREE.MeshStandardMaterial({ color: '#1a1a1a' }))
    cable.position.y = 20
    rig.add(cable)
    // A faint visible beam under the lamp.
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 256
    const x = c.getContext('2d')!
    const grad = x.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = grad
    x.fillRect(0, 0, 4, 256)
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(1, 1, 64, 1, true),
      new THREE.MeshBasicMaterial({ color: '#ffe9c4', alphaMap: new THREE.CanvasTexture(c), transparent: true, opacity: BEAM_OPACITY, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }),
    )
    const spot = new THREE.SpotLight('#ffe2b8', 0, 0, 0.6, 0.7, 1.6)
    spot.castShadow = true
    spot.shadow.mapSize.set(2048, 2048)
    spot.shadow.bias = -0.0003
    spot.shadow.normalBias = 0.03
    return { rig, beam, spot, bottom, bulbMat }
  }, [scenes])
}

const BEAM_OPACITY = 0.016
const SPOT_GAIN = 0.8
const BULB_ON = new THREE.Color('#fff1d6')
const BULB_OFF = new THREE.Color('#4a4540')
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/**
 * The opening, in seconds from tour.introAt: the room is dark, the lamp drops in
 * and swings, flickers on, then the room fills with light.
 */
const DROP_S = LAMP_DROP_MS / 1000
function introState(s: number) {
  if (s < 0) return { drop: 0, spot: 0, room: 0, swing: 0 }
  const d = clamp01(s / DROP_S)
  // ease out with a small overshoot, like a cable taking the weight
  const drop = 1 + 2.2 * Math.pow(d - 1, 3) + 1.2 * Math.pow(d - 1, 2)
  const since = s - DROP_S
  const swing = since < 0 ? 0 : Math.sin(since * 4) * Math.exp(-since * 1.6) * 0.06
  let spot = 0
  if (since >= 0) {
    if (since < 0.07) spot = 0.7
    else if (since < 0.18) spot = 0.04
    else if (since < 0.26) spot = 0.9
    else if (since < 0.4) spot = 0.18
    else spot = 0.6 + 0.4 * clamp01((since - 0.4) / 0.5)
  }
  const r = clamp01((since - 0.35) / 0.9)
  return { drop, spot, room: r * r * (3 - 2 * r), swing }
}

interface RigProps {
  fixedStop?: number
  reduced: boolean
  mobile: boolean
  centered?: boolean
  sun: React.RefObject<THREE.DirectionalLight | null>
  hemi: React.RefObject<THREE.HemisphereLight | null>
  lamp: ReturnType<typeof useLamp> | null
  intro?: boolean
}

const SUN = 0.8
const HEMI = 0.45
const ENV = 0.6
const DARK = 1 // how much of the room shows before the lamp is on (1 = no dimming)

function CameraRig({ fixedStop, reduced, mobile, centered, sun, hemi, lamp, intro }: RigProps) {
  const { camera, size, scene } = useThree()
  const pos = useRef(fixedStop ?? tour.pos)
  const look = useMemo(() => new THREE.Vector3(), [])
  const bg = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    const cam = camera as THREE.PerspectiveCamera
    const dt = Math.min(0.05, delta)
    const target = fixedStop ?? tour.pos
    pos.current = reduced ? target : pos.current + (target - pos.current) * (1 - Math.exp(-dt * 4))
    const p = pos.current
    const a = Math.floor(p)
    const t = ease(p - a)
    const b = Math.min(a + 1, STATIONS.length)
    const aspect = size.width / size.height
    const A = viewFor(a, mobile, aspect)
    const B = viewFor(b, mobile, aspect)
    const time = state.clock.elapsedTime
    const drift = reduced ? 0 : 1
    cam.position.lerpVectors(A.pos, B.pos, t)
    cam.position.z += Math.sin(t * Math.PI) * (a === 0 ? 0 : 1.6)
    cam.position.y += Math.sin(t * Math.PI) * (a === 0 ? 0 : 0.5) + Math.sin(time * 0.23) * 0.05 * drift
    cam.position.x += Math.sin(time * 0.31) * 0.07 * drift
    look.lerpVectors(A.look, B.look, t)
    cam.lookAt(look)
    const sa = centered ? [0, 0] : shiftFor(A.layout, mobile)
    const sb = centered ? [0, 0] : shiftFor(B.layout, mobile)
    cam.setViewOffset(size.width, size.height, size.width * (sa[0] + (sb[0] - sa[0]) * t), size.height * (sa[1] + (sb[1] - sa[1]) * t), size.width, size.height)
    cam.updateProjectionMatrix()

    const io = intro && !reduced ? introState(tour.introAt == null ? -1 : (performance.now() - tour.introAt) / 1000) : { drop: 1, spot: 1, room: 1, swing: 0 }
    const room = DARK + (1 - DARK) * io.room

    // The backdrop takes the colour of the stop in view; the floor matches so it has no edge.
    bg.copy(STOP_COLORS[a]).lerp(STOP_COLORS[b], t).multiplyScalar(room)
    scene.environmentIntensity = ENV * room
    if (hemi.current) hemi.current.intensity = HEMI * room
    if (scene.background instanceof THREE.Color) scene.background.copy(bg)
    if (scene.fog) scene.fog.color.copy(bg)
    scene.userData.floor?.color.copy(bg)

    if (sun.current) {
      sun.current.intensity = SUN * room
      sun.current.position.set(look.x - 6, 11, look.z + 7)
      sun.current.target.position.copy(look)
      sun.current.target.updateMatrixWorld()
    }

    // The lamp hangs over the middle of the line, then moves over each system.
    if (lamp) {
      const at = (s: number) => (s === 0 ? { x: 0, z: 0, h: LAMP.heroHeight, ang: LAMP.heroAngle } : { ...spotPos(s - 1), h: LAMP.stopHeight, ang: LAMP.stopAngle })
      const la = at(a)
      const lb = at(b)
      const lx = la.x + (lb.x - la.x) * t
      const lz = la.z + (lb.z - la.z) * t
      const h = la.h + (lb.h - la.h) * t
      const ang = la.ang + (lb.ang - la.ang) * t
      lamp.rig.position.set(lx, h + (1 - io.drop) * 11, lz)
      lamp.rig.rotation.z = (reduced ? 0 : Math.sin(time * 0.6) * 0.012) + io.swing
      const y = h + lamp.bottom
      lamp.spot.position.set(lx, y, lz)
      lamp.spot.target.position.set(lx, 0, lz)
      lamp.spot.target.updateMatrixWorld()
      lamp.spot.angle = ang
      lamp.spot.intensity = SPOT_GAIN * Math.pow(Math.max(1, y), 1.6) * io.spot
      lamp.bulbMat.color.copy(BULB_OFF).lerp(BULB_ON, io.spot)
      ;const overview = a === 0 ? 1 - t : 0
      ;(lamp.beam.material as THREE.MeshBasicMaterial).opacity = BEAM_OPACITY * io.spot * (1 - overview * 0.6)
      const r = Math.tan(ang) * y * 0.92
      lamp.beam.scale.set(r, y, r)
      lamp.beam.position.set(lx, y / 2, lz)
    }
  })
  return null
}

function Environment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = ENV
    scene.background = SAND.clone()
    scene.fog = new THREE.Fog(SAND.clone(), 40, 95)
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function Floor() {
  const { scene } = useThree()
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: SAND.clone(), roughness: 0.95 }), [])
  useEffect(() => {
    scene.userData.floor = mat
  }, [scene, mat])
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow material={mat}>
      <planeGeometry args={[240, 240]} />
    </mesh>
  )
}

/** Soft dark blob for contact shadows: dark in the middle, fading out well before the edge. */
const SHADOW_TEX = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(0,0,0,.55)')
  g.addColorStop(0.35, 'rgba(0,0,0,.38)')
  g.addColorStop(0.7, 'rgba(0,0,0,.1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
})()

/** Under each system: a faint glow of its colour and a soft contact shadow, no pedestal. */
const GLOW_TEX = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,.55)')
  g.addColorStop(0.6, 'rgba(255,255,255,.22)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
})()
function ground(color: string) {
  const g = new THREE.Group()
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(GALLERY.stationSize * 1.5, GALLERY.stationSize * 1.5).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color, map: GLOW_TEX, transparent: true, depthWrite: false }),
  )
  glow.position.y = 0.004
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(GALLERY.stationSize * 1.05, GALLERY.stationSize * 1.05).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false }),
  )
  contact.position.y = 0.008
  g.add(glow, contact)
  return g
}

function Stations({ interactive, fixedStop, reduced, onLamp }: { interactive: boolean; fixedStop?: number; reduced: boolean; onLamp: (l: ReturnType<typeof useLamp>) => void }) {
  const gltfs = useGLTF(MODEL_FILES.map(url))
  const [hover, setHover] = useState(-1)
  const scenes = useMemo(() => {
    const out: Record<string, THREE.Object3D> = {}
    MODEL_FILES.forEach((f, i) => (out[f] = gltfs[i].scene))
    return out
  }, [gltfs])
  const lamp = useLamp(scenes)
  useEffect(() => onLamp(lamp), [lamp, onLamp])

  const { groups, outers, parts } = useMemo(() => {
    const groups: THREE.Group[] = []
    const outers = STATIONS.map((_, i) => {
      const g = buildStation(i, scenes)
      groups.push(g)
      const outer = new THREE.Group()
      const p = spotPos(i)
      outer.position.set(p.x, 0, p.z)
      outer.rotation.y = p.ry
      outer.add(ground(tourStops[i].color), g)
      return outer
    })
    // every piece of every station remembers its resting place, so it can fly off and come back
    const parts = groups.map((g) =>
      g.children[0].children.map((o, k, all) => {
        const a = k * 2.399 + 0.7
        return {
          o,
          p: o.position.clone(),
          r: o.rotation.clone(),
          s: o.scale.clone(),
          dir: new THREE.Vector3(Math.sin(a), 0.55 + (k % 3) * 0.25, Math.cos(a)).multiplyScalar(1.1 + (k % 2) * 0.5),
          spin: (k % 2 ? 1 : -1) * (1.6 + k * 0.35),
          d: all.length > 1 ? k / (all.length - 1) : 0,
        }
      }),
    )
    return { groups, outers, parts }
  }, [scenes])
  const shown = useRef(STATIONS.map(() => 1))
  // 1 = assembled, 0 = scattered
  const built = useRef<number[]>(STATIONS.map((_, i) => (i === 0 ? 1 : 0)))

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta)
    const k = 1 - Math.exp(-dt * 9)
    const pos = fixedStop ?? tour.pos
    const time = reduced ? 0 : state.clock.elapsedTime
    const inHero = pos < 0.5
    // the next system waits until the previous one has mostly scattered
    const leaving = built.current.some((v, j) => j !== tour.heroIdx && v > 0.35)
    groups.forEach((g, i) => {
      const atStop = Math.max(0, 1 - Math.abs(pos - (i + 1)) * 1.4)
      const isHero = i === tour.heroIdx
      // Opening view: one system at a time, centred under the lamp. It scatters and the next gathers in its place.
      const aim = inHero ? (isHero ? (leaving && !reduced ? built.current[i] : 1) : 0) : atStop > 0 ? 1 : 0
      const step = dt / SWAP_S
      built.current[i] = reduced ? aim : built.current[i] + Math.max(-step, Math.min(step, aim - built.current[i]))
      const a = built.current[i]
      const centred = pos < 1 && (isHero || (inHero && a > 0.01))
      const b = centred ? ease(Math.min(1, Math.max(0, 1 - pos))) : 0
      const want = Math.max(centred ? Math.max(0, 1 - pos) : 0, atStop)
      shown.current[i] = reduced ? want : shown.current[i] + (want - shown.current[i]) * (1 - Math.exp(-dt * 5))
      const v = shown.current[i]
      const e = v * v * (3 - 2 * v)
      const sp = spotPos(i)
      outers[i].position.set(sp.x * (1 - b), 0, sp.z * (1 - b))
      const hs = HERO_SCALE * (STATIONS[i].heroScale ?? 1)
      outers[i].scale.setScalar(Math.max(0.001, e * (1 + (hs - 1) * b)))
      outers[i].visible = e > 0.01 && a > 0.001
      outers[i].children[0].scale.setScalar(Math.max(0.001, a))
      for (const q of parts[i]) {
        const lp = Math.min(1, Math.max(0, (a - 0.4 * q.d) / 0.6))
        const f = 1 - lp
        const ee = 1 - f * f * f
        q.o.position.copy(q.p).addScaledVector(q.dir, 1 - ee)
        q.o.rotation.set(q.r.x + q.spin * 0.4 * (1 - ee), q.r.y + q.spin * (1 - ee), q.r.z)
        q.o.scale.copy(q.s).multiplyScalar(Math.max(0.001, ee))
      }
      const lift = interactive && hover === i && tour.pos < 0.3 ? 0.22 : 0
      g.position.y += (lift - g.position.y) * k
      const focus = Math.max(0, 1 - Math.abs(pos - (i + 1)))
      g.rotation.y = focus * Math.sin(time * 0.35) * 0.18
      g.userData.tick?.(time)
    })
  })

  useEffect(() => {
    document.body.style.cursor = hover >= 0 ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hover])

  return (
    <>
      <primitive object={lamp.rig} />
      <primitive object={lamp.beam} />
      <primitive object={lamp.spot} />
      <primitive object={lamp.spot.target} />
      {outers.map((g, i) => (
        <primitive
          key={i}
          object={g}
          onPointerOver={(e: { stopPropagation: () => void }) => {
            if (!interactive || tour.pos > 0.3) return
            e.stopPropagation()
            setHover(i)
          }}
          onPointerOut={() => setHover((h) => (h === i ? -1 : h))}
          onClick={(e: { stopPropagation: () => void }) => {
            if (!interactive || tour.pos > 0.3) return
            e.stopPropagation()
            tour.onPick?.(i)
          }}
        />
      ))}
      {interactive && hover >= 0 && tour.pos < 0.3 ? (
        <Html position={[outers[hover].position.x, groups[hover].userData.height + 0.6, outers[hover].position.z]} center zIndexRange={[20, 0]}>
          <span className="pick-label">{tourStops[hover].name}</span>
        </Html>
      ) : null}
    </>
  )
}

/**
 * Uploads every texture and compiles the shaders once, before the first frame is shown.
 * (drei's <Preload all> also renders into an offscreen cube, which compiles every shader twice.)
 */
function Warm() {
  const { gl, scene, camera } = useThree()
  useLayoutEffect(() => {
    scene.traverse((o) => {
      const mats = (o as THREE.Mesh).material
      if (!mats) return
      ;(Array.isArray(mats) ? mats : [mats]).forEach((m) => {
        Object.values(m).forEach((v) => {
          if (v instanceof THREE.Texture) gl.initTexture(v)
        })
      })
    })
    gl.compile(scene, camera)
  }, [gl, scene, camera])
  return null
}

/** Fires once everything is loaded, compiled and drawn a few times. */
function Ready({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    if (frames.current === 6) onReady?.()
  })
  return null
}

interface Props {
  reduced: boolean
  mobile: boolean
  /** Lock the camera to one stop (system pages, captures) instead of following the scroll */
  fixedStop?: number
  interactive?: boolean
  paused?: boolean
  onReady?: () => void
  dpr?: number
  /** Keep the object centred (used where the canvas sits beside the text) */
  centered?: boolean
  /** Play the opening: dark room, the lamp drops in and switches on (waits for tour.introAt) */
  intro?: boolean
}

export default function Showroom({ reduced, mobile, fixedStop, interactive = false, paused, onReady, dpr, centered, intro }: Props) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const [lamp, setLamp] = useState<ReturnType<typeof useLamp> | null>(null)
  return (
    <Canvas
      flat
      onCreated={({ gl }) => {
        ;(window as unknown as { __gl?: THREE.WebGLRenderer }).__gl = gl
      }}
      frameloop={paused ? 'never' : 'always'}
      dpr={dpr ?? [1, mobile ? 1.5 : 1.75]}
      camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 12, 32] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      shadows={{ type: THREE.PCFShadowMap }}
      style={{ pointerEvents: interactive && !mobile ? 'auto' : 'none' }}
    >
      <Environment />
      <hemisphereLight ref={hemi} args={['#fff4e4', '#6b6359', HEMI]} />
      <directionalLight
        ref={sun}
        intensity={SUN}
        color="#fff1df"
        castShadow
        shadow-mapSize={[mobile ? 1024 : 2048, mobile ? 1024 : 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={50}
      />
      <Floor />
      <Suspense fallback={null}>
        <Stations interactive={interactive} fixedStop={fixedStop} reduced={reduced} onLamp={setLamp} />
        <Warm />
        <Ready onReady={onReady} />
      </Suspense>
      <CameraRig fixedStop={fixedStop} reduced={reduced} mobile={mobile} centered={centered} sun={sun} hemi={hemi} lamp={lamp} intro={intro} />
    </Canvas>
  )
}
