/** Shared drawing geometry for the apparatus, in SVG user units. */
export const VB_W = 560
export const VB_H = 700

/** Ruler reading 0 cm sits at this y, and each cm is SCALE units. */
export const Y0 = 40
export const SCALE = 14

export const ROD_X = 150
export const ROD_W = 11
export const SPRING_X = 225
export const SPRING_RADIUS = 13

export const RULER_X = 270
export const RULER_W = 52
export const TICK_MAJOR = 20
export const TICK_MID = 14
export const TICK_MINOR = 8
export const LABEL_X = RULER_X + 24

/** The magnifier window, and how much it enlarges the scale. */
export const MAG = { x: 358, y: 188, w: 192, h: 266 }
export const MAG_ZOOM = 3.6
/** Where the left edge of the ruler lands inside the magnifier. */
export const MAG_ANCHOR_X = MAG.x + 46

export function cmToY(cm: number): number {
  return Y0 + cm * SCALE
}
