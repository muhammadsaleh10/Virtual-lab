import { useEffect, useState } from 'react'
import type { Action } from '../lib/store'
import type { ExperimentState } from '../lib/types'
import { totalMassG } from '../lib/types'
import { RULER_MAX_CM, RULER_MIN_CM } from '../lib/physics'
import { Callout } from '../components/ui'
import { IconTable, IconTrash } from '../components/Icons'

interface Props {
  state: ExperimentState
  dispatch: React.Dispatch<Action>
}

export default function MeasureStep({ state, dispatch }: Props) {
  const mass = totalMassG(state)
  const [length, setLength] = useState('')
  const [extension, setExtension] = useState('')
  const [force, setForce] = useState('')
  const [error, setError] = useState<string | null>(null)

  const alreadyRecorded = state.readings.some((r) => r.massG === mass)

  // Changing the load invalidates whatever was half-typed for the old one.
  useEffect(() => {
    setLength('')
    setExtension('')
    setForce('')
    setError(null)
  }, [mass])

  const add = () => {
    if (mass === 0) {
      setError('Hang the mass hanger on the spring first.')
      return
    }
    if (alreadyRecorded) {
      setError(`You have already recorded a reading for ${mass} g.`)
      return
    }
    const l = Number(length.trim())
    const x = Number(extension.trim())
    const f = Number(force.trim())
    if (length.trim() === '' || !Number.isFinite(l)) {
      setError('Enter the pointer position you read on the ruler.')
      return
    }
    if (l < RULER_MIN_CM || l > RULER_MAX_CM) {
      setError(`The ruler only runs from ${RULER_MIN_CM} to ${RULER_MAX_CM} cm.`)
      return
    }
    if (extension.trim() === '' || !Number.isFinite(x)) {
      setError('Calculate the extension yourself as x = l − l₀.')
      return
    }
    if (force.trim() === '' || !Number.isFinite(f)) {
      setError('Enter the force this mass applies, in newtons.')
      return
    }
    setError(null)
    dispatch({
      type: 'addReading',
      reading: {
        id: `${mass}-${Date.now()}`,
        massG: mass,
        lengthCm: l,
        extensionCm: x,
        forceN: f,
      },
    })
    setLength('')
    setExtension('')
    setForce('')
  }

  return (
    <div>
      <h2 className="panel-title">Take your measurements</h2>
      <p className="panel-intro">
        Load the spring, let it settle, read the pointer against the ruler,
        then work out the extension and the force yourself before writing the
        row into your table. Take at least six readings over as wide a range
        of masses as the spring will safely take.
      </p>

      <div className="panel-section">
        <div className="entry-card">
          <div className="entry-mass">
            <span className="field-label">Mass currently on the spring</span>
            <span className="entry-mass-value">
              {mass === 0 ? '—' : `${mass} g`}
            </span>
          </div>

          <div className="entry-grid entry-grid-3">
            <div className="field">
              <label className="field-label" htmlFor="reading-l">
                Pointer position l / cm
              </label>
              <input
                id="reading-l"
                className="input input-numeric"
                inputMode="decimal"
                placeholder="0.0"
                value={length}
                disabled={mass === 0}
                onChange={(e) => {
                  setLength(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="reading-x">
                Extension x = l − l₀ / cm
              </label>
              <input
                id="reading-x"
                className="input input-numeric"
                inputMode="decimal"
                placeholder="0.0"
                value={extension}
                disabled={mass === 0}
                onChange={(e) => {
                  setExtension(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="reading-f">
                Force F = mg / N
              </label>
              <input
                id="reading-f"
                className="input input-numeric"
                inputMode="decimal"
                placeholder="0.00"
                value={force}
                disabled={mass === 0}
                onChange={(e) => {
                  setForce(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
            </div>
          </div>

          {error ? (
            <div className="field-error">{error}</div>
          ) : (
            <div className="field-hint">
              Your recorded l₀ ={' '}
              {state.zeroReadingCm === null ? '—' : state.zeroReadingCm.toFixed(1)}{' '}
              cm. Nothing here is checked until you submit — work it out
              yourself.
            </div>
          )}

          <button
            className="btn btn-primary btn-block"
            onClick={add}
            disabled={mass === 0 || alreadyRecorded}
          >
            {alreadyRecorded
              ? `${mass} g already recorded`
              : 'Add to results table'}
          </button>
        </div>
      </div>

      <div className="panel-section">
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Results table
        </div>
        <div className="table-wrap">
          {state.readings.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon">
                <IconTable />
              </div>
              No readings yet.
              <br />
              Add masses to the hanger and record what you see.
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>m / g</th>
                    <th>F / N</th>
                    <th>l / cm</th>
                    <th>x / cm</th>
                    <th className="row-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {state.readings.map((r) => (
                    <tr key={r.id}>
                      <td>{r.massG}</td>
                      <td>{r.forceN}</td>
                      <td>{r.lengthCm.toFixed(1)}</td>
                      <td>{r.extensionCm.toFixed(1)}</td>
                      <td className="row-actions">
                        <button
                          className="icon-btn"
                          aria-label={`Delete the ${r.massG} g reading`}
                          onClick={() =>
                            dispatch({ type: 'deleteReading', id: r.id })
                          }
                        >
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {state.readings.length > 0 && (
          <div className="table-caption">
            F and x above are exactly what you entered for each row — nothing
            is recalculated for you.
          </div>
        )}
      </div>

      {state.readings.length > 0 && state.readings.length < 6 && (
        <div className="panel-section">
          <Callout tone="neutral">
            {state.readings.length} of 6 readings. An examiner expects at least
            six, spread over a wide range of masses.
          </Callout>
        </div>
      )}
    </div>
  )
}
