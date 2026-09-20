import { useMemo } from 'react'
import * as THREE from 'three'
import { RULER_MAX_CM, RULER_MIN_CM } from '../lib/physics'
import { RULER_X, UNIT, cmToWorldY } from './sceneConstants'

interface Props {
  pointerCm: number
  onInspect: () => void
}

const WIDTH = 0.85
const DEPTH = 0.08
const HEIGHT = (RULER_MAX_CM - RULER_MIN_CM) * UNIT

/**
 * Draws the millimetre scale onto a canvas texture rather than building
 * hundreds of tiny tick meshes — cheap to render, and stays crisp when the
 * camera moves in close during ruler inspection.
 */
function buildRulerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 3200
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#fdfcf7'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#eae6d9'
  ctx.fillRect(0, 0, 26, canvas.height)

  const totalMm = (RULER_MAX_CM - RULER_MIN_CM) * 10
  const pxPerMm = canvas.height / totalMm

  for (let mm = 0; mm <= totalMm; mm++) {
    const y = mm * pxPerMm
    const isCm = mm % 10 === 0
    const isHalfCm = mm % 5 === 0
    const len = isCm ? 150 : isHalfCm ? 105 : 60
    ctx.strokeStyle = isCm ? '#3b3f47' : isHalfCm ? '#6b7079' : '#a4a9b1'
    ctx.lineWidth = isCm ? 7 : isHalfCm ? 5 : 3
    ctx.beginPath()
    ctx.moveTo(26, y)
    ctx.lineTo(26 + len, y)
    ctx.stroke()
  }

  ctx.fillStyle = '#3b3f47'
  ctx.font = '600 58px Inter, system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  for (let cm = RULER_MIN_CM; cm <= RULER_MAX_CM; cm++) {
    const y = cm * 10 * pxPerMm
    ctx.fillText(String(cm), 200, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export default function Ruler3D({ pointerCm, onInspect }: Props) {
  const texture = useMemo(buildRulerTexture, [])

  const materials = useMemo(() => {
    const plain = new THREE.MeshStandardMaterial({ color: '#fdfcf7', roughness: 0.7 })
    const face = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.55 })
    return [plain, plain, plain, plain, face, plain]
  }, [texture])

  const centerY = (cmToWorldY(RULER_MIN_CM) + cmToWorldY(RULER_MAX_CM)) / 2
  const pointerY = cmToWorldY(pointerCm)

  return (
    <group>
      <mesh
        position={[RULER_X, centerY, 0]}
        material={materials}
        onClick={(e) => {
          e.stopPropagation()
          onInspect()
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[WIDTH, HEIGHT, DEPTH]} />
      </mesh>

      {/* the pointer the student must read — never a printed number */}
      <mesh
        position={[RULER_X - WIDTH / 2 - 0.16, pointerY, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={(e) => {
          e.stopPropagation()
          onInspect()
        }}
      >
        <coneGeometry args={[0.09, 0.32, 3]} />
        <meshStandardMaterial color="#1b4dd6" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  )
}
