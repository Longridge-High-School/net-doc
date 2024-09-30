import {canCant} from 'cancant'
import {getEntryAcl, getAssetAcl} from '@prisma/client/sql'

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
          const prisma = getPrisma()

          const aclEntries = await prisma.$queryRawTyped(
            getEntryAcl(entryId, user.role, user.id)
          )

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

          const aclEntries = await prisma.$queryRawTyped(
            getEntryAcl(entryId, user.role, user.id)
          )

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

          const aclEntries = await prisma.$queryRawTyped(
            getEntryAcl(entryId, user.role, user.id)
          )

          const result = aclEntries.reduce((r, {delete: del}) => {
            if (r) return true

            return del
          }, false)

          return result
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
          const prisma = getPrisma()

          const password = await prisma.password.findFirstOrThrow({
            where: {id: passwordId},
            include: {acl: {include: {entries: true}}}
          })

          const result = password.acl.entries.reduce(
            (r, {target, type, read}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return read
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const password = await prisma.password.findFirstOrThrow({
            where: {id: passwordId},
            include: {acl: {include: {entries: true}}}
          })

          const result = password.acl.entries.reduce(
            (r, {target, type, write}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return write
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const password = await prisma.password.findFirstOrThrow({
            where: {id: passwordId},
            include: {acl: {include: {entries: true}}}
          })

          const result = password.acl.entries.reduce(
            (r, {target, type, delete: del}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return del
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const document = await prisma.document.findFirstOrThrow({
            where: {id: documentId},
            include: {acl: {include: {entries: true}}}
          })

          const result = document.acl.entries.reduce(
            (r, {target, type, read}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return read
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const document = await prisma.document.findFirstOrThrow({
            where: {id: documentId},
            include: {acl: {include: {entries: true}}}
          })

          const result = document.acl.entries.reduce(
            (r, {target, type, write}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return write
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const document = await prisma.document.findFirstOrThrow({
            where: {id: documentId},
            include: {acl: {include: {entries: true}}}
          })

          const result = document.acl.entries.reduce(
            (r, {target, type, delete: del}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return del
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const process = await prisma.process.findFirstOrThrow({
            where: {id: processId},
            include: {acl: {include: {entries: true}}}
          })

          const result = process.acl.entries.reduce(
            (r, {target, type, read}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return read
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const process = await prisma.process.findFirstOrThrow({
            where: {id: processId},
            include: {acl: {include: {entries: true}}}
          })

          const result = process.acl.entries.reduce(
            (r, {target, type, write}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return write
            },
            false
          )

          return result
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
          const prisma = getPrisma()

          const process = await prisma.process.findFirstOrThrow({
            where: {id: processId},
            include: {acl: {include: {entries: true}}}
          })

          const result = process.acl.entries.reduce(
            (r, {target, type, delete: del}) => {
              if (r) return true

              if (type === 'user' && target !== user.id) return false
              if (type === 'role' && target !== user.role) return false

              return del
            },
            false
          )

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
      'user:*',
      'dashboard:*',
      'process:*',
      'acl-manager:*',
      'system'
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
