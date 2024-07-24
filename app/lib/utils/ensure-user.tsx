import {isIP} from 'is-ip'
import {subDays} from 'date-fns'

import {session} from '~/lib/cookies'

import {getPrisma} from '../prisma.server'
import {can} from '../rbac.server'

export const ensureUser = async (
  request: Request,
  canStr: string,
  meta: object | undefined
) => {
  const cookieHeader = request.headers.get('Cookie')
  const cookie = await session.parse(cookieHeader)

  const clientIp = getClientIPAddress(request)

  if (!cookie) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const cookieSession = await prisma.session.findFirst({
    where: {id: cookie},
    include: {user: {select: {id: true, name: true, role: true}}}
  })

  if (!cookieSession) {
    throw new Response('Access Denied', {
      status: 403
    })
  }

  const result = await can(cookieSession.user.role, canStr, {
    ...meta,
    user: cookieSession.user
  })

  if (!result) {
    throw new Response('Access Denied', {
      status: 403
    })
  }

  await prisma.session.update({
    where: {id: cookieSession.id},
    data: {ip: clientIp, path: new URL(request.url).pathname}
  })

  /* clean up */

  await prisma.session.deleteMany({
    where: {updatedAt: {lt: subDays(new Date(), 8)}}
  })

  return {
    ...cookieSession.user,
    sessionId: cookieSession.id,
    setCookie: await session.serialize(cookieSession.id)
  }
}

/**
 * from remix-utils
 *
 * https://github.com/sergiodxa/remix-utils/blob/main/src/server/get-client-ip-address.ts
 */

const headerNames = Object.freeze([
  'X-Client-IP',
  'X-Forwarded-For',
  'HTTP-X-Forwarded-For',
  'Fly-Client-IP',
  'CF-Connecting-IP',
  'Fastly-Client-Ip',
  'True-Client-Ip',
  'X-Real-IP',
  'X-Cluster-Client-IP',
  'X-Forwarded',
  'Forwarded-For',
  'Forwarded',
  'DO-Connecting-IP' /** Digital ocean app platform */,
  'oxygen-buyer-ip' /** Shopify oxygen platform */
] as const)

export function getClientIPAddress(request: Request): string {
  const headers = request.headers

  const ipAddress = headerNames
    .flatMap(headerName => {
      const value = headers.get(headerName)
      if (headerName === 'Forwarded') {
        return parseForwardedHeader(value)
      }
      if (!value?.includes(',')) return value
      return value.split(',').map(ip => ip.trim())
    })
    .find(ip => {
      if (ip === null) return false
      return isIP(ip)
    })

  return ipAddress ?? 'unknown'
}

function parseForwardedHeader(value: string | null): string | null {
  if (!value) return null
  for (const part of value.split(';')) {
    if (part.startsWith('for=')) return part.slice(4)
  }
  return null
}
