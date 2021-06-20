import { memoize } from 'lodash'

export type ValueOf<T extends object, K extends keyof T = keyof T> = T[K]

export const never = (more = '') => {
  throw new Error(`never ${more}`)
}

const memoResolver = (...args: any[]) => JSON.stringify(args)
export const memo = <F extends (...args: any) => any>(f: F) => memoize(f, memoResolver)

export const sequencePromiseCalls = <T>(thunks: (() => Promise<T>)[]) => {
  const results: ({ resolved: true; value: T } | { resolved: false; err: any })[] = []
  return thunks
    .map(thunk => () =>
      thunk().then(
        (value: T) => results.push({ resolved: true, value }),
        (err: any) => results.push({ resolved: false, err }),
      ),
    )
    .reduce((prev, curr) => () => prev().then(curr))()
    .then(() => results)
}