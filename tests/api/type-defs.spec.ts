import {describe, expect, test} from 'vitest'
import {faker} from '@faker-js/faker'

import {generateTypeDefs} from 'api/lib/type-defs'
import {getPrisma} from '~/lib/prisma.server'

import {createACL} from 'tests/unit-utils'

describe('Type Defs', () => {
  test('Should generate type defs', async () => {
    const prisma = getPrisma()
    const acl = await createACL('sample', {
      'role/admin': {read: true, write: true, delete: true}
    })

    const assetName = faker.lorem.word()
    const assetSlug = faker.lorem.slug()

    const nameField = await prisma.field.create({
      data: {
        name: 'Name',
        type: 'text',
        icon: '',
        description: 'Name field.',
        meta: ''
      }
    })

    const asset = await prisma.asset.create({
      data: {
        name: assetName,
        slug: assetSlug,
        icon: '🧪',
        singular: assetName,
        plural: `${assetName}s`,
        nameFieldId: '',
        aclId: acl.id
      }
    })

    await prisma.assetField.create({
      data: {assetId: asset.id, fieldId: nameField.id, order: 1}
    })

    const typeDefs = await generateTypeDefs()

    expect(typeDefs).toMatch(`type ${assetName} {`)
    expect(typeDefs).toMatch(`get${assetName}`)
    expect(typeDefs).toMatch(`get${assetName}s`)
  })
})
