import requireAll from 'require-all'
import { VersionLadder } from './types'

export const require_all_updaters = (...args: Parameters<typeof requireAll>): VersionLadder => {
  const opts_or_dir = args[0]
  const opts = typeof opts_or_dir === 'string' ? { dirname: opts_or_dir } : opts_or_dir
  const steps = requireAll(opts)
  const ladder = Object.entries(steps).reduce<VersionLadder>(
    (_ladder, [version, step]) => ({ ..._ladder, [version]: step }),
    {},
  )
  return ladder
}