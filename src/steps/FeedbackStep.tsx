import { useMemo } from 'react'
import { assess, type FeedbackItem, type Verdict } from '../lib/feedback'
import { unitLabel, type ExperimentState } from '../lib/types'
import { IconCheck, IconCross, IconWarning } from '../components/Icons'
import {
  NATURAL_LENGTH_CM,
  SPRING_ANCHOR_CM,
  extensionCm,
  round,
} from '../lib/physics'
import GraphPlot, { type Point } from '../components/GraphPlot'
import WorkedSolution from '../components/WorkedSolution'

interface Props {
  state: ExperimentState
}

/** Fixed, examiner-style order — matches how a real mark scheme is read. */
const CATEGORY_ORDER = [
  'Measurement technique',
  'Range & quality of data',
  'Data processing',
  'Graph work',
  'Analysis & units',
  'Conclusion',
]

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
        .filter((r) => Number.isFinite(r.extensionCm))
        .map((r) => {
          const trueReading =
            SPRING_ANCHOR_CM + NATURAL_LENGTH_CM + extensionCm(state.spring, r.massG)
          return {
            x: r.extensionCm,
            y: r.forceN,
            label: `${r.massG} g`,
            flagged: Math.abs(r.lengthCm - trueReading) > 0.25,
          }
        }),
    [state],
  )
  const flaggedCount = points.filter((p) => p.flagged).length

  const order: Record<Verdict, number> = { poor: 0, warn: 1, good: 2 }

  const goodItems = report.items.filter((i) => i.verdict === 'good')
  const categorised = useMemo(() => {
    const groups: { category: string; items: FeedbackItem[] }[] = []
    for (const category of CATEGORY_ORDER) {
      const items = report.items
        .filter((i) => i.skill === category && i.verdict !== 'good')
        .sort((a, b) => order[a.verdict] - order[b.verdict])
      if (items.length > 0) groups.push({ category, items })
    }
    return groups
  }, [report.items])

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
          {report.kPercentDiff !== null && Number.isFinite(report.kPercentDiff) && (
            <div className="reveal-row">
              <span>Percentage difference</span>
              <span>{round(report.kPercentDiff, 1).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {points.length >= 2 && (
        <div className="panel-section">
          <div className="graph-card">
            <div className="graph-title">Your graph, as you submitted it</div>
            <GraphPlot points={points} bestFit={state.bestFit} height={300} />
          </div>
          <div className="table-caption">
            {flaggedCount > 0
              ? `${flaggedCount} point${flaggedCount === 1 ? ' is' : 's are'} ringed in red: the ruler reading recorded there was more than 2.5 mm from the true value.`
              : 'Every point sits where the apparatus really was — no misread values.'}
          </div>
        </div>
      )}

      {goodItems.length > 0 && (
        <div className="panel-section">
          <div className="eyebrow">What you did well</div>
          <ul className="did-well-list">
            {goodItems.map((item) => (
              <li key={item.id}>
                <VerdictDot verdict="good" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categorised.length > 0 && (
        <div className="panel-section">
          <div className="eyebrow">What cost you marks</div>
          <div className="category-groups">
            {categorised.map(({ category, items }) => (
              <div className="category-group" key={category}>
                <div className="category-group-title">{category}</div>
                <div className="feedback-list">
                  {items.map((item) => (
                    <div className="feedback-item" key={item.id}>
                      <VerdictDot verdict={item.verdict} />
                      <div>
                        <div className="feedback-title">{item.title}</div>
                        <div className="feedback-detail">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel-section">
        <div className="eyebrow">Worked solution</div>
        <p className="panel-intro" style={{ marginTop: 6 }}>
          The correct method, walked through using your own data where
          possible.
        </p>
        <WorkedSolution state={state} report={report} />
      </div>
    </div>
  )
}
