/**
 * TechForge Permission System
 *
 * Hệ thống phân quyền dựa trên Resource + Action + Scope
 *
 * Resources: Các module/tính năng trong hệ thống
 * Actions: CREATE, READ, UPDATE, DELETE, MANAGE (full access)
 * Scope: OWN (chỉ record của mình), ALL (tất cả records)
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { PrismaClient, PermissionAction, PermissionScope } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '..', '.env') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Define all resources and their permissions
const RESOURCES = {
  // Products Module
  products: {
    group: 'Sản phẩm',
    permissions: [
      { action: 'CREATE', name: 'Tạo sản phẩm mới' },
      { action: 'READ', name: 'Xem danh sách sản phẩm' },
      { action: 'UPDATE', name: 'Cập nhật sản phẩm' },
      { action: 'DELETE', name: 'Xóa sản phẩm' },
      { action: 'MANAGE', name: 'Quản lý toàn bộ sản phẩm' },
    ],
  },
  categories: {
    group: 'Sản phẩm',
    permissions: [
      { action: 'CREATE', name: 'Tạo danh mục mới' },
      { action: 'READ', name: 'Xem danh mục' },
      { action: 'UPDATE', name: 'Cập nhật danh mục' },
      { action: 'DELETE', name: 'Xóa danh mục' },
      { action: 'MANAGE', name: 'Quản lý danh mục' },
    ],
  },
  inventory: {
    group: 'Sản phẩm',
    permissions: [
      { action: 'READ', name: 'Xem tồn kho' },
      { action: 'UPDATE', name: 'Cập nhật tồn kho' },
      { action: 'MANAGE', name: 'Quản lý tồn kho' },
    ],
  },

  // Orders Module
  orders: {
    group: 'Đơn hàng',
    permissions: [
      { action: 'CREATE', name: 'Tạo đơn hàng thủ công' },
      { action: 'READ', name: 'Xem đơn hàng', scopes: ['OWN', 'ALL'] },
      { action: 'UPDATE', name: 'Cập nhật đơn hàng' },
      { action: 'DELETE', name: 'Xóa/Hủy đơn hàng' },
      { action: 'MANAGE', name: 'Quản lý toàn bộ đơn hàng' },
    ],
  },
  fulfillments: {
    group: 'Đơn hàng',
    permissions: [
      { action: 'CREATE', name: 'Tạo vận đơn' },
      { action: 'READ', name: 'Xem thông tin vận chuyển' },
      { action: 'UPDATE', name: 'Cập nhật trạng thái vận chuyển' },
      { action: 'MANAGE', name: 'Quản lý vận chuyển' },
    ],
  },
  payments: {
    group: 'Đơn hàng',
    permissions: [
      { action: 'READ', name: 'Xem thanh toán' },
      { action: 'UPDATE', name: 'Xác nhận thanh toán' },
      { action: 'MANAGE', name: 'Quản lý thanh toán' },
    ],
  },

  // Users Module
  users: {
    group: 'Người dùng',
    permissions: [
      { action: 'CREATE', name: 'Tạo người dùng mới' },
      { action: 'READ', name: 'Xem danh sách người dùng' },
      { action: 'UPDATE', name: 'Cập nhật thông tin người dùng' },
      { action: 'DELETE', name: 'Xóa/Vô hiệu hóa người dùng' },
      { action: 'MANAGE', name: 'Quản lý toàn bộ người dùng' },
    ],
  },
  roles: {
    group: 'Người dùng',
    permissions: [
      { action: 'CREATE', name: 'Tạo vai trò mới' },
      { action: 'READ', name: 'Xem danh sách vai trò' },
      { action: 'UPDATE', name: 'Cập nhật phân quyền' },
      { action: 'DELETE', name: 'Xóa vai trò' },
      { action: 'MANAGE', name: 'Quản lý phân quyền' },
    ],
  },
  customer_groups: {
    group: 'Người dùng',
    permissions: [
      { action: 'CREATE', name: 'Tạo nhóm khách hàng' },
      { action: 'READ', name: 'Xem nhóm khách hàng' },
      { action: 'UPDATE', name: 'Cập nhật nhóm khách hàng' },
      { action: 'DELETE', name: 'Xóa nhóm khách hàng' },
      { action: 'MANAGE', name: 'Quản lý nhóm khách hàng' },
    ],
  },

  // Pricing & Promotions
  price_lists: {
    group: 'Giá & Khuyến mãi',
    permissions: [
      { action: 'CREATE', name: 'Tạo bảng giá' },
      { action: 'READ', name: 'Xem bảng giá' },
      { action: 'UPDATE', name: 'Cập nhật bảng giá' },
      { action: 'DELETE', name: 'Xóa bảng giá' },
      { action: 'MANAGE', name: 'Quản lý bảng giá' },
    ],
  },
  promotions: {
    group: 'Giá & Khuyến mãi',
    permissions: [
      { action: 'CREATE', name: 'Tạo mã khuyến mãi' },
      { action: 'READ', name: 'Xem khuyến mãi' },
      { action: 'UPDATE', name: 'Cập nhật khuyến mãi' },
      { action: 'DELETE', name: 'Xóa khuyến mãi' },
      { action: 'MANAGE', name: 'Quản lý khuyến mãi' },
    ],
  },

  // Blog Module
  blog_posts: {
    group: 'Blog',
    permissions: [
      { action: 'CREATE', name: 'Tạo bài viết' },
      { action: 'READ', name: 'Xem bài viết', scopes: ['OWN', 'ALL'] },
      { action: 'UPDATE', name: 'Cập nhật bài viết', scopes: ['OWN', 'ALL'] },
      { action: 'DELETE', name: 'Xóa bài viết', scopes: ['OWN', 'ALL'] },
      { action: 'MANAGE', name: 'Quản lý toàn bộ blog' },
    ],
  },
  blog_categories: {
    group: 'Blog',
    permissions: [
      { action: 'CREATE', name: 'Tạo danh mục blog' },
      { action: 'READ', name: 'Xem danh mục blog' },
      { action: 'UPDATE', name: 'Cập nhật danh mục blog' },
      { action: 'DELETE', name: 'Xóa danh mục blog' },
      { action: 'MANAGE', name: 'Quản lý danh mục blog' },
    ],
  },

  // Reviews & Q&A
  reviews: {
    group: 'Đánh giá',
    permissions: [
      { action: 'READ', name: 'Xem đánh giá' },
      { action: 'UPDATE', name: 'Duyệt/Ẩn đánh giá' },
      { action: 'DELETE', name: 'Xóa đánh giá' },
      { action: 'MANAGE', name: 'Quản lý đánh giá' },
    ],
  },
  product_qa: {
    group: 'Đánh giá',
    permissions: [
      { action: 'READ', name: 'Xem hỏi đáp' },
      { action: 'CREATE', name: 'Trả lời câu hỏi' },
      { action: 'UPDATE', name: 'Duyệt/Sửa hỏi đáp' },
      { action: 'DELETE', name: 'Xóa hỏi đáp' },
      { action: 'MANAGE', name: 'Quản lý hỏi đáp' },
    ],
  },

  // Settings
  settings: {
    group: 'Cài đặt',
    permissions: [
      { action: 'READ', name: 'Xem cài đặt' },
      { action: 'UPDATE', name: 'Cập nhật cài đặt' },
      { action: 'MANAGE', name: 'Quản lý cài đặt hệ thống' },
    ],
  },
  media: {
    group: 'Cài đặt',
    permissions: [
      { action: 'CREATE', name: 'Upload file' },
      { action: 'READ', name: 'Xem media' },
      { action: 'DELETE', name: 'Xóa file' },
      { action: 'MANAGE', name: 'Quản lý media' },
    ],
  },

  // Analytics & Reports
  analytics: {
    group: 'Báo cáo',
    permissions: [
      { action: 'READ', name: 'Xem thống kê tổng quan' },
      { action: 'MANAGE', name: 'Xem tất cả báo cáo chi tiết' },
    ],
  },

  // Chat/Support
  chat: {
    group: 'Hỗ trợ',
    permissions: [
      { action: 'READ', name: 'Xem lịch sử chat' },
      { action: 'MANAGE', name: 'Quản lý AI chatbot' },
    ],
  },
}

// Default roles with their permissions
const DEFAULT_ROLES = {
  super_admin: {
    displayName: 'Super Admin',
    description: 'Toàn quyền quản trị hệ thống',
    isSystem: true,
    // Super admin has MANAGE permission for all resources
    permissions: Object.keys(RESOURCES).map(resource => ({
      resource,
      action: 'MANAGE' as PermissionAction,
      scope: 'ALL' as PermissionScope,
    })),
  },
  admin: {
    displayName: 'Quản trị viên',
    description: 'Quản lý hầu hết các chức năng, trừ phân quyền',
    isSystem: true,
    permissions: [
      // Products - full access
      { resource: 'products', action: 'MANAGE' },
      { resource: 'categories', action: 'MANAGE' },
      { resource: 'inventory', action: 'MANAGE' },
      // Orders - full access
      { resource: 'orders', action: 'MANAGE' },
      { resource: 'fulfillments', action: 'MANAGE' },
      { resource: 'payments', action: 'MANAGE' },
      // Users - read only (can't create/delete users)
      { resource: 'users', action: 'READ' },
      { resource: 'customer_groups', action: 'MANAGE' },
      // No role management
      // Pricing & Promotions - full access
      { resource: 'price_lists', action: 'MANAGE' },
      { resource: 'promotions', action: 'MANAGE' },
      // Blog - full access
      { resource: 'blog_posts', action: 'MANAGE' },
      { resource: 'blog_categories', action: 'MANAGE' },
      // Reviews - full access
      { resource: 'reviews', action: 'MANAGE' },
      { resource: 'product_qa', action: 'MANAGE' },
      // Settings - read only
      { resource: 'settings', action: 'READ' },
      { resource: 'media', action: 'MANAGE' },
      // Analytics - full access
      { resource: 'analytics', action: 'MANAGE' },
      // Chat
      { resource: 'chat', action: 'READ' },
    ],
  },
  product_manager: {
    displayName: 'Quản lý sản phẩm',
    description: 'Quản lý sản phẩm, danh mục, tồn kho',
    isSystem: true,
    permissions: [
      { resource: 'products', action: 'MANAGE' },
      { resource: 'categories', action: 'MANAGE' },
      { resource: 'inventory', action: 'MANAGE' },
      { resource: 'media', action: 'MANAGE' },
      { resource: 'reviews', action: 'READ' },
      { resource: 'product_qa', action: 'MANAGE' },
    ],
  },
  order_manager: {
    displayName: 'Quản lý đơn hàng',
    description: 'Xử lý đơn hàng, vận chuyển, thanh toán',
    isSystem: true,
    permissions: [
      { resource: 'orders', action: 'MANAGE' },
      { resource: 'fulfillments', action: 'MANAGE' },
      { resource: 'payments', action: 'MANAGE' },
      { resource: 'products', action: 'READ' },
      { resource: 'users', action: 'READ' },
    ],
  },
  content_writer: {
    displayName: 'Biên tập viên',
    description: 'Viết và quản lý bài blog',
    isSystem: true,
    permissions: [
      { resource: 'blog_posts', action: 'CREATE' },
      { resource: 'blog_posts', action: 'READ', scope: 'OWN' },
      { resource: 'blog_posts', action: 'UPDATE', scope: 'OWN' },
      { resource: 'blog_posts', action: 'DELETE', scope: 'OWN' },
      { resource: 'blog_categories', action: 'READ' },
      { resource: 'media', action: 'CREATE' },
      { resource: 'media', action: 'READ' },
    ],
  },
  support: {
    displayName: 'Hỗ trợ khách hàng',
    description: 'Xem đơn hàng, trả lời hỏi đáp, xem chat',
    isSystem: true,
    permissions: [
      { resource: 'orders', action: 'READ' },
      { resource: 'users', action: 'READ' },
      { resource: 'products', action: 'READ' },
      { resource: 'reviews', action: 'READ' },
      { resource: 'product_qa', action: 'CREATE' }, // Can answer questions
      { resource: 'product_qa', action: 'READ' },
      { resource: 'chat', action: 'READ' },
    ],
  },
  customer: {
    displayName: 'Khách hàng',
    description: 'Quyền mặc định cho khách hàng đăng ký',
    isSystem: true,
    isDefault: true,
    permissions: [
      // Customers have no admin permissions
      // Their permissions are handled at API level
    ],
  },
}

async function seedPermissions() {
  console.log('Seeding permissions...')

  // Create all permissions
  const permissionData: any[] = []

  for (const [resource, config] of Object.entries(RESOURCES)) {
    for (const perm of config.permissions) {
      const scopes = (perm as any).scopes || ['ALL']

      for (const scope of scopes) {
        permissionData.push({
          resource,
          action: perm.action as PermissionAction,
          scope: scope as PermissionScope,
          name: scope === 'OWN' ? `${perm.name} (của mình)` : perm.name,
          group: config.group,
          isSystem: true,
        })
      }
    }
  }

  // Upsert permissions
  for (const perm of permissionData) {
    await prisma.permission.upsert({
      where: {
        resource_action_scope: {
          resource: perm.resource,
          action: perm.action,
          scope: perm.scope,
        },
      },
      update: {
        name: perm.name,
        group: perm.group,
      },
      create: perm,
    })
  }

  console.log(`Created ${permissionData.length} permissions`)

  // Create roles and assign permissions
  for (const [roleName, roleConfig] of Object.entries(DEFAULT_ROLES)) {
    // Create or update role
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {
        displayName: roleConfig.displayName,
        description: roleConfig.description,
      },
      create: {
        name: roleName,
        displayName: roleConfig.displayName,
        description: roleConfig.description,
        isSystem: roleConfig.isSystem,
        isDefault: (roleConfig as any).isDefault || false,
      },
    })

    // Clear existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    })

    // Assign permissions to role
    for (const perm of roleConfig.permissions) {
      const permission = await prisma.permission.findFirst({
        where: {
          resource: perm.resource,
          action: perm.action as PermissionAction,
          scope: ((perm as { scope?: PermissionScope }).scope || 'ALL') as PermissionScope,
        },
      })

      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
            scope: (perm as { scope?: PermissionScope }).scope,
          },
        })
      }
    }

    console.log(`Created role: ${roleName} with ${roleConfig.permissions.length} permissions`)
  }

  console.log('Permission seeding completed!')
}

// Export for use in main seed file
export { seedPermissions, RESOURCES, DEFAULT_ROLES }

// Run if executed directly
seedPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
