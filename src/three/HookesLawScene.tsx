import { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { SPRING_ANCHOR_CM, pointerReadingCm, type Spring } from '../lib/physics'
import { useAnimatedValue, usePrefersReducedMotion } from '../hooks/useAnimatedValue'
import { totalMassG } from '../lib/types'
import LabBench3D from './LabBench3D'
import RetortStand3D from './RetortStand3D'
import Spring3D from './Spring3D'
import Ruler3D from './Ruler3D'
import MassHanger3D from './MassHanger3D'
import CameraRig from './CameraRig'
import { ANCHOR_WORLD_Y, BENCH_TOP_Y, SPRING_X, UNIT, cmToWorldY } from './sceneConstants'

interface Props {
  spring: Spring
  hangerAttached: boolean
  slotted: number[]
  inspecting: boolean
  onInspect: () => void
  onToggleHanger: () => void
  onAddMass: (grams: number) => void
}

/**
 * Everything inside the <Canvas>. This is purely a visual reading of the
 * existing experiment state — it never computes force, extension or the
 * spring constant itself, only where things sit and how far the spring has
 * stretched, using the same numbers the 2D apparatus already draws from.
 */
export default function HookesLawScene({
  spring,
  hangerAttached,
  slotted,
  inspecting,
  onInspect,
  onToggleHanger,
  onAddMass,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const controlsRef = useRef<OrbitControlsImpl>(null)

  const totalMass = totalMassG({ hangerAttached, slotted })
  const target = pointerReadingCm(spring, totalMass)
  const reading = useAnimatedValue(target, {
    stiffness: 105,
    damping: 11,
    enabled: !reduced,
  })

  const pointerY = cmToWorldY(reading)
  const springLengthUnits = Math.max((reading - SPRING_ANCHOR_CM) * UNIT, 0.05)

  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#eef1f6', '#3a3d42', 0.4]} />
      <directionalLight
        position={[3.5, 6, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      <LabBench3D />
      <RetortStand3D />
      <Spring3D anchorY={ANCHOR_WORLD_Y} x={SPRING_X} lengthUnits={springLengthUnits} />
      <MassHanger3D
        hangerAttached={hangerAttached}
        slotted={slotted}
        pointerY={pointerY}
        benchTopY={BENCH_TOP_Y}
        onToggleHanger={onToggleHanger}
        onAddMass={onAddMass}
      />
      <Ruler3D pointerCm={reading} onInspect={onInspect} />

      <CameraRig
        inspecting={inspecting}
        pointerY={pointerY}
        reducedMotion={reduced}
        controlsRef={controlsRef}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={3.5}
        maxDistance={11}
        minPolarAngle={0.5}
        maxPolarAngle={1.3}
        minAzimuthAngle={-0.75}
        maxAzimuthAngle={0.75}
        target={[0.3, 4.3, 0]}
      />
    </>
  )
}
