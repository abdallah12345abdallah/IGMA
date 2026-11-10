import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Preload, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { GALLERY, HERO_SHOT, HERO_SHOT_MOBILE, MODEL_FILES, STATIONS, type Item, type Layout } from './stations'
import { tour } from './tourState'
import { systems } from '../content/site'

const url = (f: string) => `/models/${f}.glb`
THREE.DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  tour.progress = total ? loaded / total : 0
}
MODEL_FILES.forEach((f) => useGLTF.preload(url(f)))

/* ---------- the one object we build ourselves: a rubber hex dumbbell ---------- */
function dumbbell() {
  const g = new THREE.Group()
  const chrome = new THREE.MeshPhysicalMaterial({ color: '#d5d9dc', metalness: 1, roughness: 0.16 })
  const rubber = new THREE.MeshPhysicalMaterial({ color: '#161718', roughness: 0.85 })
  const hex = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6
    if (i === 0) hex.moveTo(Math.cos(a) * 0.62, Math.sin(a) * 0.62)
    else hex.lineTo(Math.cos(a) * 0.62, Math.sin(a) * 0.62)
  }
  hex.closePath()
  const head = new THREE.ExtrudeGeometry(hex, { depth: 0.36, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4 })
  head.translate(0, 0, -0.18).rotateY(Math.PI / 2)
  ;[-1, 1].forEach((d) => {
    const m = new THREE.Mesh(head, rubber)
    m.position.x = d * 0.82
    g.add(m)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 32).rotateZ(Math.PI / 2), chrome)
    cap.position.x = d * 1.06
    g.add(cap)
  })
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 32).rotateZ(Math.PI / 2), chrome))
  g.scale.setScalar(0.2)
  return g
}

/* ---------- composing a station from its items ---------- */
function buildStation(items: Item[], scenes: Record<string, THREE.Object3D>) {
  const station = new THREE.Group()
  const byId: Record<string, THREE.Object3D> = {}
  const box = new THREE.Box3()
  items.forEach((it) => {
    const obj = it.file === '@dumbbell' ? dumbbell() : scenes[it.file].clone(true)
    obj.rotation.set(it.rx ?? 0, 0, it.rz ?? 0)
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
  })
  station.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) {
      m.castShadow = true
      m.receiveShadow = true
    }
  })
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
  return outer
}

const TOP = GALLERY.pedestalHeight

/** Pedestals stand in one line, alternating slightly forward and back. */
function pedestalPos(i: number) {
  return { x: (i - (STATIONS.length - 1) / 2) * GALLERY.gap, z: i % 2 ? -GALLERY.stagger : GALLERY.stagger }
}

/* ---------- camera choreography ---------- */
interface View {
  pos: THREE.Vector3
  look: THREE.Vector3
  layout: Layout | 'hero'
}

const FOV = 30
const HALF_ROW = ((STATIONS.length - 1) / 2) * GALLERY.gap + GALLERY.pedestalRadius

function viewFor(stop: number, mobile: boolean, aspect: number): View {
  if (stop === 0) {
    if (mobile) return { pos: new THREE.Vector3(...HERO_SHOT_MOBILE.pos), look: new THREE.Vector3(...HERO_SHOT_MOBILE.look), layout: 'hero' }
    // Pull in or back so the line of pedestals fills the width of any screen.
    const look = new THREE.Vector3(...HERO_SHOT.look)
    const dir = new THREE.Vector3(...HERO_SHOT.pos).sub(look).normalize()
    const d = HALF_ROW / GALLERY.heroFill / (Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * aspect)
    return { pos: look.clone().addScaledVector(dir, d), look, layout: 'hero' }
  }
  const p = pedestalPos(stop - 1)
  const shot = STATIONS[stop - 1].shot
  const d = shot.dist * (mobile ? 1.5 : 1)
  return {
    pos: new THREE.Vector3(p.x + Math.sin(shot.az) * d, TOP + shot.height * (mobile ? 1.15 : 1), p.z + Math.cos(shot.az) * d),
    look: new THREE.Vector3(p.x, TOP + shot.look, p.z),
    layout: shot.layout,
  }
}

/** How far the picture slides to make room for the text. */
function shiftFor(layout: View['layout'], mobile: boolean): [number, number] {
  if (mobile) return [0, layout === 'hero' ? 0.28 : 0.2]
  if (layout === 'hero') return [0, -0.13]
  if (layout === 'a') return [0.17, 0]
  if (layout === 'b') return [-0.17, 0]
  return [0, 0.25]
}

const ease = (t: number) => t * t * (3 - 2 * t)

interface RigProps {
  fixedStop?: number
  reduced: boolean
  mobile: boolean
  centered?: boolean
  light: React.RefObject<THREE.DirectionalLight | null>
}

function CameraRig({ fixedStop, reduced, mobile, centered, light }: RigProps) {
  const { camera, size } = useThree()
  const pos = useRef(fixedStop ?? tour.pos)
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const cam = camera as THREE.PerspectiveCamera
    const dt = Math.min(0.05, delta)
    const target = fixedStop ?? tour.pos
    pos.current = reduced ? target : pos.current + (target - pos.current) * (1 - Math.exp(-dt * 4))
    const p = pos.current
    const a = Math.floor(p)
    const t = ease(p - a)
    const aspect = size.width / size.height
    const A = viewFor(a, mobile, aspect)
    const B = viewFor(Math.min(a + 1, STATIONS.length), mobile, aspect)
    const time = state.clock.elapsedTime
    const drift = reduced ? 0 : 1
    cam.position.lerpVectors(A.pos, B.pos, t)
    // Pull back a little mid-move, like a camera on a dolly track.
    cam.position.z += Math.sin(t * Math.PI) * (a === 0 ? 0 : 1.6)
    cam.position.y += Math.sin(t * Math.PI) * (a === 0 ? 0 : 0.5) + Math.sin(time * 0.23) * 0.05 * drift
    cam.position.x += Math.sin(time * 0.31) * 0.07 * drift
    look.lerpVectors(A.look, B.look, t)
    cam.lookAt(look)
    // The key light travels with the camera so every pedestal is lit the same way.
    if (light.current) {
      light.current.position.set(look.x - 6, 11, look.z + 7)
      light.current.target.position.copy(look)
      light.current.target.updateMatrixWorld()
    }
    const sa = centered ? [0, 0] : shiftFor(A.layout, mobile)
    const sb = centered ? [0, 0] : shiftFor(B.layout, mobile)
    cam.setViewOffset(size.width, size.height, size.width * (sa[0] + (sb[0] - sa[0]) * t), size.height * (sa[1] + (sb[1] - sa[1]) * t), size.width, size.height)
    cam.updateProjectionMatrix()
  })
  return null
}

function Environment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.95
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function Floor() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <shadowMaterial opacity={0.2} />
    </mesh>
  )
}

function pedestal(color: string) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(GALLERY.pedestalRadius, GALLERY.pedestalRadius, TOP, 96),
    new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color).multiplyScalar(0.72), roughness: 0.55, clearcoat: 0.25 }),
  )
  body.position.y = TOP / 2
  body.castShadow = true
  body.receiveShadow = true
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(GALLERY.pedestalRadius - 0.02, 0.018, 10, 128).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#c79a4b', metalness: 1, roughness: 0.3 }),
  )
  rim.position.y = TOP
  g.add(body, rim)
  return g
}

function Stations({ interactive, fixedStop, reduced }: { interactive: boolean; fixedStop?: number; reduced: boolean }) {
  const gltfs = useGLTF(MODEL_FILES.map(url))
  const [hover, setHover] = useState(-1)
  const { groups, outers } = useMemo(() => {
    const scenes: Record<string, THREE.Object3D> = {}
    MODEL_FILES.forEach((f, i) => (scenes[f] = gltfs[i].scene))
    const groups: THREE.Group[] = []
    const outers = STATIONS.map((s, i) => {
      const g = buildStation(s.items, scenes)
      g.position.y = TOP
      groups.push(g)
      const outer = new THREE.Group()
      const p = pedestalPos(i)
      outer.position.set(p.x, 0, p.z)
      outer.add(pedestal(systems[i].color), g)
      return outer
    })
    return { groups, outers }
  }, [gltfs])
  const shown = useRef(STATIONS.map(() => 1))

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta)
    const k = 1 - Math.exp(-dt * 9)
    const pos = fixedStop ?? tour.pos
    groups.forEach((g, i) => {
      // In the overview every pedestal shows; on a stop only the system in view stays up.
      const want = Math.max(Math.min(1, Math.max(0, 1 - pos)), Math.max(0, 1 - Math.abs(pos - (i + 1)) * 1.4))
      shown.current[i] = reduced ? want : shown.current[i] + (want - shown.current[i]) * (1 - Math.exp(-dt * 5))
      const v = shown.current[i]
      const e = v * v * (3 - 2 * v)
      outers[i].scale.setScalar(Math.max(0.001, e))
      outers[i].visible = e > 0.01
      const lift = interactive && hover === i && tour.pos < 0.3 ? 0.22 : 0
      g.position.y += (TOP + lift - g.position.y) * k
      // The object in focus turns slowly, which keeps the scene alive between scrolls.
      const focus = Math.max(0, 1 - Math.abs(tour.pos - (i + 1)))
      g.rotation.y = focus * Math.sin(state.clock.elapsedTime * 0.35) * 0.18
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
        <Html position={[outers[hover].position.x, TOP + groups[hover].userData.height + 0.6, outers[hover].position.z]} center zIndexRange={[20, 0]}>
          <span className="pick-label">{systems[hover].name}</span>
        </Html>
      ) : null}
    </>
  )
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
}

export default function Showroom({ reduced, mobile, fixedStop, interactive = false, paused, onReady, dpr, centered }: Props) {
  const light = useRef<THREE.DirectionalLight>(null)
  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      dpr={dpr ?? [1, mobile ? 1.5 : 1.75]}
      camera={{ fov: FOV, near: 0.1, far: 160, position: [-9, 9, 17] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows={{ type: THREE.PCFShadowMap }}
      style={{ pointerEvents: interactive && !mobile ? 'auto' : 'none' }}
    >
      <Environment />
      <directionalLight
        ref={light}
        intensity={2.3}
        color="#fff1df"
        castShadow
        shadow-mapSize={[mobile ? 1024 : 2048, mobile ? 1024 : 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={5}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-far={45}
      />
      <Floor />
      <Suspense fallback={null}>
        <Stations interactive={interactive} fixedStop={fixedStop} reduced={reduced} />
        <Preload all />
        <Ready onReady={onReady} />
      </Suspense>
      <CameraRig fixedStop={fixedStop} reduced={reduced} mobile={mobile} centered={centered} light={light} />
    </Canvas>
  )
}
