/**
 * physics.ts — the scientific model behind the virtual spring.
 *
 * Everything the apparatus does is derived from real equations:
 *   F = m g        (weight of the hanging masses)
 *   F = k x        (Hooke's law, up to the elastic limit)
 *
 * Nothing here is a decorative animation: the pixel position of the pointer
 * is computed from the same numbers a student would calculate by hand.
 */

/** Acceleration of free fall, m s^-2. */
export const G = 9.81

/** The vertical ruler runs from 0 cm at the top to 40 cm at the bottom. */
export const RULER_MIN_CM = 0
export const RULER_MAX_CM = 36

/** Ruler reading of the fixed point where the top of the spring is clamped. */
export const SPRING_ANCHOR_CM = 2.5

/** Length of the spring when nothing at all is hanging from it, in cm. */
export const NATURAL_LENGTH_CM = 7.0

/** Mass of the mass hanger itself, in grams. */
export const HANGER_MASS_G = 50

/** Slotted masses the student can add to the hanger, in grams. */
export const SLOTTED_MASSES_G = [50, 100] as const

/** Total mass the hook will physically accept, in grams. */
export const MAX_TOTAL_MASS_G = 500

/**
 * A particular spring. Each experiment gets a freshly made one so that a
 * student cannot simply memorise last session's answer.
 */
export interface Spring {
  /** True spring constant, N m^-1. Never shown to the student. */
  k: number
  /** Force beyond which the spring stops obeying Hooke's law, in N. */
  elasticLimitN: number
  /** Seed for the small, repeatable manufacturing imperfections. */
  seed: number
  /** Curvature of the response past the elastic limit, m N^-2. */
  beta: number
}

/** Creates a new spring with a plausible but unpredictable spring constant. */
export function createSpring(): Spring {
  return {
    k: round(24 + Math.random() * 12, 2), // 24 – 36 N/m
    elasticLimitN: round(4.2 + Math.random() * 0.4, 2), // ~430 – 470 g
    seed: Math.floor(Math.random() * 100000),
    beta: 0.018 + Math.random() * 0.008,
  }
}

/** Weight of a mass given in grams, in newtons. */
export function forceFromMassG(massG: number): number {
  return (massG / 1000) * G
}

/**
 * Small, deterministic imperfection (in cm) for a given load. Real apparatus
 * is never perfectly ideal, but it also does not change its mind between two
 * readings — so the same mass always gives the same tiny offset.
 */
function imperfectionCm(spring: Spring, massG: number): number {
  const x = Math.sin((massG + 1) * 12.9898 + spring.seed * 0.017) * 43758.5453
  const unit = x - Math.floor(x) // 0 – 1
  return (unit - 0.5) * 0.12 // roughly +/- 0.6 mm
}

/** Extension of the spring, in cm, for a load in grams. */
export function extensionCm(spring: Spring, massG: number): number {
  const F = forceFromMassG(massG)
  let xMetres = F / spring.k
  if (F > spring.elasticLimitN) {
    // Past the elastic limit the spring gives way more easily and the
    // force–extension line curves away from a straight line.
    xMetres += spring.beta * Math.pow(F - spring.elasticLimitN, 2)
  }
  return xMetres * 100 + (massG > 0 ? imperfectionCm(spring, massG) : 0)
}

/**
 * Where the pointer sits on the ruler, in cm. This is the one number the
 * student must obtain with their own eyes — it is never displayed as text.
 */
export function pointerReadingCm(spring: Spring, massG: number): number {
  const reading =
    SPRING_ANCHOR_CM + NATURAL_LENGTH_CM + extensionCm(spring, massG)
  return clamp(reading, RULER_MIN_CM, RULER_MAX_CM)
}

/** True whether this load has taken the spring past its elastic limit. */
export function isOverstretched(spring: Spring, massG: number): boolean {
  return forceFromMassG(massG) > spring.elasticLimitN
}

/** Least-squares gradient and intercept of y on x. Returns null if degenerate. */
export function leastSquares(
  points: { x: number; y: number }[],
): { gradient: number; intercept: number; r2: number } | null {
  const n = points.length
  if (n < 2) return null
  const meanX = points.reduce((s, p) => s + p.x, 0) / n
  const meanY = points.reduce((s, p) => s + p.y, 0) / n
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (const p of points) {
    sxx += (p.x - meanX) ** 2
    sxy += (p.x - meanX) * (p.y - meanY)
    syy += (p.y - meanY) ** 2
  }
  if (sxx === 0) return null
  const gradient = sxy / sxx
  const intercept = meanY - gradient * meanX
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy)
  return { gradient, intercept, r2 }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function round(value: number, dp: number): number {
  const f = Math.pow(10, dp)
  return Math.round(value * f) / f
}
