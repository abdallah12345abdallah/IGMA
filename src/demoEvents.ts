import type { SystemId } from './content/site'

const EVENT = 'igma:demo'

/** Lets any "request a demo" button preselect its system in the form. */
export function requestDemo(id: SystemId | 'other') {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: id }))
}

export function onDemoRequest(fn: (id: string) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<string>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
