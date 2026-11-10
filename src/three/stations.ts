/**
 * What stands in the gallery, and how the camera frames each system.
 *
 * Models are real photo-scanned objects from Poly Haven (CC0 licence), stored in
 * /public/models. Sizes are in metres; each station is scaled to the same footprint.
 * To swap an object: drop a new .glb into /public/models and change `file` below.
 */

export interface Item {
  /** File name in /public/models without .glb, or '@dumbbell' for the built-in dumbbell */
  file: string
  id?: string
  x?: number
  z?: number
  /** Place on top of the item with this id instead of on the floor */
  on?: string
  rx?: number
  ry?: number
  rz?: number
}

/**
 * Text layouts. The picture moves to make room:
 * 'a' text on the right, object on the left
 * 'b' text on the left, object on the right
 * 'c' headline across the bottom, object up top
 */
export type Layout = 'a' | 'b' | 'c'

export interface Shot {
  /** Camera angle around the pedestal, 0 = straight in front */
  az: number
  dist: number
  height: number
  /** Height the camera looks at */
  look: number
  layout: Layout
}

export interface Station {
  items: Item[]
  shot: Shot
}

/** One entry per system, in the same order as `systems` in content/site.ts. */
export const STATIONS: Station[] = [
  {
    // ERP: a filing cabinet with a clipboard and a stapler
    items: [
      { id: 'cab', file: 'vintage_wooden_drawer_01' },
      { file: 'clipboard', on: 'cab', x: -0.42, z: 0.05, ry: 0.35 },
      { file: 'vintage_stapler', on: 'cab', x: 0.4, z: 0.12, ry: -0.6 },
    ],
    shot: { az: -0.35, dist: 6.4, height: 2.4, look: 1.08, layout: 'a' },
  },
  {
    // Logistics: stacked boxes and a hand truck
    items: [
      { id: 'b1', file: 'cardboard_box_01', x: -0.32, z: 0, ry: 0.1 },
      { file: 'cardboard_box_01', on: 'b1', x: -0.3, z: 0.02, ry: -0.3 },
      { file: 'cardboard_box_01', x: 0.18, z: 0.42, ry: 0.65 },
      { file: 'hand_truck', x: 0.58, z: -0.2, ry: -0.75 },
    ],
    shot: { az: 0.4, dist: 6.1, height: 3.4, look: 0.96, layout: 'b' },
  },
  {
    // Restaurant: produce crate with a board, croissant and lemons, menu board behind
    items: [
      { id: 'crate', file: 'plastic_crate_02', x: 0.18, z: 0.28, ry: 0.25 },
      { id: 'board', file: 'wooden_cutting_board', on: 'crate', x: 0.18, z: 0.28, ry: 0.25 },
      { file: 'croissant', on: 'board', x: 0.12, z: 0.25, ry: 0.7 },
      { file: 'lemon', on: 'board', x: 0.3, z: 0.33 },
      { file: 'lemon', x: 0.55, z: 0.55 },
      { file: 'standing_chalkboard_01', x: -0.4, z: -0.35, ry: 0.45 },
    ],
    shot: { az: -0.1, dist: 10.1, height: 3.7, look: 1.68, layout: 'c' },
  },
  {
    // Gym: two tyres, a sledgehammer and a dumbbell
    items: [
      { id: 't1', file: 'old_tyre', rx: Math.PI / 2 },
      { file: 'old_tyre', on: 't1', rx: Math.PI / 2, x: 0.05, z: -0.04, ry: 0.4 },
      { file: 'sledgehammer_01', x: 0.15, z: 0.55, rz: Math.PI / 2, ry: 0.25 },
      { file: '@dumbbell', x: -0.5, z: 0.15, ry: 1.2 },
    ],
    shot: { az: 0.45, dist: 5.7, height: 3.2, look: 0.72, layout: 'a' },
  },
  {
    // HR: office chair, attendance clock, clipboard
    items: [
      { file: 'modern_arm_chair_01', ry: 0.45 },
      { file: 'alarm_clock_01', x: 0.68, z: 0.55, ry: -0.5 },
      { file: 'clipboard', x: -0.55, z: 0.62, ry: -0.4 },
    ],
    shot: { az: -0.45, dist: 6.4, height: 2.5, look: 1.14, layout: 'b' },
  },
  {
    // Learning: a row of books, a notebook and reading glasses
    items: [
      { file: 'book_encyclopedia_set_01', x: -0.12, z: -0.08 },
      { id: 'note', file: 'binder_notebook', x: 0.05, z: 0.24, ry: 0.15 },
      { file: 'round_spectacles', on: 'note', x: 0.1, z: 0.26, ry: 0.5 },
    ],
    shot: { az: 0.15, dist: 9.0, height: 5.5, look: 0.84, layout: 'c' },
  },
]

export const GALLERY = {
  gap: 4.3, // distance between pedestals along the line
  stagger: 0.9, // pedestals alternate forward and back by this much
  pedestalRadius: 1.8,
  pedestalHeight: 0.5,
  stationSize: 2.4, // every station is scaled to this footprint
  heroFill: 0.96, // share of the screen width the line fills in the opening view
}

/** The opening view: the whole line, seen from the front. The distance is fitted to the screen width at runtime. */
export const HERO_SHOT = { pos: [0, 12.5, 31] as const, look: [0, 0.6, 0] as const }
/** On phones the line is seen end-on so it fits the narrow screen. */
export const HERO_SHOT_MOBILE = { pos: [-40, 36, 14] as const, look: [1.5, 0, 0] as const }

export const MODEL_FILES = Array.from(new Set(STATIONS.flatMap((s) => s.items.map((i) => i.file)).filter((f) => !f.startsWith('@'))))
