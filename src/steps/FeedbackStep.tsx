import { useMemo } from 'react'
import { assess, type Verdict } from '../lib/feedback'
import { unitLabel, type ExperimentState } from '../lib/types'
import { IconCheck, IconCross, IconWarning } from '../components/Icons'
import {
  NATURAL_LENGTH_CM,
  SPRING_ANCHOR_CM,
  extensionCm,
  round,
} from '../lib/physics'
import GraphPlot, { type Point } from '../components/GraphPlot'
import { studentExtensionCm } from '../lib/store'

interface Props {
  state: ExperimentState
}

function VerdictDot({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`feedback-dot ${verdict}`} aria-hidden="true">
      {verdict === 'good' ? (
        <IconCheck size={12} />
      ) : verdict === 'warn' ? (
        <IconWarning size={12} />
      ) : (
        <IconCross size={11} />
      )}
    </span>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 31
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference
  const colour =
    score >= 70 ? 'var(--good)' : score >= 50 ? 'var(--warn)' : 'var(--poor)'
  return (
    <div className="score-ring">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--line)" strokeWidth="5" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.22,0.61,0.36,1)' }}
        />
      </svg>
      <div className="score-ring-value">{score}</div>
    </div>
  )
}

export default function FeedbackStep({ state }: Props) {
  const report = useMemo(() => assess(state), [state])

  // Replaying the graph with the mis-read points marked is far more useful
  // than telling the student their readings were "a bit off".
  const points = useMemo<Point[]>(
    () =>
      state.readings
        .map<Point | null>((r) => {
          const x = studentExtensionCm(r, state.zeroReadingCm)
          if (x === null) return null
          const trueReading =
            SPRING_ANCHOR_CM + NATURAL_LENGTH_CM + extensionCm(state.spring, r.massG)
          return {
            x,
            y: r.forceN,
            label: `${r.massG} g`,
            flagged: Math.abs(r.lengthCm - trueReading) > 0.25,
          }
        })
        .filter((p): p is Point => p !== null),
    [state],
  )
  const flaggedCount = points.filter((p) => p.flagged).length

  const order: Record<Verdict, number> = { poor: 0, warn: 1, good: 2 }
  const items = [...report.items].sort(
    (a, b) => order[a.verdict] - order[b.verdict],
  )

  const errorPercent =
    report.studentK !== null && report.trueSpringConstant !== 0
      ? Math.abs(
          ((report.studentK - report.trueSpringConstant) /
            report.trueSpringConstant) *
            100,
        )
      : null

  return (
    <div>
      <h2 className="panel-title">Your practical report</h2>
      <p className="panel-intro">
        Marked against what an examiner looks for in an AS &amp; A Level
        practical: how you measured, how you processed your data, and how you
        justified your conclusion.
      </p>

      <div className="panel-section">
        <div className="score-card">
          <ScoreRing score={report.score} />
          <div>
            <div className="score-band">{report.band}</div>
            <div className="score-detail">{report.bandDetail}</div>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="reveal-card">
          <div className="eyebrow" style={{ marginBottom: 8, color: '#5c78b4' }}>
            The answer
          </div>
          <div className="reveal-row">
            <span>True spring constant</span>
            <span>{report.trueSpringConstant.toFixed(2)} N m⁻¹</span>
          </div>
          <div className="reveal-row">
            <span>Your value</span>
            <span>
              {report.studentK === null
                ? 'not given'
                : `${state.answers.springConstant.trim()} ${unitLabel(state.answers.springConstantUnit)}`.trim()}
            </span>
          </div>
          {report.bestFitGradient !== null && (
            <div className="reveal-row">
              <span>Gradient of your line</span>
              <span>{round(report.bestFitGradient, 4)} N cm⁻¹</span>
            </div>
          )}
          {errorPercent !== null && (
            <div className="reveal-row">
              <span>Percentage difference</span>
              <span>{round(errorPercent, 1).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {points.length >= 2 && (
        <div className="panel-section">
          <div className="graph-card">
            <div className="graph-title">Your graph, as you submitted it</div>
            <GraphPlot points={points} bestFit={state.bestFit} height={260} />
          </div>
          <div className="table-caption">
            {flaggedCount > 0
              ? `${flaggedCount} point${flaggedCount === 1 ? ' is' : 's are'} ringed in red: the ruler reading recorded there was more than 2.5 mm from the true value.`
              : 'Every point sits where the apparatus really was — no misread values.'}
          </div>
        </div>
      )}

      <div className="panel-section">
        <div className="eyebrow">Examiner&rsquo;s comments</div>
        <div className="feedback-list">
          {items.map((item, i) => (
            <div
              className="feedback-item"
              key={item.id}
              style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
            >
              <VerdictDot verdict={item.verdict} />
              <div>
                <div className="feedback-skill">{item.skill}</div>
                <div className="feedback-title">{item.title}</div>
                <div className="feedback-detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
