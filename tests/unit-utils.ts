import {faker} from '@faker-js/faker'
import {keys} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {hashPassword} from '~/lib/user.server'

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

  const sessionHeader = async () => {
    const session = await getSession()

    const headers = new Headers()

    headers.set('Cookie', `session=${session.id}`)

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
