/**
 * What stands in the gallery, and how the camera frames each stop.
 *
 * Models are real photo-scanned objects from Poly Haven (CC0 licence), stored in
 * /public/models. Sizes are in metres; each station is scaled to the same footprint
 * (devices are left out of that measurement so adding one does not shrink the scene).
 * To swap an object: drop a new .glb into /public/models and change `file` below.
 */
import type { DeviceKind, ScreenKind } from './devices'

export interface Item {
  /** File name in /public/models without .glb */
  file?: string
  /** A device showing this system's interface */
  dev?: DeviceKind
  /** Built-in pieces */
  special?: string
  id?: string
  x?: number
  z?: number
  /** Place on top of the item with this id instead of on the floor */
  on?: string
  rx?: number
  ry?: number
  rz?: number
  /** Extra scale for this item */
  s?: number
}

/**
 * Text layouts. The picture moves to make room:
 * 'a' text on the right, object on the left
 * 'b' text on the left, object on the right
 * 'c' headline across the bottom, object up top
 */
export type Layout = 'a' | 'b' | 'c'

export interface Shot {
  /** Camera angle around the spot, 0 = straight in front */
  az: number
  dist: number
  height: number
  /** Height the camera looks at */
  look: number
  layout: Layout
}

export interface Station {
  screen?: ScreenKind
  items: Item[]
  shot: Shot
}

/** One entry per tour stop, in the same order as `tourStops` in content/site.ts. */
export const STATIONS: Station[] = [
  {
    // ERP: a working office desk with notepads, stationery, a desk lamp, a plant, and a laptop running the dashboard
    screen: 'erp',
    items: [
      { id: 'desk', file: 'metal_office_desk' },
      { file: 'office_notepads', on: 'desk', x: -0.42, z: 0.12, ry: 0.1 },
      { file: 'stationery_supplies', on: 'desk', x: 0.62, z: -0.22, ry: -0.3 },
      { file: 'desk_lamp_arm_01', on: 'desk', x: -0.78, z: -0.22, ry: 0.7 },
      { file: 'potted_plant_04', on: 'desk', x: 0.84, z: 0.18 },
      { dev: 'laptop', on: 'desk', x: 0.18, z: 0.04, ry: -0.18, s: 1.4 },
    ],
    shot: { az: -0.35, dist: 6.4, height: 2.4, look: 1.08, layout: 'a' },
  },
  {
    // Logistics: labelled cartons on a pallet, a pallet truck, stacked totes, and a tablet tracking shipments
    screen: 'logistics',
    items: [
      { id: 'pal', special: 'pallet' },
      { id: 'c1', special: 'cartonL', on: 'pal', x: -0.28, z: 0.12 },
      { id: 'c2', special: 'cartonL', on: 'pal', x: 0.32, z: 0.12 },
      { id: 'c3', special: 'cartonS', on: 'c1', x: -0.25, z: 0.12, ry: 0.06 },
      { special: 'cartonS', on: 'c2', x: 0.3, z: 0.1, ry: -0.08 },
      { special: 'cartonS', on: 'pal', x: 0.0, z: -0.24, ry: 0.02 },
      { special: 'palletJack', x: 0.35, z: 1.0, ry: 0.1 },
      { id: 't1', special: 'tote', x: -1.0, z: 0.2, ry: 0.3 },
      { id: 't2', special: 'toteGrey', on: 't1', x: -1.0, z: 0.2, ry: 0.25 },
      { special: 'tote', on: 't2', x: -1.0, z: 0.2, ry: 0.35 },
      { dev: 'flat', on: 'c3', x: -0.25, z: 0.14, ry: 0.25 },
    ],
    shot: { az: 0.4, dist: 6.1, height: 3.4, look: 0.96, layout: 'b' },
  },
  {
    // Restaurant: a modern steel prep counter with fresh produce, buns, a stock pot and a cake; a digital menu screen; the POS tablet
    screen: 'restaurant',
    items: [
      { id: 'counter', special: 'steelCounter' },
      { id: 'board', file: 'wooden_cutting_board', on: 'counter', x: -0.3, z: 0.05, ry: 0.1, s: 1.3 },
      { file: 'fish_knife', on: 'board', x: -0.3, z: 0.1, rx: Math.PI / 2, ry: 1.4, s: 1.4 },
      { file: 'yellow_onion', on: 'board', x: -0.5, z: 0.0, s: 1.5 },
      { file: 'food_avocado_01', on: 'board', x: -0.12, z: 0.0, rz: 1.45, s: 1.5 },
      { file: 'food_lime_01', on: 'counter', x: 0.02, z: 0.2, s: 1.5 },
      { file: 'hamburger_buns', on: 'counter', x: 0.08, z: -0.17, ry: 0.15, s: 1.4 },
      { special: 'stockPot', on: 'counter', x: 0.53, z: -0.12, s: 1.2 },
      { id: 'plate', special: 'plate', on: 'counter', x: 0.36, z: 0.15, s: 1.3 },
      { file: 'strawberry_chocolate_cake', on: 'plate', x: 0.36, z: 0.15, s: 1.3 },
      { dev: 'stand', on: 'counter', x: 0.16, z: 0.2, ry: -0.25 },
      { dev: 'kiosk', x: -0.98, z: -0.15, ry: 0.4 },
    ],
    shot: { az: -0.25, dist: 5.8, height: 2.6, look: 0.95, layout: 'a' },
  },
  {
    // Gym: an adjustable bench, a dumbbell rack, competition kettlebells, a medicine ball, a yoga mat, and the check-in kiosk
    screen: 'gym',
    items: [
      { special: 'dumbbellRack', x: -0.15, z: -0.45 },
      { special: 'bench', x: 0.1, z: 0.32, ry: -0.35 },
      { special: 'kbPink', x: -0.7, z: 0.35, ry: 0.4, s: 1.25 },
      { special: 'kbBlue', x: -0.45, z: 0.55, ry: -0.3, s: 1.25 },
      { special: 'kbYellow', x: -0.8, z: 0.68, ry: 0.9, s: 1.05 },
      { special: 'medBall', x: 0.45, z: 0.8 },
      { special: 'yogaMat', x: 0.85, z: 0.1, ry: 1.2 },
      { dev: 'kiosk', x: 0.95, z: -0.45, ry: -0.45 },
    ],
    shot: { az: 0.45, dist: 5.7, height: 3.0, look: 0.6, layout: 'b' },
  },
  {
    // HR: a modern white cabinet with personnel folders, an ID badge, a clock and a plant; a lounge chair; the attendance kiosk
    screen: 'hr',
    items: [
      { id: 'cab', special: 'sideboard', x: -0.3, z: -0.15 },
      { special: 'folders', on: 'cab', x: -0.75, z: -0.18 },
      { special: 'deskClock', on: 'cab', x: -0.25, z: -0.2, ry: 0.15 },
      { special: 'badge', on: 'cab', x: 0.0, z: 0.05, ry: 0.5 },
      { file: 'potted_plant_04', on: 'cab', x: 0.25, z: -0.15, s: 1.3 },
      { special: 'loungeChair', x: 0.75, z: 0.45, ry: -0.6 },
      { dev: 'kiosk', x: -0.2, z: 0.6, ry: 0.15 },
    ],
    shot: { az: -0.4, dist: 6.0, height: 2.4, look: 0.85, layout: 'a' },
  },
  {
    // Learning: a modern study desk with a laptop playing a lesson, new books, headphones, a mug and a plant; an ergonomic chair
    screen: 'learning',
    items: [
      { id: 'desk', special: 'modernDesk' },
      { special: 'taskChair', x: 0.1, z: -0.55, ry: 0.25 },
      { dev: 'laptop', on: 'desk', x: -0.05, z: -0.04, ry: 0.12, s: 1.2 },
      { special: 'bookStack', on: 'desk', x: -0.42, z: -0.05, ry: 0.3 },
      { special: 'headphones', on: 'desk', x: 0.32, z: 0.12, ry: -0.6 },
      { special: 'mug', on: 'desk', x: 0.4, z: -0.15 },
      { file: 'potted_plant_04', on: 'desk', x: 0.5, z: -0.2 },
      { file: 'binder_notebook', on: 'desk', x: 0.12, z: 0.18, ry: 0.15, s: 0.55 },
    ],
    shot: { az: 0.3, dist: 10.5, height: 4.2, look: 0.8, layout: 'b' },
  },
  {
    // Your next system: a blueprint that keeps building itself
    items: [{ special: 'blueprint' }],
    shot: { az: -0.25, dist: 6.4, height: 2.6, look: 1.0, layout: 'a' },
  },
]

export const GALLERY = {
  tile: 2.3, // each system stands on a floating tile this wide
  tileGap: 0.3, // space between tiles
  tileHeight: 0.16, // thickness of a tile
  stationSize: 2.0, // every station is scaled to this footprint
  heroFill: 0.5, // share of the screen width the cluster fills in the opening view
}

/** The lamp: how high it hangs over the overview and over each system. */
export const LAMP = { file: 'modern_ceiling_lamp_01', scale: 1.7, heroHeight: 6.4, stopHeight: 5.4, heroAngle: 1.05, stopAngle: 0.5 }

/** The opening view: the whole line, seen from the front. The distance is fitted to the screen width at runtime. */
export const HERO_SHOT = { pos: [0, 14, 27] as const, look: [0, 1.6, 0] as const }
/** On phones the line is seen end-on so it fits the narrow screen. */
export const HERO_SHOT_MOBILE = { pos: [-40, 36, 14] as const, look: [1.5, 0, 0] as const }

export const MODEL_FILES = Array.from(new Set(STATIONS.flatMap((s) => s.items.map((i) => i.file)).filter((f): f is string => !!f))).concat(LAMP.file)
