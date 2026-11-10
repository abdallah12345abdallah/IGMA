import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * Devices that show each system's interface, so visitors see software, not just objects.
 * The screens are illustrative mock-ups drawn in code; swap `drawScreen` for real
 * screenshots when they are ready (load an image into the CanvasTexture instead).
 */

export type ScreenKind = 'erp' | 'logistics' | 'restaurant' | 'gym' | 'hr' | 'learning'

export function screenTexture(kind: ScreenKind, color: string, appName: string) {
  const W = 1024
  const H = 640
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d')!
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const draw = () => {
    drawScreen(x, W, H, kind, color, appName)
    tex.needsUpdate = true
  }
  draw()
  document.fonts?.ready.then(draw)
  return tex
}

function drawScreen(x: CanvasRenderingContext2D, W: number, H: number, kind: ScreenKind, col: string, appName: string) {
  const ink = '#10231F'
  const soft = '#E9E7E1'
  const muted = '#4A5A55'
  x.direction = 'rtl'
  x.textAlign = 'right'
  x.textBaseline = 'middle'
  x.fillStyle = '#F7F6F2'
  x.fillRect(0, 0, W, H)
  x.fillStyle = col
  x.fillRect(0, 0, W, 70)
  x.fillStyle = '#fff'
  x.font = '800 30px Alexandria, Tahoma'
  x.direction = 'ltr'
  x.fillText(appName, W - 30, 36)
  x.direction = 'rtl'
  x.beginPath()
  x.arc(46, 35, 18, 0, Math.PI * 2)
  x.fillStyle = 'rgba(255,255,255,.35)'
  x.fill()
  x.fillStyle = ink
  x.fillRect(W - 120, 70, 120, H - 70)
  for (let i = 0; i < 6; i++) {
    x.fillStyle = i === 0 ? col : 'rgba(255,255,255,.18)'
    x.fillRect(W - 84, 104 + i * 74, 48, 48)
  }
  const L = 30
  const R = W - 150
  const CW = R - L
  const text = (t: string, px: number, py: number, font: string, fill: string, align: CanvasTextAlign = 'right') => {
    x.font = font
    x.fillStyle = fill
    x.textAlign = align
    x.fillText(t, px, py)
    x.textAlign = 'right'
  }
  const card = (cx: number, cy: number, w: number, h: number, label: string, val: string) => {
    x.fillStyle = '#fff'
    x.fillRect(cx, cy, w, h)
    text(label, cx + w - 18, cy + 30, '500 22px Readex Pro, Tahoma', muted)
    text(val, cx + w - 18, cy + 78, '800 40px Alexandria, Tahoma', ink)
  }
  const title = (t: string) => text(t, R, 108, '800 30px Alexandria, Tahoma', ink)

  if (kind === 'erp') {
    title('لوحة الإدارة')
    ;['المبيعات', 'المخزون', 'أوامر الشراء'].forEach((l, i) => card(R - (i + 1) * (CW / 3) + 10, 140, CW / 3 - 20, 110, l, ['٢٤٨', '١٬٢٠٤', '٣٦'][i]))
    x.fillStyle = '#fff'
    x.fillRect(L, 280, CW, 320)
    for (let i = 0; i < 10; i++) {
      const h = 60 + ((i * 47) % 170)
      x.fillStyle = i === 7 ? col : soft
      x.fillRect(L + 40 + i * ((CW - 80) / 10), 570 - h, (CW - 80) / 10 - 18, h)
    }
  } else if (kind === 'logistics') {
    title('تتبع الشحنات')
    x.fillStyle = '#E3EEEC'
    x.fillRect(L, 135, CW * 0.55, 465)
    x.strokeStyle = col
    x.lineWidth = 8
    x.beginPath()
    x.moveTo(L + 60, 560)
    x.bezierCurveTo(L + 160, 380, L + 260, 470, L + 420, 200)
    x.stroke()
    ;[
      [L + 60, 560],
      [L + 420, 200],
    ].forEach((p) => {
      x.beginPath()
      x.arc(p[0], p[1], 16, 0, Math.PI * 2)
      x.fillStyle = col
      x.fill()
    })
    ;['مع السائق', 'في الفرز', 'تم التسليم', 'في المستودع'].forEach((s, i) => {
      const y = 140 + i * 115
      x.fillStyle = '#fff'
      x.fillRect(L + CW * 0.58, y, CW * 0.42, 100)
      text('شحنة رقم ' + (1043 + i).toLocaleString('ar-EG'), R - 16, y + 32, '700 24px Readex Pro, Tahoma', ink)
      text(s, R - 16, y + 70, '500 20px Readex Pro, Tahoma', i === 0 ? col : '#9AA5A1')
    })
  } else if (kind === 'restaurant') {
    title('طلب جديد')
    ;['برجر', 'باستا', 'سلطة', 'قهوة', 'عصير', 'حلى', 'شوربة', 'دجاج', 'بيتزا'].forEach((n, i) => {
      const cx = R - ((i % 3) + 1) * 150
      const cy = 140 + Math.floor(i / 3) * 150
      x.fillStyle = i === 0 ? col : '#fff'
      x.fillRect(cx, cy, 136, 136)
      text(n, cx + 120, cy + 110, '700 24px Readex Pro, Tahoma', i === 0 ? '#fff' : ink)
    })
    x.fillStyle = '#fff'
    x.fillRect(L, 140, 340, 460)
    for (let i = 0; i < 4; i++) {
      x.fillStyle = soft
      x.fillRect(L + 24, 180 + i * 64, 292, 40)
    }
    x.fillStyle = col
    x.fillRect(L + 24, 520, 292, 60)
    text('إرسال للمطبخ', L + 290, 551, '800 26px Alexandria, Tahoma', '#fff')
  } else if (kind === 'gym') {
    title('تسجيل دخول الأعضاء')
    x.fillStyle = '#fff'
    x.fillRect(R - 520, 140, 520, 300)
    x.beginPath()
    x.arc(R - 90, 230, 60, 0, Math.PI * 2)
    x.fillStyle = soft
    x.fill()
    text('عضو رقم ٢٨٤', R - 180, 210, '800 34px Alexandria, Tahoma', ink)
    x.fillStyle = '#E2F2E8'
    x.fillRect(R - 470, 250, 280, 50)
    text('الاشتراك ساري', R - 210, 276, '700 24px Readex Pro, Tahoma', '#1E7A4C')
    x.fillStyle = col
    x.fillRect(L, 140, CW - 560, 300)
    text('تسجيل حضور', L + (CW - 560) / 2, 290, '900 46px Alexandria, Tahoma', '#fff', 'center')
    for (let i = 0; i < 2; i++) {
      x.fillStyle = '#fff'
      x.fillRect(L, 470 + i * 70, CW, 56)
    }
  } else if (kind === 'hr') {
    title('الحضور والانصراف')
    x.fillStyle = '#fff'
    x.fillRect(R - 460, 140, 460, 460)
    text('٠٩:٠٢', R - 230, 280, '900 110px Alexandria, Tahoma', ink, 'center')
    x.fillStyle = col
    x.fillRect(R - 400, 380, 340, 90)
    text('تسجيل حضور', R - 230, 426, '800 32px Alexandria, Tahoma', '#fff', 'center')
    for (let i = 0; i < 6; i++) {
      const y = 140 + i * 78
      x.fillStyle = '#fff'
      x.fillRect(L, y, CW - 490, 64)
      x.beginPath()
      x.arc(L + CW - 530, y + 32, 20, 0, Math.PI * 2)
      x.fillStyle = soft
      x.fill()
      x.fillStyle = i < 4 ? col : '#C9CFCC'
      x.fillRect(L + 20, y + 22, 90, 20)
    }
  } else {
    title('الدرس ٣: إدارة الوقت')
    x.fillStyle = ink
    x.fillRect(R - 600, 140, 600, 340)
    x.beginPath()
    x.moveTo(R - 330, 260)
    x.lineTo(R - 330, 360)
    x.lineTo(R - 250, 310)
    x.closePath()
    x.fillStyle = '#fff'
    x.fill()
    x.fillStyle = 'rgba(255,255,255,.2)'
    x.fillRect(R - 580, 450, 560, 8)
    x.fillStyle = col
    x.fillRect(R - 200, 450, 180, 8)
    for (let i = 0; i < 5; i++) {
      x.fillStyle = i === 2 ? col : '#fff'
      x.fillRect(L, 140 + i * 92, CW - 630, 76)
    }
  }
}

const ALU = new THREE.MeshStandardMaterial({ color: '#C9CCCF', metalness: 1, roughness: 0.32 })
const BLACK = new THREE.MeshStandardMaterial({ color: '#141617', roughness: 0.35 })
const screenMat = (tex: THREE.Texture) => new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.62, roughness: 0.2 })

export type DeviceKind = 'laptop' | 'flat' | 'stand' | 'kiosk'

/** Builds a device standing on y = 0. Sizes are in metres. */
export function device(kind: DeviceKind, tex: THREE.Texture) {
  const g = new THREE.Group()
  if (kind === 'laptop') {
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.012, 0.22, 3, 0.006), ALU)
    base.position.y = 0.006
    g.add(base)
    const lid = new THREE.Group()
    lid.position.set(0, 0.012, -0.11)
    lid.rotation.x = -0.32
    g.add(lid)
    const back = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.21, 0.006, 3, 0.003), ALU)
    back.position.y = 0.105
    lid.add(back)
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.19), screenMat(tex))
    scr.position.set(0, 0.105, 0.0035)
    lid.add(scr)
  } else if (kind === 'flat') {
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.27, 0.012, 0.19, 3, 0.006), BLACK)
    body.position.y = 0.006
    g.add(body)
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.156).rotateX(-Math.PI / 2), screenMat(tex))
    scr.position.y = 0.0125
    g.add(scr)
  } else {
    const h = kind === 'kiosk' ? 1.05 : 0.22
    const base = new THREE.Mesh(new THREE.CylinderGeometry(h > 0.5 ? 0.16 : 0.07, h > 0.5 ? 0.18 : 0.08, 0.02, 40), ALU)
    base.position.y = 0.01
    g.add(base)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, h, 20), ALU)
    pole.position.y = h / 2
    g.add(pole)
    const head = new THREE.Group()
    head.position.y = h
    head.rotation.x = -0.35
    g.add(head)
    head.add(new THREE.Mesh(new RoundedBoxGeometry(0.27, 0.19, 0.012, 3, 0.01), BLACK))
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.156), screenMat(tex))
    scr.position.z = 0.0065
    head.add(scr)
  }
  return g
}

/**
 * The seventh spot, "your next system": modules in the systems' colours drop onto a plate
 * and lock in with a small light, then lift away and assemble again in a new order.
 */
export function blueprint() {
  const g = new THREE.Group()
  const plate = new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.08, 1.5, 2, 0.03), new THREE.MeshStandardMaterial({ color: '#163b31', roughness: 0.6 }))
  plate.position.y = 0.04
  g.add(plate)
  // colour, x, z, width, height, depth
  const spec: [string, number, number, number, number, number][] = [
    ['#18306F', -0.62, -0.38, 0.6, 0.5, 0.55],
    ['#A5370A', 0.08, -0.38, 0.7, 0.3, 0.55],
    ['#0B4246', 0.7, -0.38, 0.45, 0.75, 0.55],
    ['#860F30', -0.62, 0.32, 0.6, 0.35, 0.6],
    ['#DFF7EC', 0.08, 0.32, 0.7, 0.55, 0.6],
    ['#2F7FA3', 0.7, 0.32, 0.45, 0.25, 0.6],
  ]
  const ledMat = new THREE.MeshBasicMaterial({ color: '#7DF5C4', transparent: true, toneMapped: false })
  const mods = spec.map(([c, x, z, w, h, d]) => {
    const m = new THREE.Group()
    const box = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.035), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.1 }))
    box.position.y = h / 2
    m.add(box)
    const led = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.02, 0.05), ledMat.clone())
    led.position.set(0, h + 0.011, d / 2 - 0.08)
    m.add(led)
    m.position.set(x, 0.08, z)
    g.add(m)
    return { m, led }
  })
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  const smooth = (v: number) => {
    v = clamp(v)
    return v * v * (3 - 2 * v)
  }
  // lands with a small overshoot, like a part clicking into place
  const land = (v: number) => {
    v = clamp(v)
    return 1 + 2.6 * Math.pow(v - 1, 3) + 1.6 * Math.pow(v - 1, 2)
  }
  const T = 7
  g.userData.tick = (time: number) => {
    // start at 70% of the cycle so the first (and any frozen) frame shows the finished build
    const t = time + T * 0.7
    const n = Math.floor(t / T)
    const k = (t % T) / T
    mods.forEach(({ m, led }, i) => {
      const slot = (i * 5 + n * 2) % 6
      const drop = land((k - 0.05 - slot * 0.08) / 0.16)
      const up = smooth((k - 0.86) / 0.12)
      m.position.y = 0.08 + (1 - drop) * 2.2 + up * 2.2
      m.visible = k > 0.05 + slot * 0.08 && up < 1
      m.rotation.y = (1 - drop) * 0.6
      const lit = clamp((k - 0.2 - slot * 0.08) / 0.06)
      ;(led.material as THREE.MeshBasicMaterial).opacity = lit * (0.6 + 0.4 * Math.sin(t * 6 + i))
    })
  }
  return g
}
