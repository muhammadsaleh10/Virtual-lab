import { useState } from 'react'
import type { Action } from '../lib/store'
import type { ExperimentState } from '../lib/types'
import { totalMassG } from '../lib/types'
import { RULER_MAX_CM, RULER_MIN_CM } from '../lib/physics'
import { Callout, Checklist } from '../components/ui'

interface Props {
  state: ExperimentState
  dispatch: React.Dispatch<Action>
}

export default function SetupStep({ state, dispatch }: Props) {
  const loaded = totalMassG(state) > 0
  const [draft, setDraft] = useState(
    state.zeroReadingCm === null ? '' : String(state.zeroReadingCm),
  )
  const [error, setError] = useState<string | null>(null)

  const record = () => {
    const value = Number(draft.trim())
    if (draft.trim() === '' || !Number.isFinite(value)) {
      setError('Enter the reading you can see on the ruler, in centimetres.')
      return
    }
    if (value < RULER_MIN_CM || value > RULER_MAX_CM) {
      setError(`The ruler only runs from ${RULER_MIN_CM} to ${RULER_MAX_CM} cm.`)
      return
    }
    setError(null)
    dispatch({ type: 'setZeroReading', value })
  }

  return (
    <div>
      <h2 className="panel-title">Set up the apparatus</h2>
      <p className="panel-intro">
        A spring hangs from a clamp stand beside a vertical millimetre ruler. A
        pointer is fixed to the bottom of the spring; its position against the
        ruler is the only length you can measure.
      </p>

      <div className="panel-section">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Before you load the spring
        </div>
        <Checklist
          items={[
            {
              label: (
                <>
                  Make sure <strong>nothing</strong> is hanging from the spring.
                </>
              ),
              done: !loaded,
            },
            {
              label: (
                <>
                  Read the pointer against the ruler and record the unloaded
                  position <span className="mono">l₀</span>.
                </>
              ),
              done: state.zeroReadingCm !== null,
            },
          ]}
        />
      </div>

      {loaded && (
        <div className="panel-section">
          <Callout tone="warn">
            There are masses on the spring. Remove them with the controls under
            the bench before you measure the unloaded position.
          </Callout>
        </div>
      )}

      <div className="panel-section">
        <div className="entry-card">
          <div className="field">
            <label className="field-label" htmlFor="zero-reading">
              Unloaded pointer position, l₀ / cm
            </label>
            <input
              id="zero-reading"
              className={`input input-numeric ${error ? 'input-error' : ''}`}
              inputMode="decimal"
              placeholder="e.g. 12.4"
              value={draft}
              disabled={loaded}
              onChange={(e) => {
                setDraft(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && record()}
            />
            {error ? (
              <div className="field-error">{error}</div>
            ) : (
              <div className="field-hint">
                Read to the nearest millimetre — that is one decimal place in
                centimetres. Use the magnifier if the pointer falls between two
                marks.
              </div>
            )}
          </div>
          <button
            className="btn btn-secondary"
            onClick={record}
            disabled={loaded}
          >
            {state.zeroReadingCm === null ? 'Record l₀' : 'Update l₀'}
          </button>
        </div>
      </div>

      {state.zeroReadingCm !== null && !loaded && (
        <div className="panel-section">
          <Callout tone="good">
            Recorded <strong>l₀ = {state.zeroReadingCm.toFixed(1)} cm</strong>.
            Every extension you calculate will be measured from here, so it is
            worth being certain about it.
          </Callout>
        </div>
      )}

      <div className="panel-section">
        <Callout tone="info">
          <strong>Your aim:</strong> find the spring constant <em>k</em> of this
          spring by investigating how the force applied to it affects its
          extension.
        </Callout>
      </div>
    </div>
  )
}
