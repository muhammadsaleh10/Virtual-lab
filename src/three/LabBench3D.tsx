import { BENCH_TOP_Y } from './sceneConstants'

const BENCH_W = 11
const BENCH_D = 4.4
const BENCH_THICK = 0.28
const LEG_H = 1.6

/** A plain lab bench surface — just enough geometry to ground the scene. */
export default function LabBench3D() {
  const legY = BENCH_TOP_Y - BENCH_THICK / 2 - LEG_H / 2
  const legOffsetX = BENCH_W / 2 - 0.35
  const legOffsetZ = BENCH_D / 2 - 0.35

  return (
    <group>
      <mesh position={[0, BENCH_TOP_Y - BENCH_THICK / 2, 0]} receiveShadow>
        <boxGeometry args={[BENCH_W, BENCH_THICK, BENCH_D]} />
        <meshStandardMaterial color="#c9c2b2" roughness={0.85} metalness={0.02} />
      </mesh>
      {[
        [-legOffsetX, -legOffsetZ],
        [legOffsetX, -legOffsetZ],
        [-legOffsetX, legOffsetZ],
        [legOffsetX, legOffsetZ],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, legY, z]} castShadow>
          <boxGeometry args={[0.3, LEG_H, 0.3]} />
          <meshStandardMaterial color="#4a4d52" roughness={0.6} metalness={0.15} />
        </mesh>
      ))}
    </group>
  )
}
