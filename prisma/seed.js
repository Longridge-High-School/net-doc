// Seed.js is run every time the container starts,
// any code here needs to make sure that it checks
// to see if the data needs to be added before adding it.

import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()
import bcrypt from 'bcrypt'

const main = async () => {
  const userCount = await prisma.user.count()

  if (userCount === 0) {
    console.log('No User, creating admin@net.doc')
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@net.doc',
        passwordHash: await bcrypt.hash('1234', 10),
        role: 'admin'
      }
    })
  }

  const aclCount = await prisma.aCL.count()

  if (aclCount === 0) {
    console.log('No ACLs')

    const acl = await prisma.aCL.create({data: {name: 'Default'}})

    await prisma.aCLEntry.create({
      data: {
        aclId: acl.id,
        type: 'role',
        target: 'admin',
        read: true,
        write: true,
        delete: true
      }
    })

    await prisma.aCLEntry.create({
      data: {
        aclId: acl.id,
        type: 'role',
        target: 'writer',
        read: true,
        write: true,
        delete: true
      }
    })

    await prisma.aCLEntry.create({
      data: {
        aclId: acl.id,
        type: 'role',
        target: 'reader',
        read: true,
        write: false,
        delete: false
      }
    })

    await prisma.entry.updateMany({data: {aclId: acl.id}})
    await prisma.asset.updateMany({data: {aclId: acl.id}})
  }

  const passwordsWithNoACLCount = await prisma.password.count({
    where: {aclId: ''}
  })

  if (passwordsWithNoACLCount !== 0) {
    console.log('Passwords need ACLs')
    const defaultAcl = await prisma.aCL.findFirstOrThrow({
      where: {name: 'Default'}
    })

    await prisma.password.updateMany({
      where: {aclId: ''},
      data: {aclId: defaultAcl.id}
    })
  }

  const documentsWithNoACLCount = await prisma.document.count({
    where: {aclId: ''}
  })

  if (documentsWithNoACLCount !== 0) {
    console.log('Documents need ACLs')
    const defaultAcl = await prisma.aCL.findFirstOrThrow({
      where: {name: 'Default'}
    })

    await prisma.document.updateMany({
      where: {aclId: ''},
      data: {aclId: defaultAcl.id}
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    // eslint-disable-next-line
    process.exit(1)
  })
