import {faker} from '@faker-js/faker'
import {keys, asyncForEach} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {hashPassword} from '~/lib/user.server'

import {action as logonAction} from '~/routes/app_.login'

const TEST_APP_URL = 'http://unit.test.app'

export const appRequest = (path: string, init?: RequestInit) => {
  return new Request(`${TEST_APP_URL}${path}`, init)
}

export const userForTest = async ({
  role
}: {
  role: 'reader' | 'writer' | 'admin'
}) => {
  let sessionId: string | null = null

  const prisma = getPrisma()

  const password = faker.string.alphanumeric()

  const user = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      passwordHash: await hashPassword(password),
      role,
      name: faker.person.fullName()
    }
  })

  const dispose = async () => {
    await prisma.user.delete({where: {id: user.id}})
  }
  const getSession = async () => {
    if (sessionId !== null) {
      return prisma.session.findFirstOrThrow({where: {id: sessionId}})
    }

    const session = await prisma.session.create({
      data: {userId: user.id, ip: '0.0.0.0'}
    })

    sessionId = session.id

    return session
  }

  let sessionCookie: string | null = null
  const sessionHeader = async (headers = new Headers()) => {
    if (sessionCookie) {
      headers.set('Cookie', sessionCookie.split(';')[0])

      return headers
    }

    const response = await logonAction({
      request: appRequest('/logon', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: postBody({email: user.email, password})
      }),
      context: {},
      params: {}
    })

    sessionCookie = response.headers.getSetCookie()[0]

    headers.set('Cookie', sessionCookie.split(';')[0])

    return headers
  }

  return {user, password, dispose, getSession, sessionHeader}
}

export const postBody = (body: object) => {
  return keys(body).reduce((bodyString, key) => {
    if (bodyString !== '') {
      bodyString = `${bodyString}&`
    }

    return `${bodyString}${key}=${body[key]}`
  }, '')
}

type ACLDefinition = {
  [target: string]: {read: boolean; write: boolean; delete: boolean}
}

export const createACL = async (name: string, definition: ACLDefinition) => {
  const prisma = getPrisma()

  const acl = await prisma.aCL.create({data: {name}})

  await asyncForEach(keys(definition), async typeAndTarget => {
    const [type, target] = (typeAndTarget as string).split('/')

    const {read, write, delete: del} = definition[typeAndTarget]

    await prisma.aCLEntry.create({
      data: {
        aclId: acl.id,
        type,
        target,
        read,
        write,
        delete: del
      }
    })
  })

  return {
    id: acl.id
  }
}
