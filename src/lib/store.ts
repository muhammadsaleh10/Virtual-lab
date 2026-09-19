import { useCallback, useEffect, useReducer } from 'react'
import {
  MAX_TOTAL_MASS_G,
  createSpring,
  extensionCm,
  forceFromMassG,
} from './physics'
import {
  EMPTY_ANSWERS,
  type Answers,
  type BestFit,
  type ExperimentState,
  type Reading,
  type Stage,
  totalMassG,
} from './types'

const STORAGE_KEY = 'vsl.hookes-law.v1'

export function createInitialState(): ExperimentState {
  return {
    stage: 'tutorial',
    spring: createSpring(),
    hangerAttached: false,
    slotted: [],
    zeroReadingCm: null,
    readings: [],
    bestFit: null,
    answers: { ...EMPTY_ANSWERS },
    submitted: false,
  }
}

export type Action =
  | { type: 'goToStage'; stage: Stage }
  | { type: 'attachHanger' }
  | { type: 'removeHanger' }
  | { type: 'addMass'; grams: number }
  | { type: 'removeLastMass' }
  | { type: 'clearMasses' }
  | { type: 'setZeroReading'; value: number | null }
  | { type: 'addReading'; reading: Reading }
  | { type: 'updateReading'; id: string; patch: Partial<Reading> }
  | { type: 'deleteReading'; id: string }
  | { type: 'setBestFit'; bestFit: BestFit }
  | { type: 'setAnswer'; key: keyof Answers; value: string }
  | { type: 'submit' }
  | { type: 'unsubmit' }
  | { type: 'reset' }

function reducer(state: ExperimentState, action: Action): ExperimentState {
  switch (action.type) {
    case 'goToStage':
      return { ...state, stage: action.stage }

    case 'attachHanger':
      return { ...state, hangerAttached: true }

    case 'removeHanger':
      return { ...state, hangerAttached: false, slotted: [] }

    case 'addMass': {
      if (!state.hangerAttached) return state
      const next = [...state.slotted, action.grams]
      if (totalMassG({ hangerAttached: true, slotted: next }) > MAX_TOTAL_MASS_G) {
        return state
      }
      return { ...state, slotted: next }
    }

    case 'removeLastMass':
      return { ...state, slotted: state.slotted.slice(0, -1) }

    case 'clearMasses':
      return { ...state, slotted: [] }

    case 'setZeroReading':
      return { ...state, zeroReadingCm: action.value }

    case 'addReading':
      return {
        ...state,
        readings: [...state.readings, action.reading].sort(
          (a, b) => a.massG - b.massG,
        ),
        // Any new data invalidates a line the student drew earlier.
        bestFit: null,
      }

    case 'updateReading':
      return {
        ...state,
        readings: state.readings.map((r) =>
          r.id === action.id ? { ...r, ...action.patch } : r,
        ),
        bestFit: null,
      }

    case 'deleteReading':
      return {
        ...state,
        readings: state.readings.filter((r) => r.id !== action.id),
        bestFit: null,
      }

    case 'setBestFit':
      return { ...state, bestFit: action.bestFit }

    case 'setAnswer':
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value },
      }

    case 'submit':
      return { ...state, submitted: true, stage: 'feedback' }

    case 'unsubmit':
      return { ...state, submitted: false }

    case 'reset':
      // A genuine reset: a brand new spring, and nothing carried over.
      return createInitialState()

    default:
      return state
  }
}

/**
 * V1 saved sessions (already live on Vercel) predate the `extensionCm` field
 * on Reading, and predate the 'tutorial' stage. Backfill both so a returning
 * student's old localStorage never produces NaN in a graph or gets stuck on
 * a stage that no longer exists.
 */
function migrate(parsed: ExperimentState): ExperimentState {
  const zero = typeof parsed.zeroReadingCm === 'number' ? parsed.zeroReadingCm : null
  const readings = Array.isArray(parsed.readings)
    ? parsed.readings.map((r) => {
        const derived = zero !== null ? r.lengthCm - zero : 0
        return {
          ...r,
          extensionCm: Number.isFinite(r.extensionCm) ? r.extensionCm : derived,
        }
      })
    : []
  const validStages: Stage[] = ['tutorial', 'setup', 'measure', 'graph', 'analysis', 'feedback']
  const stage = validStages.includes(parsed.stage) ? parsed.stage : 'setup'
  return { ...parsed, stage, readings }
}

function load(): ExperimentState {
  if (typeof window === 'undefined') return createInitialState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as ExperimentState
    // Guard against an older or corrupted shape.
    if (!parsed || typeof parsed !== 'object' || !parsed.spring) {
      return createInitialState()
    }
    return migrate({ ...createInitialState(), ...parsed })
  } catch {
    return createInitialState()
  }
}

export function useExperiment() {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Private browsing or a full quota: the app still works, it just forgets.
    }
  }, [state])

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    dispatch({ type: 'reset' })
  }, [])

  return { state, dispatch, reset }
}

/**
 * The extension that l - l0 arithmetic implies for a row, using the
 * student's own recorded l0. This is NOT what gets plotted — the student
 * enters and owns `reading.extensionCm` themselves — this exists only so
 * feedback can check whether their subtraction was correct.
 */
export function impliedExtensionCm(
  reading: Reading,
  zeroReadingCm: number | null,
): number | null {
  if (zeroReadingCm === null) return null
  return reading.lengthCm - zeroReadingCm
}

/** The value the apparatus would truly have shown. Used only for marking. */
export function trueReadingsFor(state: ExperimentState) {
  return state.readings.map((r) => ({
    reading: r,
    trueExtensionCm: extensionCm(state.spring, r.massG),
    trueForceN: forceFromMassG(r.massG),
  }))
}
