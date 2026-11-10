import type { SystemId } from './content/site'

const EVENT = 'igma:demo'

/** Lets any "request a demo" button preselect its system in the form. */
export function requestDemo(id: SystemId) {
  window.dispatchEvent(new CustomEvent<SystemId>(EVENT, { detail: id }))
}

export function onDemoRequest(fn: (id: SystemId) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<SystemId>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
