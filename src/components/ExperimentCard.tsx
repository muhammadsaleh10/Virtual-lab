import type { ReactNode } from 'react'
import { IconArrowRight } from './Icons'

interface Props {
  eyebrow: string
  title: string
  description: string
  tags: string[]
  illustration: ReactNode
  note: string
  /** When set, the card shows a "coming next" badge instead of a CTA and cannot be opened. */
  comingSoon?: boolean
  ctaLabel?: string
  onOpen?: () => void
}

/** An experiment tile on a subject page — either openable, or marked coming soon. */
export default function ExperimentCard({
  eyebrow,
  title,
  description,
  tags,
  illustration,
  note,
  comingSoon = false,
  ctaLabel,
  onOpen,
}: Props) {
  return (
    <div className={`experiment-card ${comingSoon ? 'experiment-card-soon' : ''}`}>
      <div className="experiment-card-head">
        <div className="experiment-card-illus" aria-hidden="true">
          {illustration}
        </div>
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 style={{ marginTop: 6 }}>{title}</h2>
          <p>{description}</p>
          <div className="tag-row">
            {tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="experiment-card-foot">
        <span className="landing-note">{note}</span>
        {comingSoon ? (
          <span className="badge badge-soon">Coming next</span>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={onOpen}>
            {ctaLabel}
            <IconArrowRight />
          </button>
        )}
      </div>
    </div>
  )
}
