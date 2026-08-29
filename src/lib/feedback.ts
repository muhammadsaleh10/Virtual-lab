import {
  G,
  SPRING_ANCHOR_CM,
  NATURAL_LENGTH_CM,
  extensionCm,
  forceFromMassG,
  leastSquares,
  round,
} from './physics'
import type { ExperimentState } from './types'
import { studentExtensionCm } from './store'

export type Verdict = 'good' | 'warn' | 'poor'

export interface FeedbackItem {
  id: string
  /** Which practical skill this comments on. */
  skill: string
  verdict: Verdict
  title: string
  detail: string
}

export interface FeedbackReport {
  score: number
  band: string
  bandDetail: string
  items: FeedbackItem[]
  trueSpringConstant: number
  studentK: number | null
  bestFitGradient: number | null
}

const MAX_POINTS = 100

/** Reads a number out of a text field, tolerating blanks and stray spaces. */
function num(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function percentDiff(a: number, b: number): number {
  if (b === 0) return Infinity
  return Math.abs((a - b) / b) * 100
}

/**
 * Marks the whole practical. Everything here is a plain rule — there is no
 * model or API involved, and each rule maps onto something an examiner would
 * actually look for in a Cambridge AS/A Level practical.
 */
export function assess(state: ExperimentState): FeedbackReport {
  const items: FeedbackItem[] = []
  let score = 0
  /** Set when the final value for k is simply wrong, whatever else went well. */
  let resultIsWrong = false

  const rows = state.readings
  const trueK = state.spring.k

  // ---------------------------------------------------------------- readings
  // 1. Number of readings (max 15)
  if (rows.length >= 6) {
    score += 15
    items.push({
      id: 'count',
      skill: 'Range and quantity of data',
      verdict: 'good',
      title: `${rows.length} readings recorded`,
      detail:
        'Six or more readings is what an examiner expects. It gives you enough points to spot an anomaly and to draw a trustworthy line of best fit.',
    })
  } else if (rows.length >= 4) {
    score += 8
    items.push({
      id: 'count',
      skill: 'Range and quantity of data',
      verdict: 'warn',
      title: `Only ${rows.length} readings recorded`,
      detail:
        'You are expected to take at least six readings. With fewer than six, a single bad point can badly distort your gradient and you have no way of noticing it.',
    })
  } else {
    items.push({
      id: 'count',
      skill: 'Range and quantity of data',
      verdict: 'poor',
      title: `Too few readings (${rows.length})`,
      detail:
        'This is not enough data to justify a straight line. Take at least six readings across a wide range of masses.',
    })
  }

  // 2. Range of masses used (max 10)
  if (rows.length >= 2) {
    const masses = rows.map((r) => r.massG)
    const span = Math.max(...masses) - Math.min(...masses)
    if (span >= 300) {
      score += 10
      items.push({
        id: 'range',
        skill: 'Range and quantity of data',
        verdict: 'good',
        title: `Good range of masses (${span} g)`,
        detail:
          'Spreading your readings over a wide range makes the gradient far less sensitive to the uncertainty in each individual reading.',
      })
    } else {
      score += 4
      items.push({
        id: 'range',
        skill: 'Range and quantity of data',
        verdict: 'warn',
        title: `Narrow range of masses (${span} g)`,
        detail:
          'Your masses are bunched together, so your points cover only a short section of the line. Use the widest range the apparatus safely allows.',
      })
    }
  }

  // 3. Accuracy of the ruler readings (max 20)
  if (rows.length > 0) {
    const errors = rows.map((r) => {
      const expected =
        SPRING_ANCHOR_CM + NATURAL_LENGTH_CM + extensionCm(state.spring, r.massG)
      return Math.abs(r.lengthCm - expected)
    })
    const worst = Math.max(...errors)
    const mean = errors.reduce((s, e) => s + e, 0) / errors.length
    const badRows = rows.filter((_, i) => errors[i] > 0.25)

    if (worst <= 0.15) {
      score += 20
      items.push({
        id: 'accuracy',
        skill: 'Measurement technique',
        verdict: 'good',
        title: 'Ruler read accurately throughout',
        detail: `Every reading is within 1.5 mm of the true value (mean error ${round(mean * 10, 1)} mm). That is careful work — you clearly read the scale at eye level against the pointer.`,
      })
    } else if (worst <= 0.35) {
      score += 12
      items.push({
        id: 'accuracy',
        skill: 'Measurement technique',
        verdict: 'warn',
        title: 'Readings are slightly imprecise',
        detail: `Your largest error is ${round(worst * 10, 1)} mm. Read the millimetre scale at the exact level of the pointer and record to the nearest 0.1 cm — use the magnifier if the pointer sits between two marks.`,
      })
    } else {
      score += 4
      items.push({
        id: 'accuracy',
        skill: 'Measurement technique',
        verdict: 'poor',
        title: `${badRows.length} reading${badRows.length === 1 ? '' : 's'} are well off`,
        detail: `Your largest error is ${round(worst, 2)} cm, which is far more than reading uncertainty. Check that you are reading the pointer and not the bottom of the masses, and that you are not misreading which centimetre you are in.`,
      })
    }
  }

  // 4. Unloaded reading recorded (max 5)
  if (state.zeroReadingCm !== null) {
    const trueZero = SPRING_ANCHOR_CM + NATURAL_LENGTH_CM
    if (Math.abs(state.zeroReadingCm - trueZero) <= 0.25) {
      score += 5
      items.push({
        id: 'zero',
        skill: 'Measurement technique',
        verdict: 'good',
        title: 'Unloaded length measured correctly',
        detail:
          'Recording the unloaded pointer position first is essential — without it you cannot work out extension at all.',
      })
    } else {
      score += 2
      items.push({
        id: 'zero',
        skill: 'Measurement technique',
        verdict: 'warn',
        title: 'Unloaded reading looks inaccurate',
        detail:
          'Your unloaded reading is off by more than 2.5 mm. Usefully, this is a systematic error: it shifts every extension by the same amount, so your gradient survives it even though your extensions do not.',
      })
    }
  } else {
    items.push({
      id: 'zero',
      skill: 'Measurement technique',
      verdict: 'poor',
      title: 'No unloaded reading recorded',
      detail:
        'You never measured the spring with no load, so your extensions have no baseline.',
    })
  }

  // 5. Force calculations (max 10)
  if (rows.length > 0) {
    const wrong = rows.filter(
      (r) => percentDiff(r.forceN, forceFromMassG(r.massG)) > 2,
    )
    const looksLikeGrams = rows.filter((r) => r.forceN > 50).length
    if (wrong.length === 0) {
      score += 10
      items.push({
        id: 'force',
        skill: 'Processing data',
        verdict: 'good',
        title: 'Weights calculated correctly',
        detail:
          'You converted each mass to a force with W = mg correctly, including the conversion from grams to kilograms.',
      })
    } else if (looksLikeGrams > 0) {
      items.push({
        id: 'force',
        skill: 'Processing data',
        verdict: 'poor',
        title: 'Masses not converted to kilograms',
        detail:
          'Some of your force values are far too large. W = mg needs the mass in kilograms, so 200 g must become 0.200 kg, giving about 1.96 N — not 1962 N.',
      })
    } else {
      score += 4
      items.push({
        id: 'force',
        skill: 'Processing data',
        verdict: 'warn',
        title: `${wrong.length} force value${wrong.length === 1 ? '' : 's'} incorrect`,
        detail:
          'Recheck W = mg for the highlighted rows, using g = 9.81 m s⁻².',
      })
    }
  }

  // --------------------------------------------------------------- the graph
  // 6. Line of best fit (max 15)
  const dataPoints = rows
    .map((r) => {
      const x = studentExtensionCm(r, state.zeroReadingCm)
      return x === null ? null : { x, y: r.forceN }
    })
    .filter((p): p is { x: number; y: number } => p !== null)

  const fit = leastSquares(dataPoints)
  let bestFitGradient: number | null = null

  if (state.bestFit && state.bestFit.touched) {
    const { x1, y1, x2, y2 } = state.bestFit
    bestFitGradient = x2 - x1 === 0 ? null : (y2 - y1) / (x2 - x1)
  }

  if (bestFitGradient !== null && fit) {
    const diff = percentDiff(bestFitGradient, fit.gradient)
    if (diff <= 5) {
      score += 15
      items.push({
        id: 'bestfit',
        skill: 'Graph work',
        verdict: 'good',
        title: 'Line of best fit well placed',
        detail:
          'Your line passes through the middle of your points with a balanced scatter either side, so its gradient genuinely represents your data.',
      })
    } else if (diff <= 15) {
      score += 8
      items.push({
        id: 'bestfit',
        skill: 'Graph work',
        verdict: 'warn',
        title: 'Line of best fit is a little off',
        detail:
          'Your line does not sit centrally through your points. Aim for roughly equal numbers of points above and below it, along its whole length.',
      })
    } else {
      score += 2
      items.push({
        id: 'bestfit',
        skill: 'Graph work',
        verdict: 'poor',
        title: 'Line of best fit does not match your points',
        detail:
          'The gradient of your line differs a lot from the trend of your own data. Reposition it so it runs through the middle of the scatter rather than through the first and last points only.',
      })
    }
  } else {
    items.push({
      id: 'bestfit',
      skill: 'Graph work',
      verdict: 'poor',
      title: 'No line of best fit drawn',
      detail:
        'You cannot find a gradient without first drawing a straight line through your points.',
    })
  }

  // 7. Scatter of the student's own data (max 5)
  if (fit && dataPoints.length >= 4) {
    if (fit.r2 >= 0.99) {
      score += 5
      items.push({
        id: 'scatter',
        skill: 'Graph work',
        verdict: 'good',
        title: 'Points lie convincingly on a straight line',
        detail: `Your data has very little scatter (r² = ${round(fit.r2, 4)}), which is strong evidence that force and extension really are proportional here.`,
      })
    } else if (fit.r2 >= 0.95) {
      score += 3
      items.push({
        id: 'scatter',
        skill: 'Graph work',
        verdict: 'warn',
        title: 'Some scatter in your points',
        detail: `r² = ${round(fit.r2, 4)}. One or two readings are pulling away from the trend — worth re-measuring those masses.`,
      })
    } else {
      items.push({
        id: 'scatter',
        skill: 'Graph work',
        verdict: 'poor',
        title: 'Your points do not form a good straight line',
        detail: `r² = ${round(fit.r2, 4)}. Either some readings are wrong, or you have loaded the spring past its elastic limit.`,
      })
    }
  }

  // ------------------------------------------------------------- the analysis
  // 8. Spring constant value (max 15)
  const studentK = num(state.answers.springConstant)
  if (studentK !== null) {
    const diff = percentDiff(studentK, trueK)
    if (diff <= 5) {
      score += 15
      items.push({
        id: 'k-value',
        skill: 'Conclusion',
        verdict: 'good',
        title: `Spring constant accurate (within ${round(diff, 1)}%)`,
        detail: `You obtained ${studentK} N m⁻¹ against a true value of ${round(trueK, 2)} N m⁻¹. That is an excellent experimental result.`,
      })
    } else if (diff <= 15) {
      score += 9
      items.push({
        id: 'k-value',
        skill: 'Conclusion',
        verdict: 'warn',
        title: `Spring constant ${round(diff, 1)}% from the true value`,
        detail: `You obtained ${studentK} N m⁻¹; the spring's true constant was ${round(trueK, 2)} N m⁻¹. Close, but the gap is bigger than your reading uncertainty explains — check your line of best fit and your gradient arithmetic.`,
      })
    } else if (diff <= 130 && percentDiff(studentK * 100, trueK) <= 15) {
      score += 5
      resultIsWrong = true
      items.push({
        id: 'k-value',
        skill: 'Conclusion',
        verdict: 'poor',
        title: 'Centimetres never converted to metres',
        detail: `Your value is almost exactly 100 times too small. Your x-axis is in centimetres, so your gradient is in N cm⁻¹ — multiply by 100 to get N m⁻¹. The true value was ${round(trueK, 2)} N m⁻¹.`,
      })
    } else {
      resultIsWrong = true
      items.push({
        id: 'k-value',
        skill: 'Conclusion',
        verdict: 'poor',
        title: 'Spring constant is well off',
        detail: `You gave ${studentK}, but the spring's true constant was ${round(trueK, 2)} N m⁻¹. Work back through the gradient calculation step by step.`,
      })
    }
  } else {
    resultIsWrong = true
    items.push({
      id: 'k-value',
      skill: 'Conclusion',
      verdict: 'poor',
      title: 'No spring constant given',
      detail: 'The whole point of the experiment is to produce this number.',
    })
  }

  // 9. Units (max 5)
  const gradientUnitOk = state.answers.gradientUnit === 'N/cm'
  const kUnitOk = state.answers.springConstantUnit === 'N/m'
  if (gradientUnitOk && kUnitOk) {
    score += 5
    items.push({
      id: 'units',
      skill: 'Units',
      verdict: 'good',
      title: 'Units correct',
      detail:
        'Force in newtons over extension in centimetres gives a gradient in N cm⁻¹, and the spring constant is quoted in N m⁻¹. Both right.',
    })
  } else if (gradientUnitOk || kUnitOk) {
    score += 2
    items.push({
      id: 'units',
      skill: 'Units',
      verdict: 'warn',
      title: 'One unit is wrong',
      detail: `Your graph plots force (N) against extension (cm), so the gradient is in N cm⁻¹${gradientUnitOk ? '' : ' — not what you selected'}. The spring constant itself should be quoted in N m⁻¹${kUnitOk ? '' : ', which is not what you selected'}.`,
    })
  } else {
    items.push({
      id: 'units',
      skill: 'Units',
      verdict: 'poor',
      title: 'Units incorrect',
      detail:
        'A gradient of force over extension has units of N cm⁻¹ on this graph, and a spring constant is quoted in N m⁻¹. Marks are lost for missing or wrong units in every practical paper.',
    })
  }

  // 10. Elastic limit awareness (no score, but an important observation)
  const overloaded = rows.filter(
    (r) => forceFromMassG(r.massG) > state.spring.elasticLimitN,
  )
  const mentionsLimit = /elastic limit|limit of proportionality|proportional limit/i.test(
    state.answers.conclusion,
  )
  if (overloaded.length > 0) {
    items.push({
      id: 'elastic',
      skill: 'Experimental awareness',
      verdict: mentionsLimit ? 'good' : 'warn',
      title: mentionsLimit
        ? 'You spotted that the spring was overstretched'
        : `${overloaded.length} reading${overloaded.length === 1 ? ' was' : 's were'} past the elastic limit`,
      detail: mentionsLimit
        ? 'Correct — beyond the elastic limit the spring no longer obeys Hooke’s law, and those points curve away from the straight line. Noticing this is exactly what an examiner is looking for.'
        : `Loads above about ${round((state.spring.elasticLimitN / G) * 1000, 0)} g took this spring past its elastic limit, so those points curve away from the line and drag your gradient off. Either exclude them or mention them in your conclusion.`,
    })
  }

  // 11. Conclusion quality (no score cap issue — worth nothing numerically,
  //     but stated clearly so the student knows what a good one contains)
  const c = state.answers.conclusion.toLowerCase()
  const saysProportional = /proportional|linear|straight line/.test(c)
  const saysOrigin = /origin|zero|0,\s*0/.test(c)
  if (c.trim().length === 0) {
    items.push({
      id: 'conclusion',
      skill: 'Conclusion',
      verdict: 'poor',
      title: 'No conclusion written',
      detail:
        'State what your graph shows about the relationship between force and extension, and what that means physically.',
    })
  } else if (saysProportional && saysOrigin) {
    items.push({
      id: 'conclusion',
      skill: 'Conclusion',
      verdict: 'good',
      title: 'Clear, well-argued conclusion',
      detail:
        'You linked the straight line through the origin to direct proportionality, which is precisely the reasoning Hooke’s law requires. A straight line alone only shows a linear relationship; it is passing through the origin that makes it proportional.',
    })
  } else if (saysProportional) {
    items.push({
      id: 'conclusion',
      skill: 'Conclusion',
      verdict: 'warn',
      title: 'Conclusion nearly there',
      detail:
        'You have described the relationship, but say explicitly that the line passes through the origin. Without that, you have only shown a linear relationship, not a proportional one.',
    })
  } else {
    items.push({
      id: 'conclusion',
      skill: 'Conclusion',
      verdict: 'warn',
      title: 'Conclusion is too vague',
      detail:
        'Refer directly to the shape of your graph. A good conclusion names the relationship (proportional), the evidence (a straight line through the origin) and the quantity found (the spring constant, with units).',
    })
  }

  score = Math.max(0, Math.min(MAX_POINTS, Math.round(score)))

  let band = 'Needs more practice'
  let bandDetail =
    'The core skills are not secure yet. Work through the experiment again and pay close attention to the points raised below.'
  if (score >= 85) {
    band = 'Excellent practical work'
    bandDetail =
      'This is the standard expected in a strong A Level practical: careful measurement, honest data, and a properly justified conclusion.'
  } else if (score >= 70) {
    band = 'Strong practical work'
    bandDetail =
      'A solid experiment with a reliable result. Tighten up the points below and this would be full marks.'
  } else if (score >= 50) {
    band = 'Sound, with clear gaps'
    bandDetail =
      'Your method works and your result is in the right region, but several marks would be lost on technique and presentation.'
  }

  // Careful technique cannot rescue a wrong final answer: in a practical
  // paper, the value of k is where the marks are.
  if (resultIsWrong && score >= 70) {
    band = 'Sound, with clear gaps'
    bandDetail =
      'Your measuring and graph work were strong, but the value you reported for the spring constant is wrong — and that is what the experiment was for. Fix the point flagged below and this becomes top-band work.'
  }

  return {
    score,
    band,
    bandDetail,
    items,
    trueSpringConstant: round(trueK, 2),
    studentK,
    bestFitGradient,
  }
}
