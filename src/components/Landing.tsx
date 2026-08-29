import { IconArrowRight, IconSpring } from './Icons'

interface Props {
  onStart: () => void
  hasSavedProgress: boolean
}

export default function Landing({ onStart, hasSavedProgress }: Props) {
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
          Virtual Science Lab
        </div>

        <h1>Learn practical science by actually doing it.</h1>
        <p className="landing-tagline">
          A physics laboratory in your browser. You set up the apparatus, take
          your own readings, plot your own graph and defend your own conclusion
          — exactly as you would at the bench.
        </p>

        <div className="experiment-card">
          <div className="experiment-card-head">
            <div className="experiment-card-illus" aria-hidden="true">
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
            </div>
            <div>
              <div className="eyebrow">Experiment 01 · AS &amp; A Level Physics</div>
              <h2 style={{ marginTop: 6 }}>Hooke&rsquo;s Law</h2>
              <p>
                Hang known masses from a spring, measure the extension with a
                millimetre ruler, plot force against extension and determine the
                spring constant from the gradient of your graph.
              </p>
              <div className="tag-row">
                <span className="tag">Measurement &amp; uncertainty</span>
                <span className="tag">Graph work</span>
                <span className="tag">Analysis &amp; conclusion</span>
                <span className="tag">≈ 15 min</span>
              </div>
            </div>
          </div>

          <div className="experiment-card-foot">
            <span className="landing-note">
              {hasSavedProgress
                ? 'You have an experiment in progress — it will be restored.'
                : 'No account needed. Your work stays in this browser.'}
            </span>
            <button className="btn btn-primary btn-lg" onClick={onStart}>
              <IconSpring size={17} />
              {hasSavedProgress ? 'Resume experiment' : 'Start experiment'}
              <IconArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="landing-foot">
        Built for students who do not have a fully equipped laboratory.
      </div>
    </div>
  )
}
