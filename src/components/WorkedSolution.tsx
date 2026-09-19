import { useMemo } from 'react'
import type { FeedbackReport } from '../lib/feedback'
import type { ExperimentState } from '../lib/types'
import { unitLabel } from '../lib/types'
import { impliedExtensionCm } from '../lib/store'
import { G, forceFromMassG, round } from '../lib/physics'
import { Callout } from './ui'

interface Props {
  state: ExperimentState
  report: FeedbackReport
}

/** True unless a value is null, NaN or +/- Infinity — never render those. */
function finite(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * The worked solution the student sees only after they submit. Wherever
 * possible it walks through their OWN numbers rather than a generic example,
 * so a mistake they made becomes visible in the very place it happened.
 */
export default function WorkedSolution({ state, report }: Props) {
  const exemplar = state.readings[state.readings.length - 1] ?? null

  const forceWorked = useMemo(() => {
    if (!exemplar) return null
    const massKg = exemplar.massG / 1000
    const trueForce = forceFromMassG(exemplar.massG)
    const studentOff = Math.abs(exemplar.forceN - trueForce) > 0.02
    return { massKg, trueForce, studentOff }
  }, [exemplar])

  const extensionWorked = useMemo(() => {
    if (!exemplar || state.zeroReadingCm === null) return null
    const correct = impliedExtensionCm(exemplar, state.zeroReadingCm)
    if (correct === null) return null
    const studentOff = Math.abs(exemplar.extensionCm - correct) > 0.15
    return { correct, studentOff }
  }, [exemplar, state.zeroReadingCm])

  const gradientWorked = useMemo(() => {
    if (!state.bestFit || !state.bestFit.touched || report.bestFitGradient === null) {
      return null
    }
    const dx = Math.abs(state.bestFit.x2 - state.bestFit.x1)
    const dy = Math.abs(state.bestFit.y2 - state.bestFit.y1)
    const kFromGraph = report.bestFitGradient * 100
    return { dx, dy, gradient: report.bestFitGradient, kFromGraph }
  }, [state.bestFit, report.bestFitGradient])

  const studentK = report.studentK
  const trueK = report.trueSpringConstant
  const kPercentDiff = report.kPercentDiff

  return (
    <div className="worked-solution">
      <ol className="worked-steps">
        <li className="worked-step">
          <div className="worked-step-title">A. Force from mass, F = mg</div>
          {forceWorked && exemplar ? (
            <div className="worked-step-body">
              <div className="eq">
                {exemplar.massG} g = {round(forceWorked.massKg, 3)} kg
              </div>
              <div className="eq">F = mg</div>
              <div className="eq">
                F = {round(forceWorked.massKg, 3)} × {G}
              </div>
              <div className="eq eq-result">
                F = {round(forceWorked.trueForce, 2)} N
              </div>
              {forceWorked.studentOff && (
                <div className="worked-note">
                  You entered {exemplar.forceN} N for this row.{' '}
                  {exemplar.forceN > 50
                    ? 'That looks like the mass in grams, not the weight in newtons — remember to convert to kilograms before multiplying by g.'
                    : `The correct value is ${round(forceWorked.trueForce, 2)} N — recheck your arithmetic.`}
                </div>
              )}
            </div>
          ) : (
            <Callout tone="neutral">
              No readings to show a worked example with — this step needs at
              least one row in your results table.
            </Callout>
          )}
        </li>

        <li className="worked-step">
          <div className="worked-step-title">B. Extension, x = l − l₀</div>
          {extensionWorked && exemplar ? (
            <div className="worked-step-body">
              <div className="eq">x = l − l₀</div>
              <div className="eq">
                x = {exemplar.lengthCm.toFixed(1)} − {state.zeroReadingCm?.toFixed(1)}
              </div>
              <div className="eq eq-result">
                x = {round(extensionWorked.correct, 2)} cm
              </div>
              {extensionWorked.studentOff && (
                <div className="worked-note">
                  You entered x = {exemplar.extensionCm} cm for this row, but l
                  − l₀ gives {round(extensionWorked.correct, 2)} cm. Check the
                  subtraction, not just the reading.
                </div>
              )}
            </div>
          ) : (
            <Callout tone="neutral">
              This step needs a recorded l₀ and at least one reading.
            </Callout>
          )}
        </li>

        <li className="worked-step">
          <div className="worked-step-title">C. Gradient of your line, ΔF / Δx</div>
          {gradientWorked ? (
            <div className="worked-step-body">
              <div className="eq">gradient = ΔF / Δx</div>
              <div className="eq">
                gradient = {round(gradientWorked.dy, 3)} / {round(gradientWorked.dx, 2)}
              </div>
              <div className="eq eq-result">
                gradient = {round(gradientWorked.gradient, 4)} N cm⁻¹
              </div>
            </div>
          ) : (
            <Callout tone="neutral">
              You did not leave a line of best fit drawn on your graph, so no
              gradient can be shown here.
            </Callout>
          )}
        </li>

        <li className="worked-step">
          <div className="worked-step-title">D. Converting N cm⁻¹ to N m⁻¹</div>
          {gradientWorked ? (
            <div className="worked-step-body">
              <div className="eq">1 m = 100 cm, so a gradient per cm is 100× larger per metre</div>
              <div className="eq">
                k = {round(gradientWorked.gradient, 4)} × 100
              </div>
              <div className="eq eq-result">
                k = {round(gradientWorked.kFromGraph, 2)} N m⁻¹
              </div>
            </div>
          ) : (
            <Callout tone="neutral">
              This conversion needs the gradient from step C.
            </Callout>
          )}
        </li>

        <li className="worked-step">
          <div className="worked-step-title">E. Why the gradient is the spring constant</div>
          <div className="worked-step-body">
            <div className="eq">Hooke&rsquo;s law: F = kx</div>
            <div className="eq">
              So on a graph of F (y-axis) against x (x-axis), the gradient IS
              k — the same equation, read straight off the graph.
            </div>
          </div>
        </li>

        <li className="worked-step">
          <div className="worked-step-title">F. Comparing the spring constants</div>
          <div className="worked-step-body">
            <div className="compare-grid">
              <div className="compare-cell">
                <div className="eyebrow">Your answer</div>
                <div className="compare-value">
                  {studentK === null
                    ? '—'
                    : `${studentK} ${unitLabel(state.answers.springConstantUnit) || ''}`}
                </div>
              </div>
              <div className="compare-cell">
                <div className="eyebrow">From your own graph</div>
                <div className="compare-value">
                  {gradientWorked ? `${round(gradientWorked.kFromGraph, 2)} N m⁻¹` : '—'}
                </div>
              </div>
              <div className="compare-cell">
                <div className="eyebrow">True value</div>
                <div className="compare-value">{trueK.toFixed(2)} N m⁻¹</div>
              </div>
            </div>
          </div>
        </li>

        <li className="worked-step">
          <div className="worked-step-title">G. Percentage difference</div>
          {studentK !== null && finite(kPercentDiff) ? (
            <div className="worked-step-body">
              <div className="eq">% difference = |student − true| / true × 100</div>
              <div className="eq">
                % difference = |{studentK} − {trueK.toFixed(2)}| / {trueK.toFixed(2)} × 100
              </div>
              <div className="eq eq-result">
                % difference = {round(kPercentDiff, 1)}%
              </div>
            </div>
          ) : (
            <Callout tone="neutral">
              You did not give a value for the spring constant, so there is
              nothing to compare here.
            </Callout>
          )}
        </li>

        <li className="worked-step">
          <div className="worked-step-title">H. What a strong conclusion looks like</div>
          <div className="worked-step-body">
            <p className="worked-example-text">
              &ldquo;My graph of force against extension is a straight line
              passing through the origin
              {gradientWorked ? '' : ' (once a proper line of best fit is drawn)'}
              , showing that force and extension are directly proportional —
              confirming Hooke&rsquo;s law, F = kx. The gradient of the line
              gives a spring constant of{' '}
              {gradientWorked ? round(gradientWorked.kFromGraph, 2) : trueK.toFixed(2)} N
              m⁻¹, close to the accepted value for this spring.&rdquo;
            </p>
          </div>
        </li>
      </ol>
    </div>
  )
}
