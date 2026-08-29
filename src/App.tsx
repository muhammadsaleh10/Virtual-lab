import { useEffect, useState } from 'react'
import Landing from './components/Landing'
import LabScreen from './components/LabScreen'
import { useExperiment } from './lib/store'

const STARTED_KEY = 'vsl.started.v1'

function readStarted(): boolean {
  try {
    return window.localStorage.getItem(STARTED_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const { state, dispatch, reset } = useExperiment()
  const [started, setStarted] = useState(readStarted)

  useEffect(() => {
    try {
      window.localStorage.setItem(STARTED_KEY, started ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [started])

  const hasSavedProgress =
    state.zeroReadingCm !== null || state.readings.length > 0

  if (!started) {
    return (
      <Landing
        onStart={() => setStarted(true)}
        hasSavedProgress={hasSavedProgress}
      />
    )
  }

  return (
    <LabScreen
      state={state}
      dispatch={dispatch}
      onReset={reset}
      onExit={() => setStarted(false)}
    />
  )
}
