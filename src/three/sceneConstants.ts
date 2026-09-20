import { RULER_MAX_CM, RULER_MIN_CM, SPRING_ANCHOR_CM } from '../lib/physics'

/**
 * The 3D scene's own coordinate mapping — the visual equivalent of
 * `components/geometry.ts` for the 2D apparatus. It never computes physics;
 * it only turns a "cm from the top of the ruler" value (as physics.ts
 * already produces) into a Three.js world Y position.
 */

/** 1 cm of ruler becomes this many Three.js world units. */
export const UNIT = 0.16

/** The bench surface sits at world Y = 0. */
export const BENCH_TOP_Y = 0

/** Height of the retort stand's rod above the bench. */
export const ROD_HEIGHT = (RULER_MAX_CM - RULER_MIN_CM) * UNIT + 3.4

/** World Y of the ruler's 0 cm mark (its top). */
export const RULER_TOP_Y = BENCH_TOP_Y + ROD_HEIGHT - 1.2

/** Converts a "cm from the top of the ruler" reading into world Y. */
export function cmToWorldY(cm: number): number {
  return RULER_TOP_Y - cm * UNIT
}

export const ANCHOR_WORLD_Y = cmToWorldY(SPRING_ANCHOR_CM)

/** Horizontal placement, shared by every part of the apparatus. */
export const ROD_X = -1.6
export const SPRING_X = 0
export const RULER_X = 1.5

/** Where the clickable spare masses sit, off to the side on the bench. */
export const TRAY_X = 3.2
