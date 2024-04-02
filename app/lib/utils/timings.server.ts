/**
 * Create a timings instance for this request
 *
 * @returns
 */
export const createTimings = () => {
  const timings: {key: string; description: string; duration: number}[] = []

  /**
   * Time the supplied function
   */
  const time = async <Result>(
    /** The unique key to store the times under */
    key: string,
    /** The description passed through the headers */
    description: string,
    fn: () => Promise<Result>
  ): Promise<Result> => {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      timings.push({key, description, duration})
    }
  }

  /**
   * Returns the header string value.
   */
  const getHeader = () => {
    return timings
      .reverse()
      .map(({key, description, duration}) => {
        return `${key};desc=${JSON.stringify(description)};dur=${duration}`
      })
      .join(',')
  }

  /** Returns a headers object */
  const headers = (additionalHeaders?: HeadersInit) => {
    return {...additionalHeaders, 'Server-Timing': getHeader()}
  }

  return {time, getHeader, headers}
}

export const combineServerTimingHeaders = (
  headers1: Headers,
  headers2: Headers
) => {
  const newHeaders = new Headers(headers1)
  newHeaders.append('Server-Timing', headers2.get('Server-Timing') ?? '')
  return newHeaders
}
