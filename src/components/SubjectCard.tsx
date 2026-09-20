import type { ReactNode } from 'react'
import { IconArrowRight } from './Icons'

interface Props {
  icon: ReactNode
  title: string
  description: string
  meta: string
  onClick: () => void
}

/** One of the two large subject tiles on the home page. */
export default function SubjectCard({ icon, title, description, meta, onClick }: Props) {
  return (
    <button className="subject-card" onClick={onClick}>
      <span className="subject-card-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="subject-card-body">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="subject-card-meta">
        <span>{meta}</span>
        <span className="subject-card-cta">
          Open
          <IconArrowRight size={14} />
        </span>
      </div>
    </button>
  )
}
