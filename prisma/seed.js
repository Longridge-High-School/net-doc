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
