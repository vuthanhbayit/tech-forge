import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import prisma from './prisma'

const SESSION_COOKIE_NAME = 'techforge_session'
const SESSION_EXPIRY_DAYS = 7

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(userId: string, event: H3Event) {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const userAgent = getHeader(event, 'user-agent') || null
  const ipAddress = getRequestIP(event) || null

  const session = await prisma.session.create({
    data: {
      id: generateId('session'),
      token,
      userId,
      userAgent,
      ipAddress,
      expiresAt,
    },
  })

  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return session
}

export async function getSessionUser(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE_NAME)
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    deleteCookie(event, SESSION_COOKIE_NAME)
    return null
  }

  // Update last login
  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastLoginAt: new Date() },
  })

  return session.user
}

export async function deleteSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE_NAME)
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  deleteCookie(event, SESSION_COOKIE_NAME)
}

export async function deleteAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } })
}
