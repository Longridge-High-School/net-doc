import {describe, test, expect} from 'vitest'

import {appRequest, userForTest, postBody} from 'tests/unit-utils'

import {loader as appUserLoader} from '~/routes/app.user'
import {action as logonAction} from '~/routes/app_.login'

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

  test('Logon page should return a session', async () => {
    const {user, password, dispose} = await userForTest({role: 'admin'})

    const response = await logonAction({
      request: appRequest('/logon', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: postBody({email: user.email, password})
      }),
      context: {},
      params: {}
    })

    expect(response.headers.getSetCookie()[0]).toMatch(/^session=.*?;/)

    await dispose()
  })
})
