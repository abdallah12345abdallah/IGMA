import { Fragment } from 'react'

/** Splits a headline into words so each one can rise into place in turn. */
export function Words({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w" style={{ ['--i' as string]: i + offset }}>
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}
