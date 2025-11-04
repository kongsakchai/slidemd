import path from 'path'
import { env } from 'process'

export const SLIDE_PATH = path.resolve(env.SLIDE_PATH || 'src/examples')
export const CACHE_PATH = path.resolve('.slidemd-cache')
export const BUILTIN_PATH = path.resolve('src/builtin')
