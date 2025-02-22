import {canCant} from 'cancant'
import {
  getAssetAcl,
  getDocumentRBAC,
  getEntryRBAC,
  getProcessRBAC,
  getPasswordRBAC
} from '@prisma/client/sql'
import {type TypedSql} from '@prisma/client/runtime/library'

import {getPrisma} from './prisma.server'
import {asyncMap, indexedBy} from '@arcath/utils'

type SessionUser = {
  id: string
  name: string
  role: string
}

const rbacQuery = async ({
  targetId,
  userId,
  action,
  query
}: {
  targetId: string
  userId: string
  action: 'read' | 'write' | 'delete'
  query: (
    targetId: string,
    userId: string
  ) => TypedSql<
    [string, string],
    {
      readCount: bigint | null
      writeCount: bigint | null
      deleteCount: bigint | null
      groupCount: bigint | null
    }
  >
}) => {
  const prisma = getPrisma()

  const result = (await prisma.$queryRawTyped(query(targetId, userId)))[0]

  if (result.groupCount === 0n) {
    return false
  }

  switch (action) {
    case 'read':
      return result.readCount! > 0n
    case 'write':
      return result.writeCount! > 0n
    case 'delete':
      return result.deleteCount! > 0n
    default:
      return false
  }
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

          const aclEntries = await prisma.$queryRawTyped(
            getAssetAcl(assetSlug ?? '', asset ?? '', user.role, user.id)
          )

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

          const aclEntries = await prisma.$queryRawTyped(
            getAssetAcl(assetSlug ?? '', asset ?? '', user.role, user.id)
          )

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
          return rbacQuery({
            targetId: entryId,
            userId: user.id,
            action: 'read',
            query: getEntryRBAC
          })
        }
      },
      {
        name: 'entry:write',
        when: async ({user, entryId}: {user: SessionUser; entryId: string}) => {
          return rbacQuery({
            targetId: entryId,
            userId: user.id,
            action: 'write',
            query: getEntryRBAC
          })
        }
      },
      {
        name: 'entry:delete',
        when: async ({user, entryId}: {user: SessionUser; entryId: string}) => {
          return rbacQuery({
            targetId: entryId,
            userId: user.id,
            action: 'delete',
            query: getEntryRBAC
          })
        }
      },
      {
        name: 'session:delete',
        when: async ({
          user,
          sessionId
        }: {
          user: SessionUser
          sessionId: string
        }) => {
          const prisma = getPrisma()

          const session = await prisma.session.findFirstOrThrow({
            where: {id: sessionId}
          })

          return session.userId === user.id
        }
      },
      'password:list',
      'password:add',
      {
        name: 'password:view',
        when: async ({
          user,
          passwordId
        }: {
          user: SessionUser
          passwordId: string
        }) => {
          return rbacQuery({
            targetId: passwordId,
            userId: user.id,
            action: 'read',
            query: getPasswordRBAC
          })
        }
      },
      {
        name: 'password:write',
        when: async ({
          user,
          passwordId
        }: {
          user: SessionUser
          passwordId: string
        }) => {
          return rbacQuery({
            targetId: passwordId,
            userId: user.id,
            action: 'write',
            query: getPasswordRBAC
          })
        }
      },
      {
        name: 'password:delete',
        when: async ({
          user,
          passwordId
        }: {
          user: SessionUser
          passwordId: string
        }) => {
          return rbacQuery({
            targetId: passwordId,
            userId: user.id,
            action: 'delete',
            query: getPasswordRBAC
          })
        }
      },
      'document:list',
      'document:add',
      {
        name: 'document:view',
        when: async ({
          user,
          documentId
        }: {
          user: SessionUser
          documentId: string
        }) => {
          return rbacQuery({
            targetId: documentId,
            userId: user.id,
            action: 'read',
            query: getDocumentRBAC
          })
        }
      },
      {
        name: 'document:write',
        when: async ({
          user,
          documentId
        }: {
          user: SessionUser
          documentId: string
        }) => {
          return rbacQuery({
            targetId: documentId,
            userId: user.id,
            action: 'write',
            query: getDocumentRBAC
          })
        }
      },
      {
        name: 'document:delete',
        when: async ({
          user,
          documentId
        }: {
          user: SessionUser
          documentId: string
        }) => {
          return rbacQuery({
            targetId: documentId,
            userId: user.id,
            action: 'delete',
            query: getDocumentRBAC
          })
        }
      },
      'process:list',
      'process:add',
      {
        name: 'process:view',
        when: async ({
          user,
          processId
        }: {
          user: SessionUser
          processId: string
        }) => {
          return rbacQuery({
            targetId: processId,
            userId: user.id,
            action: 'read',
            query: getProcessRBAC
          })
        }
      },
      {
        name: 'process:write',
        when: async ({
          user,
          processId
        }: {
          user: SessionUser
          processId: string
        }) => {
          return rbacQuery({
            targetId: processId,
            userId: user.id,
            action: 'write',
            query: getProcessRBAC
          })
        }
      },
      {
        name: 'process:delete',
        when: async ({
          user,
          processId
        }: {
          user: SessionUser
          processId: string
        }) => {
          return rbacQuery({
            targetId: processId,
            userId: user.id,
            action: 'delete',
            query: getProcessRBAC
          })
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
      'user:*',
      'dashboard:*',
      'process:*',
      'acl-manager:*',
      'system',
      'group-manager:*'
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

export const getDefaultACLID = async () => {
  const prisma = getPrisma()

  const acl = await prisma.aCL.findFirstOrThrow({where: {name: 'Default'}})

  return acl.id
}
