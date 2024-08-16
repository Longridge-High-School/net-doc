import {describe, test, expect} from 'vitest'

import {
  createTimings,
  combineServerTimingHeaders
} from '~/lib/utils/timings.server'

import {pageTitle} from '~/lib/utils/page-title'

describe('Timing', () => {
  test('should create timings', async () => {
    const {time, headers} = createTimings()

    await time('runTest', 'Run Test', async () => {
      return true
    })

    const timingHeaders = headers()

    expect(timingHeaders['Server-Timing']).toMatch(/runTest/)

    const timings2 = createTimings()

    await timings2.time('test2', 'Test Two', async () => {
      return true
    })

    const timing2Headers = timings2.headers()

    expect(timing2Headers['Server-Timing']).toMatch(/test2/)

    const combinedHeaders = combineServerTimingHeaders(
      new Headers(timingHeaders),
      new Headers(timing2Headers)
    )

    const combined = combinedHeaders.get('Server-Timing')

    expect(combined).toMatch(/runTest/)
    expect(combined).toMatch(/test2/)

    const combined2 = combineServerTimingHeaders(
      new Headers(timingHeaders),
      new Headers()
    ).get('Server-Timing')

    expect(combined2).toMatch(/runTest/)
    expect(combined2).not.toMatch(/test2/)
  })
})

describe('Page Title', () => {
  test('should generate a page title', () => {
    expect(pageTitle('Test')).toBe('Net Doc / Test')
  })
})
