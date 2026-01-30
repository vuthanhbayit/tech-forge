/**
 * Seed Super Admin User
 * Run: pnpm db:seed:admin
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '..', '.env') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

async function seedAdmin() {
  const email = 'admin@techforge.vn'
  const password = 'Admin@123'

  console.log('Creating super admin user...')

  // Check if admin already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log(`User ${email} already exists!`)
    return
  }

  // Get super_admin role
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  })

  if (!superAdminRole) {
    console.error('super_admin role not found. Run pnpm db:seed first.')
    process.exit(1)
  }

  // Create admin user
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      emailVerified: new Date(),
      isActive: true,
      roleId: superAdminRole.id,
    },
  })

  console.log('✅ Super Admin created successfully!')
  console.log('─'.repeat(40))
  console.log(`   Email:    ${email}`)
  console.log(`   Password: ${password}`)
  console.log(`   Role:     super_admin`)
  console.log('─'.repeat(40))
  console.log('⚠️  Hãy đổi mật khẩu sau khi đăng nhập!')
}

seedAdmin()
  .catch(console.error)
  .finally(() => {
    pool.end()
    prisma.$disconnect()
  })
