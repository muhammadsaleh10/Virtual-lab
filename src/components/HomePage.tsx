import SubjectCard from './SubjectCard'
import { IconFlask, IconSpring } from './Icons'

interface Props {
  onOpenPhysics: () => void
  onOpenChemistry: () => void
}

export default function HomePage({ onOpenPhysics, onOpenChemistry }: Props) {
  return (
    <div className="landing">
      <div className="landing-inner">
        <div className="landing-mark">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="var(--accent)" />
            <path
              d="M16 6v3m0 14v3M11 10l10 3-10 3 10 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          Virtual Lab
        </div>

        <h1>Practical science, trained properly.</h1>
        <p className="landing-tagline">
          Cambridge AS &amp; A Level practical training in your browser. Choose
          a subject, perform the experiment yourself, and get examiner-style
          feedback on your technique — not just the answer.
        </p>

        <div className="subject-grid">
          <SubjectCard
            icon={<IconSpring size={22} />}
            title="Physics"
            description="Hands-on mechanics and measurement practicals, starting with Hooke's law."
            meta="1 experiment available"
            onClick={onOpenPhysics}
          />
          <SubjectCard
            icon={<IconFlask size={22} />}
            title="Chemistry"
            description="Quantitative analysis practicals, starting with acid–base titration."
            meta="Coming soon"
            onClick={onOpenChemistry}
          />
        </div>
      </div>

      <div className="landing-foot">
        Built for students who do not have a fully equipped laboratory.
      </div>
    </div>
  )
}
