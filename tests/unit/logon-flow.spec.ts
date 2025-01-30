import {describe, test, expect} from 'vitest'

import {appRequest, userForTest, postBody} from 'tests/unit-utils'

import {loader as appUserLoader} from '~/routes/app.user'
import {action as logonAction} from '~/routes/app_.login'
import {loader as meApiLoader} from '~/routes/api.me'

describe('Logon Flow', () => {
  test('It should return a 403 if not logged in', async () => {
    let threw = false
    await appUserLoader({
      request: appRequest('/app'),
      context: {},
      params: {}
    }).catch(response => {
      threw = true

      expect(response.status).toBe(403)
    })

    expect(threw).toBeTruthy()
  })

  test('Logon page should return a session and that session should return the new user', async () => {
    const {user, password, dispose} = await userForTest({role: 'admin'})

    const response = (await logonAction({
      request: appRequest('/logon', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: postBody({email: user.email, password})
      }),
      context: {},
      params: {}
    })) as Awaited<ReturnType<typeof logonAction>> & {headers: Headers}

    expect(response.headers.getSetCookie()[0]).toMatch(/^__session=.*?;/)

    const meHeaders = new Headers()

    meHeaders.set('Cookie', response.headers.getSetCookie()[0])

    const testResponse = await meApiLoader({
      request: appRequest('/api/me', {
        headers: meHeaders
      }),
      context: {},
      params: {}
    })

    const data = await testResponse.json()

    expect(data.user.name).toBe(user.name)

    await dispose()
  })
})
