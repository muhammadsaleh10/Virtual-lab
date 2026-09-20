import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { RULER_X } from './sceneConstants'

type Mode = 'free' | 'entering' | 'inspecting' | 'exiting'

interface Props {
  inspecting: boolean
  pointerY: number
  reducedMotion: boolean
  controlsRef: React.RefObject<OrbitControlsImpl>
}

/**
 * Drives the camera between the default apparatus view and a close-up on
 * the ruler, remembering exactly where the student was orbiting so
 * "back to bench view" restores it rather than resetting it. Orbit controls
 * are only ever driven imperatively here — never fought with React state —
 * because this has to run every frame without triggering re-renders.
 */
export default function CameraRig({
  inspecting,
  pointerY,
  reducedMotion,
  controlsRef,
}: Props) {
  const { camera } = useThree()
  const mode = useRef<Mode>('free')
  const savedPos = useRef(new THREE.Vector3())
  const savedTarget = useRef(new THREE.Vector3())
  const wasInspecting = useRef(false)
  const desiredPos = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return

    if (inspecting && !wasInspecting.current) {
      savedPos.current.copy(camera.position)
      savedTarget.current.copy(controls.target)
      mode.current = 'entering'
      controls.enabled = false
    }
    if (!inspecting && wasInspecting.current) {
      mode.current = 'exiting'
    }
    wasInspecting.current = inspecting

    if (mode.current === 'free') return

    const alpha = reducedMotion ? 1 : mode.current === 'inspecting' ? 0.16 : 0.09

    if (mode.current === 'exiting') {
      desiredPos.current.copy(savedPos.current)
      desiredTarget.current.copy(savedTarget.current)
    } else {
      desiredPos.current.set(RULER_X + 1.0, pointerY, 1.3)
      desiredTarget.current.set(RULER_X, pointerY, 0)
    }

    camera.position.lerp(desiredPos.current, alpha)
    controls.target.lerp(desiredTarget.current, alpha)
    controls.update()

    const settled = camera.position.distanceTo(desiredPos.current) < 0.03

    if (mode.current === 'entering' && settled) mode.current = 'inspecting'
    if (mode.current === 'exiting' && settled) {
      mode.current = 'free'
      controls.enabled = true
    }
  })

  return null
}
