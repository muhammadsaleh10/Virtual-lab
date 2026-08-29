import { useEffect, useRef, useState } from 'react'

/**
 * Eases a number towards a target using a damped harmonic oscillator — the
 * same equation that governs a real mass bouncing on a real spring. The
 * result is that adding a mass makes the apparatus dip, overshoot slightly
 * and settle, instead of sliding to its new position like a slider.
 */
export function useAnimatedValue(
  target: number,
  options: { stiffness?: number; damping?: number; enabled?: boolean } = {},
): number {
  const { stiffness = 120, damping = 13, enabled = true } = options
  const [value, setValue] = useState(target)
  const state = useRef({ value: target, velocity: 0 })
  const frame = useRef<number | null>(null)
  const last = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      state.current = { value: target, velocity: 0 }
      setValue(target)
      return
    }

    const step = (now: number) => {
      const previous = last.current ?? now
      // Clamp the timestep so a backgrounded tab cannot blow up the maths.
      const dt = Math.min((now - previous) / 1000, 1 / 30)
      last.current = now

      const s = state.current
      const acceleration = -stiffness * (s.value - target) - damping * s.velocity
      s.velocity += acceleration * dt
      s.value += s.velocity * dt

      const settled =
        Math.abs(s.value - target) < 0.0005 && Math.abs(s.velocity) < 0.005
      if (settled) {
        s.value = target
        s.velocity = 0
        setValue(target)
        frame.current = null
        last.current = null
        return
      }
      setValue(s.value)
      frame.current = requestAnimationFrame(step)
    }

    last.current = null
    frame.current = requestAnimationFrame(step)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
      last.current = null
    }
  }, [target, stiffness, damping, enabled])

  return value
}

/** True when the user has asked the system to keep motion to a minimum. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
