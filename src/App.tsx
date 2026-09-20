import { useEffect } from 'react'
import HomePage from './components/HomePage'
import PhysicsPage from './components/PhysicsPage'
import ChemistryPage from './components/ChemistryPage'
import LabScreen from './components/LabScreen'
import { navigate, useRoute } from './hooks/useRoute'
import { useExperiment } from './lib/store'

export default function App() {
  const route = useRoute()
  const { state, dispatch, reset } = useExperiment()

  // Each navigation is a fresh page as far as scroll position is concerned.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name])

  const hasSavedProgress = state.zeroReadingCm !== null || state.readings.length > 0

  switch (route.name) {
    case 'physics':
      return (
        <PhysicsPage
          hasSavedProgress={hasSavedProgress}
          onOpenHookesLaw={() => navigate('/physics/hookes-law')}
          onBack={() => navigate('/')}
        />
      )

    case 'chemistry':
      return <ChemistryPage onBack={() => navigate('/')} />

    case 'hookes-law':
      return (
        <LabScreen
          state={state}
          dispatch={dispatch}
          onReset={reset}
          onExit={() => navigate('/physics')}
        />
      )

    case 'home':
    default:
      return (
        <HomePage
          onOpenPhysics={() => navigate('/physics')}
          onOpenChemistry={() => navigate('/chemistry')}
        />
      )
  }
}
