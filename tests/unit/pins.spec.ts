import {describe, test, expect} from 'vitest'

import {userForTest, appRequest} from 'tests/unit-utils'

import {action as pinAction} from '~/routes/api.pin'

describe('Pins', () => {
  test('It should pin items', async () => {
    const userOne = await userForTest({role: 'reader'})
    const userTwo = await userForTest({role: 'reader'})

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
  })
})
