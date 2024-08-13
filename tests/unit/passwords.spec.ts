import {describe, expect, test} from 'vitest'
import {faker} from '@faker-js/faker'

import {appRequest, userForTest, postBody, createACL} from 'tests/unit-utils'

import {getPrisma} from '~/lib/prisma.server'

import {action as addAction} from '~/routes/app.passwords.add'
import {loader as listLoader} from '~/routes/app.passwords._index'
import {loader as readLoader} from '~/routes/app.passwords.$password._index'

describe('Passwords', () => {
  test('Passwords should be hashed in the database', async () => {
    const {sessionHeader, dispose} = await userForTest({role: 'admin'})

    const prisma = getPrisma()

    const passwordCount = await prisma.password.count()

    const headers = await sessionHeader()
    headers.append('Content-Type', 'application/x-www-form-urlencoded')

    const newPasswordString = faker.internet.password()

    const testACL = await createACL('Test', {
      'role/admin': {read: true, write: true, delete: true}
    })

    const addResponse = await addAction({
      request: appRequest('/app/passwords/add', {
        method: 'POST',
        headers,
        body: postBody({
          title: faker.company.name(),
          username: faker.internet.email(),
          password: newPasswordString,
          notes: faker.lorem.sentences(),
          acl: testACL.id
        })
      }),
      context: {},
      params: {}
    })

    // Should be 302 as a redirect
    expect(addResponse.status).toBe(302)

    // Should have added a password
    expect(await prisma.password.count()).toBe(passwordCount + 1)

    const newId = addResponse.headers.get('Location')!.split('/')[3]

    const dbPassword = await prisma.password.findFirstOrThrow({
      where: {id: newId}
    })

    expect(dbPassword.password).not.toBe(newPasswordString)

    await prisma.password.delete({where: {id: dbPassword.id}})
    await dispose()
  })

  test('Passwords should have permissions applied to them', async () => {
    const admin = await userForTest({role: 'admin'})
    const writer = await userForTest({role: 'writer'})
    const reader = await userForTest({role: 'reader'})

    const adminACL = await createACL('adminOnly', {
      'role/admin': {read: true, write: true, delete: true}
    })

    const contentTypeHeader = new Headers()

    contentTypeHeader.set('Content-Type', 'application/x-www-form-urlencoded')

    const addResponse = await addAction({
      request: appRequest('/app/passwords/add', {
        method: 'POST',
        headers: await admin.sessionHeader(contentTypeHeader),
        body: postBody({
          title: faker.company.name(),
          username: faker.internet.email(),
          password: faker.internet.password(),
          notes: faker.lorem.sentences(),
          acl: adminACL.id
        })
      }),
      context: {},
      params: {}
    })

    const newId = addResponse.headers.get('Location')!.split('/')[3]

    const adminListLoaderResponse = await listLoader({
      request: appRequest('/app/passwords', {
        headers: await admin.sessionHeader()
      }),
      context: {},
      params: {}
    })

    const adminListLoaderData = await adminListLoaderResponse.json()

    const adminCanSeePassword = adminListLoaderData.passwords.reduce(
      (check, value) => {
        if (check) return check

        return value.id === newId
      },
      false
    )

    expect(adminCanSeePassword).toBeTruthy()

    const readerListLoaderResponse = await listLoader({
      request: appRequest('/app/passwords', {
        headers: await reader.sessionHeader()
      }),
      context: {},
      params: {}
    })

    expect(readerListLoaderResponse.status).toBe(200)

    const readerListLoaderData = await readerListLoaderResponse.json()

    const readerCanSeePassword = readerListLoaderData.passwords.reduce(
      (check, value) => {
        if (check) return check

        return value.id === newId
      },
      false
    )

    expect(readerCanSeePassword).toBeFalsy()

    const adminViewRequest = await readLoader({
      request: appRequest(`/app/passwords/${newId}`, {
        headers: await admin.sessionHeader()
      }),
      context: {},
      params: {password: newId}
    })

    expect(adminViewRequest.status).toBe(200)

    await expect(async () => {
      await readLoader({
        request: appRequest(`/app/passwords/${newId}`, {
          headers: await reader.sessionHeader()
        }),
        context: {},
        params: {password: newId}
      })
    }).rejects.toThrowError()

    await admin.dispose()
    await writer.dispose()
    await reader.dispose()
  })
})
