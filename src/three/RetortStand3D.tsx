import { ANCHOR_WORLD_Y, BENCH_TOP_Y, ROD_HEIGHT, ROD_X, SPRING_X } from './sceneConstants'

const ROD_RADIUS = 0.06
const BASE_W = 3.6
const BASE_D = 0.9
const BASE_H = 0.18

/** Heavy base, vertical rod, and the boss/clamp holding the spring's anchor. */
export default function RetortStand3D() {
  const bossArmLength = SPRING_X - ROD_X - 0.2

  return (
    <group>
      {/* heavy base */}
      <mesh position={[ROD_X, BENCH_TOP_Y + BASE_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BASE_W, BASE_H, BASE_D]} />
        <meshStandardMaterial color="#3d4147" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* vertical rod */}
      <mesh
        position={[ROD_X, BENCH_TOP_Y + BASE_H + ROD_HEIGHT / 2, 0]}
        castShadow
      >
        <cylinderGeometry args={[ROD_RADIUS, ROD_RADIUS, ROD_HEIGHT, 16]} />
        <meshStandardMaterial color="#9aa0a8" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* boss head clamped to the rod */}
      <group position={[ROD_X, ANCHOR_WORLD_Y, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.4, 0.34]} />
          <meshStandardMaterial color="#5a5f66" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* the arm reaching out to the spring */}
        <mesh
          position={[bossArmLength / 2 + 0.17, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, bossArmLength, 12]} />
          <meshStandardMaterial color="#8d939b" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* anchor point where the spring actually attaches */}
      <mesh position={[SPRING_X, ANCHOR_WORLD_Y, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#3d4147" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}
