/// <reference types="vite/client" />

import type { CadenceConvertApi } from '../../preload/index'

declare global {
  interface Window {
    api: CadenceConvertApi
  }
}

export {}
