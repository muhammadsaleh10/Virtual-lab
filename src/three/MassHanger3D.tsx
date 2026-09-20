import { SPRING_X, TRAY_X } from './sceneConstants'

interface Props {
  hangerAttached: boolean
  slotted: number[]
  pointerY: number
  benchTopY: number
  onToggleHanger: () => void
  onAddMass: (grams: number) => void
}

const massColor = '#9aa0a9'
const massDark = '#5b6068'

/** One slotted-mass disc, sized so 100 g visibly reads as bigger than 50 g. */
function MassDisc({
  x,
  grams,
  y,
  onClick,
}: {
  x: number
  grams: number
  y: number
  onClick?: () => void
}) {
  const big = grams >= 100
  const radius = big ? 0.34 : 0.27
  const height = big ? 0.12 : 0.075

  return (
    <group
      position={[x, y, 0]}
      onClick={
        onClick &&
        ((e) => {
          e.stopPropagation()
          onClick()
        })
      }
    >
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, height, 24]} />
        <meshStandardMaterial color={massColor} roughness={0.4} metalness={0.55} />
      </mesh>
      {/* a lighter rim so stacked discs of the same colour still read as separate pieces */}
      <mesh position={[0, height / 2 - 0.006, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius - 0.012, 0.008, 8, 24]} />
        <meshStandardMaterial color="#c3c8cf" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

/** The hanger and whatever masses are actually attached, hanging under the spring. */
export default function MassHanger3D({
  hangerAttached,
  slotted,
  pointerY,
  benchTopY,
  onToggleHanger,
  onAddMass,
}: Props) {
  const stemLength = 0.42
  const plateHeight = 0.035
  // Masses stack upward from the plate's top surface, not its centre —
  // starting from the centre buried the first disc halfway inside the plate.
  let stackTop = pointerY - stemLength + plateHeight / 2

  const discs = hangerAttached
    ? slotted.map((grams, i) => {
        const h = grams >= 100 ? 0.12 : 0.075
        const y = stackTop + h / 2
        stackTop += h + 0.01
        return <MassDisc key={i} x={SPRING_X} grams={grams} y={y} />
      })
    : []

  return (
    <group>
      {hangerAttached && (
        <group onClick={(e) => {
          e.stopPropagation()
          onToggleHanger()
        }}>
          {/* stem from spring bottom down to the plate */}
          <mesh position={[SPRING_X, pointerY - stemLength / 2, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, stemLength, 8]} />
            <meshStandardMaterial color={massColor} roughness={0.4} metalness={0.5} />
          </mesh>
          {/* base plate the masses sit on */}
          <mesh position={[SPRING_X, pointerY - stemLength, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.035, 24]} />
            <meshStandardMaterial color={massDark} roughness={0.4} metalness={0.55} />
          </mesh>
          {discs}
        </group>
      )}

      {/* tray of masses the student can click to use */}
      <group position={[TRAY_X, benchTopY, 0]}>
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[1.3, 0.04, 1.1]} />
          <meshStandardMaterial color="#d7d1c2" roughness={0.8} />
        </mesh>

        <group
          position={[-0.35, 0.12, -0.28]}
          onClick={(e) => {
            e.stopPropagation()
            onToggleHanger()
          }}
        >
          <mesh castShadow>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color={hangerAttached ? '#8d939b' : massDark} roughness={0.4} metalness={0.6} />
          </mesh>
        </group>

        <MassDisc x={-0.35} grams={50} y={0.14} onClick={() => onAddMass(50)} />
        <MassDisc x={0.25} grams={100} y={0.16} onClick={() => onAddMass(100)} />
      </group>
    </group>
  )
}
