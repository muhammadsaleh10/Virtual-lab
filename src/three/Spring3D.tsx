import { useMemo } from 'react'
import * as THREE from 'three'

interface Props {
  /** World position of the fixed top end (the anchor point on the boss). */
  anchorY: number
  x: number
  /** Current physical length of the spring, in world units. Never computed here. */
  lengthUnits: number
}

const TURNS = 6.5
const COIL_RADIUS = 0.14
const TUBE_RADIUS = 0.028

/**
 * A single coil built once, one world-unit tall, then stretched by scaling
 * its parent group — cheap (no geometry rebuild) and it reads exactly like a
 * spring opening up as it extends, the same way a real one does.
 */
function useCoilGeometry() {
  return useMemo(() => {
    const points: THREE.Vector3[] = []
    const steps = 160
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = t * TURNS * Math.PI * 2
      points.push(
        new THREE.Vector3(Math.cos(angle) * COIL_RADIUS, -t, Math.sin(angle) * COIL_RADIUS),
      )
    }
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 220, TUBE_RADIUS, 8, false)
  }, [])
}

export default function Spring3D({ anchorY, x, lengthUnits }: Props) {
  const geometry = useCoilGeometry()
  const safeLength = Math.max(lengthUnits, 0.05)

  return (
    <group position={[x, anchorY, 0]}>
      <group scale={[1, safeLength, 1]}>
        <mesh geometry={geometry} castShadow>
          <meshStandardMaterial color="#7b828c" roughness={0.35} metalness={0.75} />
        </mesh>
      </group>
    </group>
  )
}
