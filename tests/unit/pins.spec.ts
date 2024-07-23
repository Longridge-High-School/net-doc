import {describe, test, expect} from 'vitest'

import {userForTest, appRequest} from 'tests/unit-utils'

import {action as pinAction} from '~/routes/api.pin'

import {getPrisma} from '~/lib/prisma.server'

describe('Pins', () => {
  test('It should pin items', async () => {
    const prisma = getPrisma()

    const userOne = await userForTest({role: 'reader'})

    const pinCount = await prisma.pin.count()

    const response = await pinAction({
      request: appRequest('/api/pin', {
        method: 'POST',
        body: JSON.stringify({target: 'documents', targetId: 'fake-uuid'}),
        headers: await userOne.sessionHeader()
      }),
      context: {},
      params: {}
    })

    expect(response.status).toBe(200)
    expect(await prisma.pin.count()).toBe(pinCount + 1)

    const deleteResponse = await pinAction({
      request: appRequest('/api/pin', {
        method: 'POST',
        body: JSON.stringify({target: 'documents', targetId: 'fake-uuid'}),
        headers: await userOne.sessionHeader()
      }),
      context: {},
      params: {}
    })

    expect(deleteResponse.status).toBe(200)
    expect(await prisma.pin.count()).toBe(pinCount)
  })
})
