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
import { generateId } from '../shared/utils/id'
import { hashPassword } from '../shared/utils/password'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '..', '.env') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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
      id: generateId('user'),
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
