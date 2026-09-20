import ExperimentCard from './ExperimentCard'
import { IconArrowLeft } from './Icons'

interface Props {
  hasSavedProgress: boolean
  onOpenHookesLaw: () => void
  onBack: () => void
}

const springIllustration = (
  <svg width="40" height="64" viewBox="0 0 40 64">
    <path d="M8 4h24" stroke="var(--steel)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 4v6" stroke="var(--steel)" strokeWidth="1.6" />
    <path
      d="M20 10c-6 1.5 6 4 0 5.5s6 4 0 5.5 6 4 0 5.5 6 4 0 5.5 6 4 0 5.5"
      stroke="var(--steel-dark)"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M20 37v5" stroke="var(--steel)" strokeWidth="1.6" />
    <rect x="10" y="42" width="20" height="4" rx="1" fill="var(--steel)" />
    <rect x="12" y="46" width="16" height="5" rx="1" fill="var(--steel-dark)" />
    <path
      d="M36 6v52"
      stroke="var(--accent)"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.35"
    />
  </svg>
)

export default function PhysicsPage({ hasSavedProgress, onOpenHookesLaw, onBack }: Props) {
  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="btn btn-ghost" onClick={onBack}>
            <IconArrowLeft />
            Home
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="eyebrow">Cambridge AS &amp; A Level</div>
        <h1 className="page-title">Physics Practicals</h1>
        <p className="page-subtitle">
          Real apparatus, read with your own eyes. One experiment at a time,
          done properly.
        </p>

        <div className="page-section">
          <ExperimentCard
            eyebrow="Experiment 01 · Cambridge AS Physics"
            title="Hooke’s Law"
            description="Hang known masses from a spring, measure the extension with a millimetre ruler, plot force against extension and determine the spring constant from the gradient of your graph."
            tags={['Measurement & uncertainty', 'Graph work', 'Analysis & conclusion', '≈ 15 min']}
            illustration={springIllustration}
            ctaLabel={hasSavedProgress ? 'Resume experiment' : 'Start experiment'}
            onOpen={onOpenHookesLaw}
            note={
              hasSavedProgress
                ? 'You have an experiment in progress — it will be restored.'
                : 'No account needed. Your work stays in this browser.'
            }
          />
        </div>
      </div>
    </div>
  )
}
