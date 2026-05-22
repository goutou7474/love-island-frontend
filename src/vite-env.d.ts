/// <reference types="vite/client" />

import 'react'

// Allow inert attribute on HTML elements (HTML spec, supported in all modern browsers)
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    inert?: ''
  }
}

declare module 'animal-island-ui/style'
