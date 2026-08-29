import type { ReactNode } from 'react'
import { IconCheck, IconInfo, IconWarning } from './Icons'

export function Callout({
  tone = 'neutral',
  children,
}: {
  tone?: 'info' | 'neutral' | 'warn' | 'good'
  children: ReactNode
}) {
  const icon =
    tone === 'warn' ? (
      <IconWarning size={14} />
    ) : tone === 'good' ? (
      <IconCheck size={14} />
    ) : (
      <IconInfo size={14} />
    )
  return (
    <div className={`callout callout-${tone}`}>
      {icon}
      <div>{children}</div>
    </div>
  )
}

export function Checklist({
  items,
}: {
  items: { label: ReactNode; done: boolean }[]
}) {
  return (
    <ul className="checklist">
      {items.map((item, i) => (
        <li key={i} className={item.done ? 'is-done' : ''}>
          <span className="checklist-num" aria-hidden="true">
            {item.done ? <IconCheck size={11} /> : i + 1}
          </span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}

export function Readout({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="readout">
      <div className="eyebrow" style={{ fontSize: 10 }}>
        {label}
      </div>
      <div className="readout-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
    </div>
  )
}
