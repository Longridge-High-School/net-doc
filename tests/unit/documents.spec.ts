import {describe, expect, test} from 'vitest'
import {faker} from '@faker-js/faker'

import {appRequest, userForTest, postBody, createACL} from 'tests/unit-utils'

import {getPrisma} from '~/lib/prisma.server'

import {action as addAction} from '~/routes/app.documents.add'
import {loader as listLoader} from '~/routes/app.documents._index'
import {loader as readLoader} from '~/routes/app.documents.$document._index'
import {action as editAction} from '~/routes/app.documents.$document.edit'

describe('Documents', () => {
  test('Should create documents', async () => {
    const prisma = getPrisma()

    const {sessionHeader, dispose} = await userForTest({role: 'admin'})

    const headers = await sessionHeader()
    headers.append('Content-Type', 'application/x-www-form-urlencoded')

    const testACL = await createACL('Test', {
      'role/admin': {read: true, write: true, delete: true}
    })

    const title = faker.lorem.sentence()

    const addResponse = await addAction({
      request: appRequest('/app/documents/add', {
        method: 'POST',
        headers,
        body: postBody({
          title,
          body: faker.lorem.paragraphs(),
          acl: testACL.id
        })
      }),
      context: {},
      params: {}
    })

    expect(addResponse.status).toBe(302)

    const newId = addResponse.headers.get('Location')!.split('/')[3]

    const document = await prisma.document.findFirstOrThrow({
      where: {id: newId}
    })

    expect(document.title).toBe(title)

    await prisma.document.delete({where: {id: newId}})

    await dispose()
  })

  test('Should restrict access', async () => {
    const prisma = getPrisma()

    const admin = await userForTest({role: 'admin'})
    const reader = await userForTest({role: 'reader'})

    const adminACL = await createACL('adminOnly', {
      'role/admin': {read: true, write: true, delete: true}
    })

    const headers = await admin.sessionHeader()
    headers.append('Content-Type', 'application/x-www-form-urlencoded')

    const addResponse = await addAction({
      request: appRequest('/app/documents/add', {
        method: 'POST',
        headers,
        body: postBody({
          title: faker.lorem.sentence(),
          body: faker.lorem.paragraphs(),
          acl: adminACL.id
        })
      }),
      context: {},
      params: {}
    })

    expect(addResponse.status).toBe(302)

    const newId = addResponse.headers.get('Location')!.split('/')[3]

    const adminListLoaderData = await listLoader({
      request: appRequest('/app/documents', {
        headers: await admin.sessionHeader()
      }),
      context: {},
      params: {}
    })

    const adminCanSeeDocument = adminListLoaderData.documents.reduce(
      (check, value) => {
        if (check) return check

        return value.id === newId
      },
      false
    )

    expect(adminCanSeeDocument).toBeTruthy()

    const readerListLoaderData = await listLoader({
      request: appRequest('/app/documents', {
        headers: await reader.sessionHeader()
      }),
      context: {},
      params: {}
    })

    const readerCanSeeDocument = readerListLoaderData.documents.reduce(
      (check, value) => {
        if (check) return check

        return value.id === newId
      },
      false
    )

    expect(readerCanSeeDocument).toBeFalsy()

    const adminViewRequest = await readLoader({
      request: appRequest(`/app/documents/${newId}`, {
        headers: await admin.sessionHeader()
      }),
      context: {},
      params: {document: newId}
    })

    expect(adminViewRequest).not.toBeUndefined()

    await expect(async () => {
      await readLoader({
        request: appRequest(`/app/documents/${newId}`, {
          headers: await reader.sessionHeader()
        }),
        context: {},
        params: {document: newId}
      })
    }).rejects.toThrowError()

    const adminEditResponse = await editAction({
      request: appRequest(`/app/documents/${newId}`, {
        method: 'POST',
        headers,
        body: postBody({
          title: faker.lorem.sentence(),
          body: faker.lorem.paragraphs(),
          acl: adminACL.id
        })
      }),
      context: {},
      params: {document: newId}
    })

    expect(adminEditResponse.status).toBe(302)

    await expect(async () => {
      const readerHeaders = await reader.sessionHeader()
      readerHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

      await editAction({
        request: appRequest(`/app/documents/${newId}`, {
          headers: readerHeaders,
          body: postBody({
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(),
            acl: adminACL.id
          })
        }),
        context: {},
        params: {document: newId}
      })
    }).rejects.toThrowError()

    await prisma.documentHistory.deleteMany({})

    await admin.dispose()
    await reader.dispose()
  })
})
