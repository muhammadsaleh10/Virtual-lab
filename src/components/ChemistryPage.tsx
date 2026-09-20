import ExperimentCard from './ExperimentCard'
import { IconArrowLeft } from './Icons'

interface Props {
  onBack: () => void
}

const titrationIllustration = (
  <svg width="34" height="64" viewBox="0 0 34 64">
    {/* burette clamp */}
    <rect x="4" y="2" width="10" height="4" rx="1" fill="var(--steel)" />
    <rect x="13" y="0" width="4" height="30" rx="1.5" fill="var(--steel-light)" />
    {/* burette body with graduation marks */}
    <rect x="14" y="4" width="6" height="26" rx="1" fill="none" stroke="var(--steel-dark)" strokeWidth="1.2" />
    <path
      d="M14 9h2M14 13h2M14 17h2M14 21h2M14 25h2"
      stroke="var(--steel-dark)"
      strokeWidth="0.9"
    />
    <path d="M15.5 30 17 34 18.5 30Z" fill="var(--steel-dark)" />
    {/* droplet */}
    <path d="M17 36c1.6 2 1.6 3.6 0 4.6-1.6-1-1.6-2.6 0-4.6Z" fill="var(--accent)" opacity="0.6" />
    {/* conical flask */}
    <path
      d="M13 42h8v6l6.5 12.4A2 2 0 0 1 25.7 64H8.3a2 2 0 0 1-1.8-2.9L13 48v-6Z"
      fill="none"
      stroke="var(--steel-dark)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M8.8 55h16.4" stroke="var(--steel-dark)" strokeWidth="1.2" />
    <path
      d="M9.6 56.5h14.8l1.4 2.7a1 1 0 0 1-.9 1.5H9.1a1 1 0 0 1-.9-1.5Z"
      fill="var(--accent)"
      opacity="0.35"
    />
  </svg>
)

export default function ChemistryPage({ onBack }: Props) {
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
        <h1 className="page-title">Chemistry Practicals</h1>
        <p className="page-subtitle">
          Quantitative analysis at the bench — starting with titration.
        </p>

        <div className="page-section">
          <ExperimentCard
            eyebrow="Experiment 01 · Cambridge AS Chemistry"
            title="Acid–Base Titration"
            description="Add a base from a burette to a measured volume of acid, judge the end point from the indicator colour change, and calculate the unknown concentration."
            tags={['Volumetric technique', 'Indicators & end points', 'Concentration calculations']}
            illustration={titrationIllustration}
            comingSoon
            note="This practical is being built next — it is not open yet."
          />
        </div>
      </div>
    </div>
  )
}
