import { HANGER_MASS_G, type Spring } from './physics'

/**
 * 'tutorial' is a one-time onboarding pre-stage: it is deliberately not in
 * STAGES below, so it never appears in the stepper and never counts as a
 * step the student can jump back to.
 */
export type Stage = 'tutorial' | 'setup' | 'measure' | 'graph' | 'analysis' | 'feedback'

export const STAGES: { id: Stage; label: string }[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'measure', label: 'Measure' },
  { id: 'graph', label: 'Graph' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'feedback', label: 'Feedback' },
]

/** One row the student has written into their results table. */
export interface Reading {
  id: string
  /** Total mass hanging on the spring, in grams. Known from the labels. */
  massG: number
  /** Ruler reading the student says they saw, in cm. Their own measurement. */
  lengthCm: number
  /** Extension the student calculated as x = l - l0. Their own arithmetic. */
  extensionCm: number
  /** Force the student calculated, in N. Their own calculation. */
  forceN: number
}

/** The straight line the student has positioned over their own points. */
export interface BestFit {
  /** Two handles, in graph data coordinates (x = extension/cm, y = force/N). */
  x1: number
  y1: number
  x2: number
  y2: number
  /** Set once the student has actually moved a handle. */
  touched: boolean
}

export interface Answers {
  gradient: string
  gradientUnit: string
  springConstant: string
  springConstantUnit: string
  conclusion: string
}

export interface ExperimentState {
  stage: Stage
  spring: Spring
  /** Is the mass hanger hooked on to the spring? */
  hangerAttached: boolean
  /** Slotted masses currently on the hanger, in grams, in the order added. */
  slotted: number[]
  /** The unloaded reading the student recorded in Setup, in cm. */
  zeroReadingCm: number | null
  readings: Reading[]
  bestFit: BestFit | null
  answers: Answers
  submitted: boolean
}

/** Proper scientific notation for each unit the student can choose. */
export const UNIT_LABELS: Record<string, string> = {
  'N/cm': 'N cm⁻¹',
  'N/m': 'N m⁻¹',
  'cm/N': 'cm N⁻¹',
  'm/N': 'm N⁻¹',
  N: 'N',
}

export function unitLabel(unit: string): string {
  return UNIT_LABELS[unit] ?? unit
}

export const EMPTY_ANSWERS: Answers = {
  gradient: '',
  gradientUnit: '',
  springConstant: '',
  springConstantUnit: '',
  conclusion: '',
}

/** Total mass hanging on the spring right now, in grams. */
export function totalMassG(state: {
  hangerAttached: boolean
  slotted: number[]
}): number {
  if (!state.hangerAttached) return 0
  return HANGER_MASS_G + state.slotted.reduce((sum, m) => sum + m, 0)
}
