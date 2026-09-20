import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Apparatus from './Apparatus'
import TutorialStep from '../steps/TutorialStep'
import SetupStep from '../steps/SetupStep'
import MeasureStep from '../steps/MeasureStep'
import GraphStep from '../steps/GraphStep'
import AnalysisStep from '../steps/AnalysisStep'
import FeedbackStep from '../steps/FeedbackStep'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCube,
  IconMagnifier,
  IconMinus,
  IconPlus,
  IconReset,
  IconWarning,
} from './Icons'
import type { Action } from '../lib/store'
import { STAGES, totalMassG, type ExperimentState, type Stage } from '../lib/types'
import { HANGER_MASS_G, MAX_TOTAL_MASS_G, SLOTTED_MASSES_G } from '../lib/physics'

// Three.js only loads when the 3D bench is actually shown, so the landing,
// physics and chemistry pages never pay for it.
const Apparatus3D = lazy(() => import('../three/Apparatus3D'))

interface Props {
  state: ExperimentState
  dispatch: React.Dispatch<Action>
  onReset: () => void
  onExit: () => void
}

/** Which stages the student has done enough to move past. */
function stageComplete(state: ExperimentState, stage: Stage): boolean {
  switch (stage) {
    case 'tutorial':
      return true
    case 'setup':
      return state.zeroReadingCm !== null
    case 'measure':
      return state.readings.length >= 2
    case 'graph':
      return state.bestFit !== null
    case 'analysis':
      return state.submitted
    case 'feedback':
      return state.submitted
  }
}

function canEnter(state: ExperimentState, stage: Stage): boolean {
  switch (stage) {
    case 'tutorial':
      return true
    case 'setup':
      return true
    case 'measure':
      return stageComplete(state, 'setup')
    case 'graph':
    case 'analysis':
      return stageComplete(state, 'setup') && stageComplete(state, 'measure')
    case 'feedback':
      return state.submitted
  }
}

export default function LabScreen({ state, dispatch, onReset, onExit }: Props) {
  const [showMagnifier, setShowMagnifier] = useState(true)
  const [confirmReset, setConfirmReset] = useState(false)
  // The 3D bench is the default experience; 2D stays available as an
  // instant fallback in case the new view needs to be turned off.
  const [view3D, setView3D] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const mass = totalMassG(state)
  const atMaxLoad = state.hangerAttached && mass >= MAX_TOTAL_MASS_G
  const isTutorial = state.stage === 'tutorial'
  const stageIndex = STAGES.findIndex((s) => s.id === state.stage)

  // The apparatus is the priority while setting up and measuring; the work
  // panel becomes the priority once there is data to process and write about.
  const focus =
    state.stage === 'graph' || state.stage === 'analysis' || state.stage === 'feedback'
      ? 'notebook'
      : 'bench'

  // Start each stage at the top of the notebook rather than mid-scroll.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.stage])

  const goTo = (stage: Stage) => dispatch({ type: 'goToStage', stage })

  const next = () => {
    if (state.stage === 'analysis') {
      dispatch({ type: 'submit' })
      return
    }
    const target = STAGES[stageIndex + 1]
    if (target) goTo(target.id)
  }

  const back = () => {
    const target = STAGES[stageIndex - 1]
    if (target) goTo(target.id)
  }

  const nextEnabled =
    state.stage === 'analysis'
      ? true
      : stageComplete(state, state.stage) &&
        canEnter(state, STAGES[stageIndex + 1]?.id ?? 'feedback')

  const nextLabel =
    state.stage === 'setup'
      ? 'Start measuring'
      : state.stage === 'measure'
        ? 'Plot my graph'
        : state.stage === 'graph'
          ? 'Analyse my results'
          : 'Submit experiment'

  const footHint = (() => {
    if (state.stage === 'setup' && state.zeroReadingCm === null)
      return 'Record the unloaded position to continue.'
    if (state.stage === 'measure' && state.readings.length < 2)
      return 'Record at least two readings to continue.'
    if (state.stage === 'graph' && state.bestFit === null)
      return 'You need at least two readings before you can plot a graph.'
    return null
  })()

  return (
    <div className="lab">
      <header className="topbar">
        <div className="topbar-left">
          <button className="btn btn-ghost" onClick={onExit} aria-label="Back to Physics practicals">
            <IconArrowLeft />
          </button>
          <span className="topbar-title">Hooke&rsquo;s Law</span>
          <span className="topbar-divider" aria-hidden="true" />
          <span className="topbar-sub">Determining the spring constant</span>
        </div>
        <div className="topbar-right">
          <button className="btn btn-secondary" onClick={() => setConfirmReset(true)}>
            <IconReset />
            Reset experiment
          </button>
        </div>
      </header>

      <div className="lab-body" data-focus={focus}>
        {/* ---------------------------------------------------------- bench */}
        <section className="bench" aria-label="Laboratory bench">
          <div className="bench-badge">
            <div className="bench-badge-item">
              <div className="eyebrow">Load on spring</div>
              <div className="bench-badge-value">
                {mass}
                <small>g</small>
              </div>
            </div>
            <div className="bench-badge-item">
              <div className="eyebrow">Readings taken</div>
              <div className="bench-badge-value">{state.readings.length}</div>
            </div>
          </div>

          {atMaxLoad && (
            <div className="bench-warning" role="status">
              <IconWarning size={14} />
              <span>
                Maximum load reached. The hanger will not take any more masses.
              </span>
            </div>
          )}

          <div className="bench-stage">
            {view3D ? (
              <Suspense fallback={<div className="bench-3d-loading">Loading 3D bench…</div>}>
                <Apparatus3D
                  spring={state.spring}
                  hangerAttached={state.hangerAttached}
                  slotted={state.slotted}
                  onToggleHanger={() =>
                    dispatch({ type: state.hangerAttached ? 'removeHanger' : 'attachHanger' })
                  }
                  onAddMass={(grams) => dispatch({ type: 'addMass', grams })}
                />
              </Suspense>
            ) : (
              <Apparatus
                spring={state.spring}
                hangerAttached={state.hangerAttached}
                slotted={state.slotted}
                showMagnifier={showMagnifier}
              />
            )}
          </div>

          <div className="bench-controls">
            <div className="control-group">
              <span className="control-group-label">Hanger</span>
              <button
                className="mass-btn"
                onClick={() =>
                  dispatch({
                    type: state.hangerAttached ? 'removeHanger' : 'attachHanger',
                  })
                }
              >
                {state.hangerAttached ? <IconMinus /> : <IconPlus />}
                {state.hangerAttached ? 'Remove hanger' : `Attach hanger (${HANGER_MASS_G} g)`}
              </button>
            </div>

            <div className="control-group">
              <span className="control-group-label">Slotted masses</span>
              {SLOTTED_MASSES_G.map((grams) => (
                <button
                  key={grams}
                  className="mass-btn"
                  onClick={() => dispatch({ type: 'addMass', grams })}
                  disabled={!state.hangerAttached || mass + grams > MAX_TOTAL_MASS_G}
                >
                  <span
                    className={`mass-chip ${grams >= 100 ? 'mass-chip-lg' : ''}`}
                    aria-hidden="true"
                  />
                  {grams} g
                </button>
              ))}
              <button
                className="btn btn-ghost"
                onClick={() => dispatch({ type: 'removeLastMass' })}
                disabled={state.slotted.length === 0}
              >
                Remove last
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => dispatch({ type: 'clearMasses' })}
                disabled={state.slotted.length === 0}
              >
                Clear
              </button>
            </div>

            <div className="bench-controls-spacer" />

            {!view3D && (
              <button
                className="btn btn-ghost"
                onClick={() => setShowMagnifier((v) => !v)}
                aria-pressed={showMagnifier}
              >
                <IconMagnifier />
                {showMagnifier ? 'Hide magnifier' : 'Show magnifier'}
              </button>
            )}

            <button
              className="btn btn-ghost"
              onClick={() => setView3D((v) => !v)}
              aria-pressed={view3D}
            >
              <IconCube />
              {view3D ? 'Switch to 2D view' : 'Switch to 3D view'}
            </button>
          </div>
        </section>

        {/* ------------------------------------------------------- notebook */}
        <aside className="notebook" aria-label="Laboratory notebook">
          <div className="notebook-head">
            {isTutorial ? (
              <div className="eyebrow">Before you begin</div>
            ) : (
              <nav className="stepper" aria-label="Experiment stages">
                {STAGES.map((s, i) => {
                  const enabled = canEnter(state, s.id)
                  const done = i < stageIndex && stageComplete(state, s.id)
                  return (
                    <button
                      key={s.id}
                      className={`step ${s.id === state.stage ? 'is-active' : ''} ${
                        done ? 'is-done' : ''
                      }`}
                      disabled={!enabled}
                      onClick={() => enabled && goTo(s.id)}
                      aria-current={s.id === state.stage ? 'step' : undefined}
                    >
                      <span className="step-bar" />
                      <span className="step-label">{s.label}</span>
                    </button>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="notebook-scroll" ref={scrollRef}>
            {isTutorial && <TutorialStep onFinish={() => goTo('setup')} />}
            {state.stage === 'setup' && <SetupStep state={state} dispatch={dispatch} />}
            {state.stage === 'measure' && <MeasureStep state={state} dispatch={dispatch} />}
            {state.stage === 'graph' && <GraphStep state={state} dispatch={dispatch} />}
            {state.stage === 'analysis' && <AnalysisStep state={state} dispatch={dispatch} />}
            {state.stage === 'feedback' && <FeedbackStep state={state} />}
          </div>

          <div className="notebook-foot">
            {isTutorial ? null : state.stage === 'feedback' ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    dispatch({ type: 'unsubmit' })
                    goTo('analysis')
                  }}
                >
                  <IconArrowLeft />
                  Revise my answers
                </button>
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => setConfirmReset(true)}
                >
                  <IconReset />
                  Try again
                </button>
              </>
            ) : (
              <>
                {stageIndex > 0 && (
                  <button className="btn btn-secondary" onClick={back}>
                    <IconArrowLeft />
                    Back
                  </button>
                )}
                {footHint && <span className="foot-hint">{footHint}</span>}
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                  onClick={next}
                  disabled={!nextEnabled}
                >
                  {state.stage === 'analysis' ? <IconCheck size={15} /> : null}
                  {nextLabel}
                  {state.stage === 'analysis' ? null : <IconArrowRight />}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      {confirmReset && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
          onClick={() => setConfirmReset(false)}
        >
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 id="reset-title">Reset the experiment?</h3>
            <p>
              Your readings, graph and answers will be cleared, and you will be
              given a different spring to investigate. This cannot be undone.
            </p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setConfirmReset(false)
                  onReset()
                }}
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
