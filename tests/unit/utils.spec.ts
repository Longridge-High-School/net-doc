import {describe, test, expect} from 'vitest'

import {getPrisma} from '~/lib/prisma.server'

import {
  getSetting,
  setSetting,
  DEFAULT_SETTINGS,
  getSettings
} from '~/lib/settings.server'

import {pageTitle} from '~/lib/utils/page-title'

import {
  createTimings,
  combineServerTimingHeaders
} from '~/lib/utils/timings.server'

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
    expect(
      pageTitle(
        [
          {
            pathname: '/app',
            data: {
              settings: {'site-name': 'Net Doc'}
            },
            id: '',
            params: {},
            meta: []
          }
        ],
        'Test'
      )
    ).toBe('Net Doc / Test')
  })
})

describe('Settings', () => {
  test('should return a default, save a value and return the value', async () => {
    const prisma = getPrisma()

    await prisma.setting.deleteMany({where: {key: 'site-name'}})

    const firstName = await getSetting('site-name')

    expect(firstName).toBe(DEFAULT_SETTINGS['site-name'])

    await setSetting('site-name', 'new net doc')

    const secondName = await getSetting('site-name')

    expect(secondName).toBe('new net doc')

    await prisma.setting.delete({where: {key: 'site-name'}})
  })

  test('should get all settings', async () => {
    const settings = await getSettings(['site-name', 'site-color'])

    expect(Object.keys(settings)).toHaveLength(2)
    expect(settings['site-name']).toBe(DEFAULT_SETTINGS['site-name'])
    expect(settings['site-color']).toBe(DEFAULT_SETTINGS['site-color'])
  })
})
