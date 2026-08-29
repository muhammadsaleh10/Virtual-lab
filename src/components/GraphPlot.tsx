import { useCallback, useMemo, useRef } from 'react'
import type { BestFit } from '../lib/types'
import { clamp, round } from '../lib/physics'

export interface Point {
  x: number
  y: number
  label?: string
  flagged?: boolean
}

interface Props {
  points: Point[]
  bestFit: BestFit | null
  onBestFitChange?: (fit: BestFit) => void
  /** Draws the gradient triangle and handle coordinates. */
  showConstruction?: boolean
  height?: number
}

const W = 440
const M = { top: 16, right: 18, bottom: 46, left: 56 }

/** Picks a readable axis step: 1, 2, 2.5 or 5 times a power of ten. */
function niceStep(range: number, targetTicks: number): number {
  if (range <= 0) return 1
  const raw = range / targetTicks
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / magnitude
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10
  return step * magnitude
}

function axisFor(maxValue: number, targetTicks: number) {
  const safeMax = maxValue > 0 ? maxValue : 1
  const step = niceStep(safeMax * 1.1, targetTicks)
  const max = Math.ceil((safeMax * 1.08) / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= max + step / 2; v += step) ticks.push(round(v, 6))
  return { max, ticks, step }
}

export default function GraphPlot({
  points,
  bestFit,
  onBestFitChange,
  showConstruction = false,
  height = 320,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<1 | 2 | null>(null)

  const H = height
  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom

  const xAxis = useMemo(
    () => axisFor(Math.max(0, ...points.map((p) => p.x)), 6),
    [points],
  )
  const yAxis = useMemo(
    () => axisFor(Math.max(0, ...points.map((p) => p.y)), 5),
    [points],
  )

  const toPx = useCallback(
    (x: number, y: number) => ({
      px: M.left + (x / xAxis.max) * plotW,
      py: M.top + plotH - (y / yAxis.max) * plotH,
    }),
    [xAxis.max, yAxis.max, plotW, plotH],
  )

  const toData = useCallback(
    (px: number, py: number) => ({
      x: clamp(((px - M.left) / plotW) * xAxis.max, 0, xAxis.max),
      y: clamp(((M.top + plotH - py) / plotH) * yAxis.max, 0, yAxis.max),
    }),
    [xAxis.max, yAxis.max, plotW, plotH],
  )

  const handleMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging.current || !onBestFitChange || !bestFit) return
      const svg = svgRef.current
      if (!svg) return
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      const local = pt.matrixTransform(ctm.inverse())
      const { x, y } = toData(local.x, local.y)
      const next =
        dragging.current === 1
          ? { ...bestFit, x1: x, y1: y, touched: true }
          : { ...bestFit, x2: x, y2: y, touched: true }
      onBestFitChange(next)
    },
    [bestFit, onBestFitChange, toData],
  )

  const endDrag = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (dragging.current) {
      dragging.current = null
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        /* the pointer may already be gone */
      }
    }
  }, [])

  const startDrag = (handle: 1 | 2) => (event: React.PointerEvent) => {
    if (!onBestFitChange) return
    event.preventDefault()
    dragging.current = handle
    const svg = svgRef.current
    if (svg) {
      try {
        svg.setPointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }
  }

  const interactive = Boolean(onBestFitChange && bestFit)

  // Extend the student's line to the full width of the plot so its gradient
  // can be judged over the whole range, as it would be on graph paper.
  let lineEnds: { a: { px: number; py: number }; b: { px: number; py: number } } | null =
    null
  if (bestFit) {
    const dx = bestFit.x2 - bestFit.x1
    if (Math.abs(dx) > 1e-9) {
      const m = (bestFit.y2 - bestFit.y1) / dx
      const c = bestFit.y1 - m * bestFit.x1
      const yAt = (x: number) => m * x + c
      lineEnds = { a: toPx(0, yAt(0)), b: toPx(xAxis.max, yAt(xAxis.max)) }
    } else {
      lineEnds = { a: toPx(bestFit.x1, 0), b: toPx(bestFit.x1, yAxis.max) }
    }
  }

  const h1 = bestFit ? toPx(bestFit.x1, bestFit.y1) : null
  const h2 = bestFit ? toPx(bestFit.x2, bestFit.y2) : null

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      onPointerMove={handleMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="img"
      aria-label="Graph of force against extension"
      style={{ cursor: dragging.current ? 'grabbing' : 'default' }}
    >
      <clipPath id="plotClip">
        <rect x={M.left} y={M.top} width={plotW} height={plotH} />
      </clipPath>

      {/* grid */}
      {xAxis.ticks.map((t) => {
        const { px } = toPx(t, 0)
        return (
          <line
            key={`gx${t}`}
            x1={px}
            y1={M.top}
            x2={px}
            y2={M.top + plotH}
            stroke="#eeeeea"
            strokeWidth={1}
          />
        )
      })}
      {yAxis.ticks.map((t) => {
        const { py } = toPx(0, t)
        return (
          <line
            key={`gy${t}`}
            x1={M.left}
            y1={py}
            x2={M.left + plotW}
            y2={py}
            stroke="#eeeeea"
            strokeWidth={1}
          />
        )
      })}

      {/* axes */}
      <line
        x1={M.left}
        y1={M.top}
        x2={M.left}
        y2={M.top + plotH}
        stroke="#35383f"
        strokeWidth={1.2}
      />
      <line
        x1={M.left}
        y1={M.top + plotH}
        x2={M.left + plotW}
        y2={M.top + plotH}
        stroke="#35383f"
        strokeWidth={1.2}
      />

      {xAxis.ticks.map((t) => {
        const { px } = toPx(t, 0)
        return (
          <g key={`tx${t}`}>
            <line
              x1={px}
              y1={M.top + plotH}
              x2={px}
              y2={M.top + plotH + 5}
              stroke="#35383f"
              strokeWidth={1.1}
            />
            <text
              x={px}
              y={M.top + plotH + 18}
              fontSize={11}
              fill="#63666f"
              textAnchor="middle"
              fontFamily="Inter Variable, Inter, system-ui, sans-serif"
            >
              {round(t, 3)}
            </text>
          </g>
        )
      })}
      {yAxis.ticks.map((t) => {
        const { py } = toPx(0, t)
        return (
          <g key={`ty${t}`}>
            <line
              x1={M.left - 5}
              y1={py}
              x2={M.left}
              y2={py}
              stroke="#35383f"
              strokeWidth={1.1}
            />
            <text
              x={M.left - 9}
              y={py}
              fontSize={11}
              fill="#63666f"
              textAnchor="end"
              dominantBaseline="central"
              fontFamily="Inter Variable, Inter, system-ui, sans-serif"
            >
              {round(t, 3)}
            </text>
          </g>
        )
      })}

      {/* axis titles */}
      <text
        x={M.left + plotW / 2}
        y={H - 8}
        fontSize={12}
        fontWeight={500}
        fill="#35383f"
        textAnchor="middle"
        fontFamily="Inter Variable, Inter, system-ui, sans-serif"
      >
        Extension x / cm
      </text>
      <text
        x={14}
        y={M.top + plotH / 2}
        fontSize={12}
        fontWeight={500}
        fill="#35383f"
        textAnchor="middle"
        transform={`rotate(-90 14 ${M.top + plotH / 2})`}
        fontFamily="Inter Variable, Inter, system-ui, sans-serif"
      >
        Force F / N
      </text>

      <g clipPath="url(#plotClip)">
        {/* gradient construction triangle */}
        {showConstruction && h1 && h2 && bestFit?.touched && (
          <g>
            <path
              d={`M ${h1.px} ${h1.py} L ${h2.px} ${h1.py} L ${h2.px} ${h2.py}`}
              fill="none"
              stroke="#1b4dd6"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
            />
          </g>
        )}

        {/* the student's line */}
        {lineEnds && (
          <line
            x1={lineEnds.a.px}
            y1={lineEnds.a.py}
            x2={lineEnds.b.px}
            y2={lineEnds.b.py}
            stroke="#1b4dd6"
            strokeWidth={1.6}
            opacity={bestFit?.touched ? 1 : 0.45}
            strokeDasharray={bestFit?.touched ? undefined : '5 4'}
          />
        )}

        {/* the student's data points */}
        {points.map((p, i) => {
          const { px, py } = toPx(p.x, p.y)
          return (
            <g key={i}>
              {p.label && <title>{p.label}</title>}
              <circle
                cx={px}
                cy={py}
                r={4}
                fill="#ffffff"
                stroke={p.flagged ? '#b03030' : '#16181d'}
                strokeWidth={1.6}
              />
              {p.flagged && <circle cx={px} cy={py} r={1.4} fill="#b03030" />}
            </g>
          )
        })}
      </g>

      {/* draggable handles, drawn outside the clip so they stay grabbable */}
      {interactive && h1 && h2 && (
        <>
          {[
            { pos: h1, id: 1 as const },
            { pos: h2, id: 2 as const },
          ].map(({ pos, id }) => (
            <g
              key={id}
              onPointerDown={startDrag(id)}
              style={{ cursor: 'grab', touchAction: 'none' }}
            >
              <circle cx={pos.px} cy={pos.py} r={16} fill="transparent" />
              <circle
                cx={pos.px}
                cy={pos.py}
                r={6.5}
                fill="#ffffff"
                stroke="#1b4dd6"
                strokeWidth={2}
              />
              <circle cx={pos.px} cy={pos.py} r={2} fill="#1b4dd6" />
            </g>
          ))}
        </>
      )}
    </svg>
  )
}
