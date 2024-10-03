import {getPrisma} from '../prisma.server'

export const trackRecentItem = async (
  target: string,
  targetId: string,
  userId: string
) => {
  const prisma = getPrisma()

  const recent = await prisma.recentItems.findFirst({
    where: {target, targetId, userId}
  })

  await prisma.recentItems.upsert({
    create: {target, targetId, userId},
    update: {target, targetId, userId},
    where: {id: recent ? recent.id : ''}
  })
}
