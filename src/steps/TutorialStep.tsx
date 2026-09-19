import { Callout } from '../components/ui'
import {
  IconArrowRight,
  IconMagnifier,
  IconPlus,
  IconSpring,
} from '../components/Icons'

interface Props {
  onFinish: () => void
}

const STEPS: { icon: React.ReactNode; title: string; detail: string }[] = [
  {
    icon: <IconSpring size={18} />,
    title: 'A clamp stand, a spring, and a ruler',
    detail:
      'A spring hangs from the clamp stand next to a vertical millimetre ruler. A pointer fixed to the bottom of the spring is the only thing you can measure against that ruler.',
  },
  {
    icon: <IconPlus size={16} />,
    title: 'Attach the hanger, then add mass',
    detail:
      'Use the controls beneath the apparatus to attach the mass hanger and add slotted masses. The spring will stretch — let it settle for a moment before you read anything.',
  },
  {
    icon: <IconMagnifier size={16} />,
    title: 'Read the pointer yourself',
    detail:
      'Nothing is measured for you. Read the pointer position against the ruler at eye level, using the magnifier for precision, and write down what you actually see.',
  },
  {
    icon: <IconArrowRight size={16} />,
    title: 'Repeat, then process your own data',
    detail:
      'Record several readings — at least six, spread over a wide range of masses. Afterwards you will calculate extension and force yourself, plot a graph, and determine the spring constant from its gradient.',
  },
]

export default function TutorialStep({ onFinish }: Props) {
  return (
    <div>
      <h2 className="panel-title">Before you begin</h2>
      <p className="panel-intro">
        This is a real practical, not a demonstration — nothing is measured or
        calculated for you. Here is the sequence you will follow.
      </p>

      <div className="panel-section">
        <ol className="tutorial-steps">
          {STEPS.map((step, i) => (
            <li className="tutorial-step" key={i}>
              <span className="tutorial-step-icon" aria-hidden="true">
                {step.icon}
              </span>
              <div>
                <div className="tutorial-step-title">
                  {i + 1}. {step.title}
                </div>
                <div className="tutorial-step-detail">{step.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="panel-section">
        <Callout tone="info">
          <strong>Try it now:</strong> the apparatus on the left is live —
          attach the hanger and add a mass with the controls below it before
          you continue, just to get a feel for it.
        </Callout>
      </div>

      <div className="panel-section">
        <Callout tone="neutral">
          This walkthrough will not tell you what the ruler should read, what
          your graph should look like, or what this spring&rsquo;s constant
          is. That is what you are here to find out.
        </Callout>
      </div>

      <div className="panel-section">
        <button className="btn btn-primary btn-block btn-lg" onClick={onFinish}>
          Now perform the experiment yourself
          <IconArrowRight />
        </button>
      </div>
    </div>
  )
}
