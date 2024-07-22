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

  return {user, password, dispose}
}

export const postBody = (body: object) => {
  return keys(body).reduce((bodyString, key) => {
    if (bodyString !== '') {
      bodyString = `${bodyString}&`
    }

    return `${bodyString}${key}=${body[key]}`
  }, '')
}
