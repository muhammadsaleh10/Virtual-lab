import { useEffect, useState } from 'react'

/**
 * A deliberately tiny hash router — no dependency, but still gives real
 * bookmarkable URLs, working browser back/forward, and reload-in-place.
 */
export type Route =
  | { name: 'home' }
  | { name: 'physics' }
  | { name: 'chemistry' }
  | { name: 'hookes-law' }

function parseHash(hash: string): Route {
  const segments = hash.replace(/^#/, '').split('/').filter(Boolean)
  if (segments[0] === 'physics') {
    return segments[1] === 'hookes-law' ? { name: 'hookes-law' } : { name: 'physics' }
  }
  if (segments[0] === 'chemistry') return { name: 'chemistry' }
  return { name: 'home' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}

/** Navigates by pushing a new hash — this is what gives us a working back button. */
export function navigate(path: string): void {
  window.location.hash = path
}
