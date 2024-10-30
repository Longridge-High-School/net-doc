import {describe, test, expect} from 'vitest'

import {userForTest} from 'tests/unit-utils'

import {can} from '~/lib/rbac.server'
import {getPrisma} from '~/lib/prisma.server'

describe('RBAC', () => {
  test('should handle basic rbac queries', async () => {
    const reader = await userForTest({role: 'reader'})

    expect(await can(reader.user.role, 'logout')).toBeTruthy()
    expect(await can(reader.user.role, 'app')).toBeTruthy()
    expect(await can(reader.user.role, 'login')).toBeFalsy()

    await reader.dispose()
  })

  test('should apply permissions to pins', async () => {
    const prisma = getPrisma()

    const reader = await userForTest({role: 'reader'})
    const readerTwo = await userForTest({role: 'reader'})

    expect(await can(reader.user.role, 'pin:create')).toBeTruthy()

    const newPin = await prisma.pin.create({
      data: {target: 'passwords', targetId: 'fake-uuid', userId: reader.user.id}
    })

    expect(
      await can(reader.user.role, 'pin:delete', {
        targetId: newPin.id,
        user: reader.user
      })
    ).toBeTruthy()

    expect(
      await can(readerTwo.user.role, 'pin:delete', {
        targetId: newPin.id,
        user: readerTwo.user
      })
    ).toBeFalsy()

    await prisma.pin.delete({where: {id: newPin.id}})

    await reader.dispose()
    await readerTwo.dispose()
  })

  test('should apply permissions to sessions', async () => {
    const reader = await userForTest({role: 'reader'})
    const readerTwo = await userForTest({role: 'reader'})

    const readerSession = await reader.getSession()
    const readerTwoSession = await readerTwo.getSession()

    expect(
      await can(reader.user.role, 'session:delete', {
        user: reader.user,
        sessionId: readerSession.id
      })
    ).toBeTruthy()

    expect(
      await can(reader.user.role, 'session:delete', {
        user: reader.user,
        sessionId: readerTwoSession.id
      })
    ).toBeFalsy()

    await reader.dispose()
    await readerTwo.dispose()
  })
})
