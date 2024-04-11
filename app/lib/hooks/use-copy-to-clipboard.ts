// Copied from https://github.com/streamich/react-use/blob/ade8d3905f544305515d010737b4ae604cc51024/src/useCopyToClipboard.ts
// Vite does not like react-use at the moment so we have to patch around it

import {useCallback, useEffect, useRef, useState} from 'react'
import writeText from 'copy-to-clipboard'

export default function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false)
  const get = useCallback(() => mountedRef.current, [])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  return get
}

const useSetState = <T extends object>(
  initialState: T = {} as T
): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] => {
  const [state, set] = useState<T>(initialState)
  // @ts-expect-error would not compile
  const setState = useCallback(patch => {
    set(prevState =>
      Object.assign(
        {},
        prevState,
        patch instanceof Function ? patch(prevState) : patch
      )
    )
  }, [])

  return [state, setState]
}

export interface CopyToClipboardState {
  value?: string
  noUserInteraction: boolean
  error?: Error
}

export const useCopyToClipboard = (): [
  CopyToClipboardState,
  (value: string) => void
] => {
  const isMounted = useMountedState()
  const [state, setState] = useSetState<CopyToClipboardState>({
    value: undefined,
    error: undefined,
    noUserInteraction: true
  })

  const copyToClipboard = useCallback(
    (value: string) => {
      if (!isMounted()) {
        return
      }
      let noUserInteraction
      let normalizedValue
      try {
        // only strings and numbers casted to strings can be copied to clipboard
        if (typeof value !== 'string' && typeof value !== 'number') {
          const error = new Error(
            `Cannot copy typeof ${typeof value} to clipboard, must be a string`
          )
          if (process.env.NODE_ENV === 'development') console.error(error)
          setState({
            value,
            error,
            noUserInteraction: true
          })
          return
        }
        // empty strings are also considered invalid
        else if (value === '') {
          const error = new Error(`Cannot copy empty string to clipboard.`)
          if (process.env.NODE_ENV === 'development') console.error(error)
          setState({
            value,
            error,
            noUserInteraction: true
          })
          return
        }
        normalizedValue = value.toString()
        noUserInteraction = writeText(normalizedValue)
        setState({
          value: normalizedValue,
          error: undefined,
          noUserInteraction
        })
      } catch (error) {
        setState({
          value: normalizedValue,
          // @ts-expect-error would not compile
          error,
          noUserInteraction
        })
      }
    },
    [setState, isMounted]
  )

  return [state, copyToClipboard]
}
