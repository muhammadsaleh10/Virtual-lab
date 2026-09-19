import { useMemo } from 'react'
import type { Action } from '../lib/store'
import { unitLabel, type Answers, type ExperimentState } from '../lib/types'
import GraphPlot from '../components/GraphPlot'
import { dataPointsFor } from './GraphStep'
import { Callout, Readout } from '../components/ui'
import { round } from '../lib/physics'

interface Props {
  state: ExperimentState
  dispatch: React.Dispatch<Action>
}

const GRADIENT_UNITS = ['N/cm', 'N/m', 'N', 'cm/N']
const K_UNITS = ['N/m', 'N/cm', 'N', 'm/N']

export default function AnalysisStep({ state, dispatch }: Props) {
  const points = useMemo(() => dataPointsFor(state), [state])
  const fit = state.bestFit

  const triangle = useMemo(() => {
    if (!fit || !fit.touched) return null
    const dx = fit.x2 - fit.x1
    const dy = fit.y2 - fit.y1
    if (Math.abs(dx) < 1e-9) return null
    return { dx, dy }
  }, [fit])

  const set = (key: keyof Answers) => (value: string) =>
    dispatch({ type: 'setAnswer', key, value })

  return (
    <div>
      <h2 className="panel-title">Find the spring constant</h2>
      <p className="panel-intro">
        Hooke&rsquo;s law says <span className="mono">F = kx</span>. So on a
        graph of force against extension, the gradient of the line is the spring
        constant.
      </p>

      <div className="panel-section">
        <div className="graph-card">
          <div className="graph-title">Your line of best fit</div>
          <GraphPlot
            points={points}
            bestFit={state.bestFit}
            onBestFitChange={(bestFit) => dispatch({ type: 'setBestFit', bestFit })}
            showConstruction
            height={360}
          />
        </div>

        {triangle ? (
          <div className="readout-grid">
            <Readout
              label="Δx from your triangle"
              value={round(Math.abs(triangle.dx), 2).toFixed(2)}
              unit="cm"
            />
            <Readout
              label="ΔF from your triangle"
              value={round(Math.abs(triangle.dy), 3).toFixed(3)}
              unit="N"
            />
          </div>
        ) : (
          <div style={{ marginTop: 'var(--s-3)' }}>
            <Callout tone="warn">
              You have not positioned a line of best fit yet. Drag the two
              handles onto your data before working out a gradient.
            </Callout>
          </div>
        )}
      </div>

      <div className="panel-section">
        <div className="entry-card">
          <div className="eyebrow">Step 1 — gradient of your line</div>
          <div className="entry-grid">
            <div className="field">
              <label className="field-label" htmlFor="gradient">
                Gradient
              </label>
              <input
                id="gradient"
                className="input input-numeric"
                inputMode="decimal"
                placeholder="0.000"
                value={state.answers.gradient}
                onChange={(e) => set('gradient')(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="gradient-unit">
                Unit
              </label>
              <select
                id="gradient-unit"
                className="select"
                value={state.answers.gradientUnit}
                onChange={(e) => set('gradientUnit')(e.target.value)}
              >
                <option value="">Choose…</option>
                {GRADIENT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {unitLabel(u)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-hint">
            Divide the change in force by the change in extension between your
            two handles. Think carefully about which units that leaves you with.
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="entry-card">
          <div className="eyebrow">Step 2 — the spring constant</div>
          <div className="entry-grid">
            <div className="field">
              <label className="field-label" htmlFor="k-value">
                Spring constant, k
              </label>
              <input
                id="k-value"
                className="input input-numeric"
                inputMode="decimal"
                placeholder="0.0"
                value={state.answers.springConstant}
                onChange={(e) => set('springConstant')(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="k-unit">
                Unit
              </label>
              <select
                id="k-unit"
                className="select"
                value={state.answers.springConstantUnit}
                onChange={(e) => set('springConstantUnit')(e.target.value)}
              >
                <option value="">Choose…</option>
                {K_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {unitLabel(u)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-hint">
            A spring constant is quoted in newtons per metre. Your extension
            axis is in centimetres — that conversion is yours to make.
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="entry-card">
          <div className="eyebrow">Step 3 — your conclusion</div>
          <div className="field">
            <label className="field-label" htmlFor="conclusion">
              What does your graph show about force and extension?
            </label>
            <textarea
              id="conclusion"
              className="textarea"
              placeholder="Describe the shape of your graph, what it tells you about the relationship between force and extension, and the value of k you found."
              value={state.answers.conclusion}
              onChange={(e) => set('conclusion')(e.target.value)}
            />
            <div className="field-hint">
              A strong conclusion names the relationship, quotes the evidence
              from your graph, and gives your result with its unit.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
