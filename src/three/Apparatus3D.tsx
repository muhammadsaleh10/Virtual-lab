import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Spring } from '../lib/physics'
import HookesLawScene from './HookesLawScene'
import { IconArrowLeft } from '../components/Icons'

interface Props {
  spring: Spring
  hangerAttached: boolean
  slotted: number[]
  onToggleHanger: () => void
  onAddMass: (grams: number) => void
}

/**
 * Drop-in 3D replacement for <Apparatus>. Same inputs, same physics source
 * of truth (physics.ts via HookesLawScene) — this file owns nothing but the
 * canvas, the camera-inspect toggle, and the "back to bench view" affordance
 * that has to live outside the canvas as ordinary DOM.
 */
export default function Apparatus3D({
  spring,
  hangerAttached,
  slotted,
  onToggleHanger,
  onAddMass,
}: Props) {
  const [inspecting, setInspecting] = useState(false)

  return (
    <div className="bench-3d">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [2.6, 7.6, 9.5], fov: 42, near: 0.1, far: 60 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#f2f1ed']} />
        <Suspense fallback={null}>
          <HookesLawScene
            spring={spring}
            hangerAttached={hangerAttached}
            slotted={slotted}
            inspecting={inspecting}
            onInspect={() => setInspecting(true)}
            onToggleHanger={onToggleHanger}
            onAddMass={onAddMass}
          />
        </Suspense>
      </Canvas>

      {inspecting && (
        <button className="btn btn-secondary bench-3d-exit" onClick={() => setInspecting(false)}>
          <IconArrowLeft size={14} />
          Back to bench view
        </button>
      )}
    </div>
  )
}
