import { useEffect, useMemo } from 'react'
import type { Action } from '../lib/store'
import type { ExperimentState } from '../lib/types'
import GraphPlot, { type Point } from '../components/GraphPlot'
import { Callout } from '../components/ui'

interface Props {
  state: ExperimentState
  dispatch: React.Dispatch<Action>
}

/**
 * The points as the student themselves plotted them: x is their own
 * calculated extension, not a value recomputed on their behalf. If they got
 * x = l - l0 wrong, that mistake is visible here too — exactly as it would
 * be on graph paper.
 */
export function dataPointsFor(state: ExperimentState): Point[] {
  return state.readings
    .filter((r) => Number.isFinite(r.extensionCm))
    .map((r) => ({ x: r.extensionCm, y: r.forceN, label: `${r.massG} g` }))
}

export default function GraphStep({ state, dispatch }: Props) {
  const points = useMemo(() => dataPointsFor(state), [state])

  // Give the student a neutral starting line to reposition — deliberately not
  // a fitted one, because placing it is part of the skill being practised.
  useEffect(() => {
    if (state.bestFit || points.length < 2) return
    const maxX = Math.max(...points.map((p) => p.x))
    const maxY = Math.max(...points.map((p) => p.y))
    dispatch({
      type: 'setBestFit',
      bestFit: {
        x1: maxX * 0.15,
        y1: maxY * 0.55,
        x2: maxX * 0.85,
        y2: maxY * 0.55,
        touched: false,
      },
    })
  }, [state.bestFit, points, dispatch])

  if (points.length < 2) {
    return (
      <div>
        <h2 className="panel-title">Plot your graph</h2>
        <p className="panel-intro">
          There is not enough data to plot yet. Go back and record at least two
          readings.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="panel-title">Plot your graph</h2>
      <p className="panel-intro">
        These are your readings, plotted as force against extension. Now draw
        the line of best fit by dragging the two blue handles.
      </p>

      <div className="panel-section">
        <div className="graph-card">
          <div className="graph-title">
            Force against extension for the spring
          </div>
          <GraphPlot
            points={points}
            bestFit={state.bestFit}
            onBestFitChange={(bestFit) => dispatch({ type: 'setBestFit', bestFit })}
            height={440}
          />
        </div>
      </div>

      <div className="panel-section">
        <Callout tone={state.bestFit?.touched ? 'good' : 'info'}>
          {state.bestFit?.touched ? (
            <>
              <strong>Line drawn.</strong> Check it once more: there should be a
              similar number of points above and below it along its whole
              length, not just in the middle.
            </>
          ) : (
            <>
              <strong>Drag both handles</strong> until the dashed line runs
              through the middle of your points. A good line balances the
              scatter either side — it does not simply join the first and last
              point.
            </>
          )}
        </Callout>
      </div>

      <div className="panel-section">
        <Callout tone="neutral">
          Does your line pass through the origin? That is the evidence that
          force and extension are <em>proportional</em>, not merely related.
        </Callout>
      </div>
    </div>
  )
}
