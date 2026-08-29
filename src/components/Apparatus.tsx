import { memo } from 'react'
import {
  HANGER_MASS_G,
  RULER_MAX_CM,
  RULER_MIN_CM,
  SPRING_ANCHOR_CM,
  pointerReadingCm,
  type Spring,
} from '../lib/physics'
import { useAnimatedValue, usePrefersReducedMotion } from '../hooks/useAnimatedValue'
import {
  LABEL_X,
  MAG,
  MAG_ANCHOR_X,
  MAG_ZOOM,
  ROD_W,
  ROD_X,
  RULER_W,
  RULER_X,
  SCALE,
  SPRING_RADIUS,
  SPRING_X,
  TICK_MAJOR,
  TICK_MID,
  TICK_MINOR,
  VB_H,
  VB_W,
  cmToY,
} from './geometry'

interface Props {
  spring: Spring
  hangerAttached: boolean
  slotted: number[]
  showMagnifier: boolean
}

/**
 * Builds the coil of the spring between two y positions as a smooth wave,
 * which is what a helix looks like seen from the side. The coils open out on
 * their own as the spring is stretched, because the same number of turns has
 * to fill a greater length.
 */
function coilPath(cx: number, topY: number, bottomY: number): string {
  const leadIn = 10
  const start = topY + leadIn
  const end = bottomY - leadIn
  const halfTurns = 12
  const step = (end - start) / halfTurns
  const r = SPRING_RADIUS

  let d = `M ${cx} ${topY} L ${cx} ${start}`
  for (let i = 0; i < halfTurns; i++) {
    // A quadratic control point twice the radius out puts the crest of the
    // curve exactly one radius from the axis.
    const controlX = i % 2 === 0 ? cx + r * 2 : cx - r * 2
    const y0 = start + step * i
    const y1 = start + step * (i + 1)
    d += ` Q ${controlX} ${(y0 + y1) / 2} ${cx} ${y1}`
  }
  d += ` L ${cx} ${bottomY}`
  return d
}

/** The centimetre / millimetre scale. Reused inside the magnifier. */
const RulerScale = memo(function RulerScale({ dense }: { dense: boolean }) {
  const ticks: React.ReactElement[] = []
  const stepsPerCm = 10
  const total = (RULER_MAX_CM - RULER_MIN_CM) * stepsPerCm

  for (let i = 0; i <= total; i++) {
    const cm = RULER_MIN_CM + i / stepsPerCm
    const y = cmToY(cm)
    const isMajor = i % 10 === 0
    const isMid = i % 5 === 0
    if (!isMid && !dense) continue
    const length = isMajor ? TICK_MAJOR : isMid ? TICK_MID : TICK_MINOR
    ticks.push(
      <line
        key={i}
        x1={RULER_X}
        y1={y}
        x2={RULER_X + length}
        y2={y}
        stroke={isMajor ? '#3b3f47' : isMid ? '#6b7079' : '#a4a9b1'}
        strokeWidth={isMajor ? 1.5 : isMid ? 1.1 : 0.7}
        strokeLinecap="butt"
      />,
    )
  }

  const labels: React.ReactElement[] = []
  for (let cm = RULER_MIN_CM; cm <= RULER_MAX_CM; cm += 1) {
    labels.push(
      <text
        key={cm}
        x={LABEL_X}
        y={cmToY(cm)}
        fontSize={9}
        fontWeight={500}
        fill="#3b3f47"
        dominantBaseline="central"
        fontFamily="Inter Variable, Inter, system-ui, sans-serif"
      >
        {cm}
      </text>,
    )
  }

  return (
    <g>
      <rect
        x={RULER_X}
        y={cmToY(RULER_MIN_CM) - 12}
        width={RULER_W}
        height={(RULER_MAX_CM - RULER_MIN_CM) * SCALE + 24}
        rx={2}
        fill="#fdfcf7"
        stroke="#d9d5c8"
        strokeWidth={1}
      />
      <rect
        x={RULER_X}
        y={cmToY(RULER_MIN_CM) - 12}
        width={2}
        height={(RULER_MAX_CM - RULER_MIN_CM) * SCALE + 24}
        fill="#eae6d9"
      />
      {ticks}
      {labels}
      <text
        x={RULER_X + RULER_W - 6}
        y={cmToY(RULER_MAX_CM) + 20}
        fontSize={8}
        fill="#9aa0a8"
        textAnchor="end"
        fontFamily="Inter Variable, Inter, system-ui, sans-serif"
      >
        cm
      </text>
    </g>
  )
})

/** The index mark fixed to the bottom of the spring — the thing being read. */
function Pointer({ y }: { y: number }) {
  return (
    <g>
      <line
        x1={SPRING_X}
        y1={y}
        x2={RULER_X - 1}
        y2={y}
        stroke="#1b4dd6"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d={`M ${RULER_X - 1} ${y} l -9 -4.4 l 0 8.8 Z`}
        fill="#1b4dd6"
      />
    </g>
  )
}

function MassStack({ topY, slotted }: { topY: number; slotted: number[] }) {
  const stemLength = 54
  const plateY = topY + stemLength
  const plateW = 58

  let stackY = plateY
  const discs = slotted.map((grams, index) => {
    const h = grams >= 100 ? 8 : 5
    const w = grams >= 100 ? 54 : 44
    stackY -= h + 1.2
    return (
      <g key={index}>
        <rect
          x={SPRING_X - w / 2}
          y={stackY}
          width={w}
          height={h}
          rx={1.5}
          fill="url(#massGrad)"
          stroke="#484d55"
          strokeWidth={0.7}
        />
        <line
          x1={SPRING_X - w / 2 + 2}
          y1={stackY + 1.4}
          x2={SPRING_X + w / 2 - 2}
          y2={stackY + 1.4}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={0.8}
        />
      </g>
    )
  })

  return (
    <g>
      {/* hook */}
      <path
        d={`M ${SPRING_X} ${topY} l 0 6 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0`}
        fill="none"
        stroke="#5b6068"
        strokeWidth={1.8}
      />
      {/* stem */}
      <rect
        x={SPRING_X - 2}
        y={topY + 10}
        width={4}
        height={stemLength - 10}
        rx={1}
        fill="#8a9099"
        stroke="#5b6068"
        strokeWidth={0.6}
      />
      {/* base plate */}
      <rect
        x={SPRING_X - plateW / 2}
        y={plateY}
        width={plateW}
        height={6}
        rx={1.5}
        fill="url(#massGrad)"
        stroke="#484d55"
        strokeWidth={0.8}
      />
      {discs}
    </g>
  )
}

function Apparatus({ spring, hangerAttached, slotted, showMagnifier }: Props) {
  const reduced = usePrefersReducedMotion()
  const totalMass = hangerAttached
    ? HANGER_MASS_G + slotted.reduce((s, m) => s + m, 0)
    : 0
  const target = pointerReadingCm(spring, totalMass)
  const reading = useAnimatedValue(target, {
    stiffness: 105,
    damping: 11,
    enabled: !reduced,
  })

  const anchorY = cmToY(SPRING_ANCHOR_CM)
  const pointerY = cmToY(reading)
  const magY = MAG.y + MAG.h / 2

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Clamp stand with a spring, a vertical millimetre ruler and ${
        hangerAttached ? `a mass hanger carrying ${totalMass} grams` : 'no masses attached'
      }.`}
    >
      <defs>
        <linearGradient id="rodGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9198a1" />
          <stop offset="35%" stopColor="#d6dae0" />
          <stop offset="60%" stopColor="#8f959e" />
          <stop offset="100%" stopColor="#5d636b" />
        </linearGradient>
        <linearGradient id="massGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c3c8cf" />
          <stop offset="45%" stopColor="#9aa0a9" />
          <stop offset="100%" stopColor="#6e747d" />
        </linearGradient>
        <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#585e66" />
          <stop offset="100%" stopColor="#3a3f46" />
        </linearGradient>
        <linearGradient id="springGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6e747d" />
          <stop offset="40%" stopColor="#aeb4bc" />
          <stop offset="100%" stopColor="#5b6068" />
        </linearGradient>
        <linearGradient id="magFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdfcf7" stopOpacity="1" />
          <stop offset="9%" stopColor="#fdfcf7" stopOpacity="0" />
          <stop offset="91%" stopColor="#fdfcf7" stopOpacity="0" />
          <stop offset="100%" stopColor="#fdfcf7" stopOpacity="1" />
        </linearGradient>
        <clipPath id="magClip">
          <rect x={MAG.x} y={MAG.y} width={MAG.w} height={MAG.h} rx={8} />
        </clipPath>
        <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#161a20"
            floodOpacity="0.16"
          />
        </filter>
      </defs>

      {/* ------------------------------------------------------ bench shadow */}
      <ellipse cx={ROD_X + 30} cy={672} rx={140} ry={7} fill="#161a20" opacity={0.07} />

      {/* --------------------------------------------------------- the stand */}
      <rect x={ROD_X - 110} y={646} width={250} height={20} rx={4} fill="url(#baseGrad)" />
      <rect x={ROD_X - 110} y={646} width={250} height={4} rx={2} fill="#6d737b" />
      <rect
        x={ROD_X - ROD_W / 2}
        y={34}
        width={ROD_W}
        height={618}
        fill="url(#rodGrad)"
      />
      <rect x={ROD_X - ROD_W / 2} y={30} width={ROD_W} height={6} rx={3} fill="#6d737b" />

      {/* clamp boss holding the top of the spring */}
      <g filter="url(#softShadow)">
        <rect
          x={ROD_X - 13}
          y={anchorY - 16}
          width={26}
          height={32}
          rx={4}
          fill="#5f656d"
        />
        <rect
          x={ROD_X + 6}
          y={anchorY - 5}
          width={SPRING_X - ROD_X - 6}
          height={10}
          rx={2}
          fill="url(#massGrad)"
        />
        <circle cx={ROD_X - 17} cy={anchorY} r={5.5} fill="#7d838b" />
        <circle cx={ROD_X - 17} cy={anchorY} r={2} fill="#4b5058" />
      </g>
      <circle cx={SPRING_X} cy={anchorY} r={3.2} fill="#4b5058" />

      {/* ------------------------------------------------------- the ruler */}
      <RulerScale dense />

      {/* -------------------------------------------------------- the spring */}
      <path
        d={coilPath(SPRING_X, anchorY, pointerY)}
        fill="none"
        stroke="url(#springGrad)"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {hangerAttached && <MassStack topY={pointerY} slotted={slotted} />}
      <Pointer y={pointerY} />

      {/* ----------------------------------------------------- the magnifier */}
      {showMagnifier && (
        <g>
          <rect
            x={MAG.x}
            y={MAG.y}
            width={MAG.w}
            height={MAG.h}
            rx={8}
            fill="#ffffff"
            stroke="#d5d5d0"
            strokeWidth={1}
            filter="url(#softShadow)"
          />
          <g clipPath="url(#magClip)">
            <rect
              x={MAG.x}
              y={MAG.y}
              width={MAG.w}
              height={MAG.h}
              fill="#fdfcf7"
            />
            <g
              transform={`translate(${MAG_ANCHOR_X} ${magY}) scale(${MAG_ZOOM}) translate(${-RULER_X} ${-pointerY})`}
            >
              <RulerScale dense />
              <Pointer y={pointerY} />
            </g>
            <rect
              x={MAG.x}
              y={MAG.y}
              width={MAG.w}
              height={MAG.h}
              fill="url(#magFade)"
            />
          </g>
          <rect
            x={MAG.x}
            y={MAG.y}
            width={MAG.w}
            height={MAG.h}
            rx={8}
            fill="none"
            stroke="#d5d5d0"
            strokeWidth={1}
          />
          <text
            x={MAG.x + 10}
            y={MAG.y - 9}
            fontSize={10}
            fontWeight={600}
            fill="#868a93"
            letterSpacing="0.06em"
            fontFamily="Inter Variable, Inter, system-ui, sans-serif"
          >
            MAGNIFIER ×{MAG_ZOOM}
          </text>
        </g>
      )}
    </svg>
  )
}

export default memo(Apparatus)
