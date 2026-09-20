interface IconProps {
  size?: number
  className?: string
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IconSpring = ({ size = 20 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M10 2.5v2M10 15.5v2M6 6l8 2-8 2 8 2" />
  </svg>
)

export const IconArrowRight = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M4 10h11M11 6l4 4-4 4" />
  </svg>
)

export const IconArrowLeft = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M16 10H5M9 6l-4 4 4 4" />
  </svg>
)

export const IconPlus = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M10 4.5v11M4.5 10h11" />
  </svg>
)

export const IconMinus = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M4.5 10h11" />
  </svg>
)

export const IconTrash = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M4 5.5h12M8 5.5V4h4v1.5M6 5.5l.7 9.5h6.6l.7-9.5" />
  </svg>
)

export const IconReset = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M15.5 8A6 6 0 1 0 16 11.5M15.5 3.5V8h-4.5" />
  </svg>
)

export const IconInfo = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <circle cx="10" cy="10" r="7.2" />
    <path d="M10 9.2v4M10 6.6h.01" />
  </svg>
)

export const IconWarning = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M10 3.4 2.9 16h14.2L10 3.4Z" />
    <path d="M10 8.2v3.4M10 13.9h.01" />
  </svg>
)

export const IconCheck = ({ size = 13 }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.2} aria-hidden="true">
    <path d="M4.5 10.4 8.2 14l7.3-8" />
  </svg>
)

export const IconCross = ({ size = 12 }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.2} aria-hidden="true">
    <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
  </svg>
)

export const IconTable = ({ size = 20 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="2.8" y="4" width="14.4" height="12" rx="1.6" />
    <path d="M2.8 8h14.4M8 8v8" />
  </svg>
)

export const IconMagnifier = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <circle cx="8.8" cy="8.8" r="5.2" />
    <path d="M12.6 12.6 16.6 16.6" />
  </svg>
)

export const IconCube = ({ size = 15 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M10 2.5 17 6.5v7L10 17.5 3 13.5v-7Z" />
    <path d="M3 6.5 10 10.5l7-4M10 10.5v7" />
  </svg>
)

export const IconFlask = ({ size = 20 }: IconProps) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M8 3h4M8.6 3v5l-4.4 7.6A1.6 1.6 0 0 0 5.6 18h8.8a1.6 1.6 0 0 0 1.4-2.4L11.4 8V3" />
    <path d="M6.6 13h6.8" />
  </svg>
)
