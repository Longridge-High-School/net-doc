import {canCant} from 'cancant'

import {getPrisma} from './prisma.server'
import {asyncMap, indexedBy} from '@arcath/utils'

type SessionUser = {
  id: string
  name: string
  role: string
}

export const {can} = canCant<'guest' | 'reader' | 'writer' | 'admin'>({
  guest: {
    can: ['login']
  },
  reader: {
    can: [
      'logout',
      'app',
      'dashboard',
      'search',
      'user:self',
      'pin:create',
      {
        name: 'pin:*',
        when: async ({
          user,
          targetId
        }: {
          user: SessionUser
          targetId: string
        }) => {
          const prisma = getPrisma()

          const pin = await prisma.pin.findFirstOrThrow({
            where: {id: targetId},
            select: {userId: true, id: true}
          })

          return pin.userId === user.id
        }
      },
      {
        name: 'user:*',
        when: async ({user, targetId}) => {
          return user.id === targetId
        }
      },
      {
        name: 'asset:view',
        when: async ({
          user,
          assetSlug,
          asset
        }: {
          user: SessionUser
          assetSlug?: string
          asset?: string
        }) => {
          const prisma = getPrisma()

          const aclEntries: Array<{read: boolean}> =
            await prisma.$queryRaw`SELECT read FROM ACLEntry WHERE aclId = (SELECT aclId FROM Asset WHERE slug = ${assetSlug} OR id = ${asset}) AND (target = ${user.role} OR target = ${user.id})`

          const result = aclEntries.reduce((r, {read}) => {
            if (r) return true

            return read
          }, false)

          return result
        }
      },
      {
        name: 'asset:write',
        when: async ({
          user,
          assetSlug,
          asset
        }: {
          user: SessionUser
          assetSlug?: string
          asset?: string
        }) => {
          const prisma = getPrisma()

          const aclEntries: Array<{write: boolean}> =
            await prisma.$queryRaw`SELECT write FROM ACLEntry WHERE aclId = (SELECT aclId FROM Asset WHERE slug = ${assetSlug} OR id = ${asset}) AND (target = ${user.role} OR target = ${user.id})`

          const result = aclEntries.reduce((r, {write}) => {
            if (r) return true

            return write
          }, false)

          return result
        }
      },
      {
        name: 'entry:read',
        when: async ({user, entryId}: {user: SessionUser; entryId: string}) => {
          const prisma = getPrisma()

          const aclEntries: Array<{read: boolean}> =
            await prisma.$queryRaw`SELECT read FROM ACLEntry WHERE aclId = (SELECT aclId FROM Entry WHERE id = ${entryId}) AND (target = ${user.role} OR target = ${user.id})`

          const result = aclEntries.reduce((r, {read}) => {
            if (r) return true

            return read
          }, false)

          return result
        }
      },
      {
        name: 'entry:write',
        when: async ({user, entryId}: {user: SessionUser; entryId: string}) => {
          const prisma = getPrisma()

          const aclEntries: Array<{write: boolean}> =
            await prisma.$queryRaw`SELECT write FROM ACLEntry WHERE aclId = (SELECT aclId FROM Entry WHERE id = ${entryId}) AND (target = ${user.role} OR target = ${user.id})`

          const result = aclEntries.reduce((r, {write}) => {
            if (r) return true

            return write
          }, false)

          return result
        }
      },
      {
        name: 'entry:delete',
        when: async ({user, entryId}: {user: SessionUser; entryId: string}) => {
          const prisma = getPrisma()

          const aclEntries: Array<{delete: boolean}> =
            await prisma.$queryRaw`SELECT "delete" FROM ACLEntry WHERE aclId = (SELECT aclId FROM Entry WHERE id = ${entryId}) AND (target = ${user.role} OR target = ${user.id})`

          const result = aclEntries.reduce((r, {delete: del}) => {
            if (r) return true

            return del
          }, false)

          return result
        }
      }
    ]
  },
  writer: {
    inherits: ['reader'],
    can: ['logout']
  },
  admin: {
    inherits: ['writer'],
    can: [
      'app',
      'asset-manager:*',
      'field-manager:*',
      'user-manager:*',
      'dashboard',
      'search',
      'logout',
      'document:*',
      'password:*',
      'user:*',
      'dashboard:*',
      'process:*',
      'acl-manager:*'
    ]
  }
}) as {
  can: (
    role: string,
    operation: string | string[],
    params?: object
  ) => Promise<boolean>
}

export const canList = async (
  user: SessionUser,
  checks: Array<{
    index: string
    operation: string
    meta: object
  }>
) => {
  const results = await asyncMap(checks, async ({index, operation, meta}) => {
    return {index, result: await can(user.role, operation, {...meta, user})}
  })

  return indexedBy('index', results)
}
