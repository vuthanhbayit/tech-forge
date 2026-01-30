# TechForge Permission System

## Tổng quan

Hệ thống phân quyền của TechForge dựa trên mô hình **RBAC (Role-Based Access Control)** với khả năng phân quyền chi tiết đến từng tính năng.

## Cấu trúc

```
User → Role → RolePermission → Permission
```

### Models

| Model            | Mô tả                                            |
| ---------------- | ------------------------------------------------ |
| `Role`           | Vai trò (Super Admin, Admin, Product Manager...) |
| `Permission`     | Quyền cụ thể (Tạo sản phẩm, Xem đơn hàng...)     |
| `RolePermission` | Liên kết vai trò với quyền                       |

## Permission Structure

Mỗi Permission được định nghĩa bởi 3 thành phần:

### 1. Resource (Tài nguyên)

Các module/tính năng trong hệ thống:

| Resource          | Mô tả                |
| ----------------- | -------------------- |
| `products`        | Sản phẩm             |
| `categories`      | Danh mục sản phẩm    |
| `inventory`       | Tồn kho              |
| `orders`          | Đơn hàng             |
| `fulfillments`    | Vận chuyển           |
| `payments`        | Thanh toán           |
| `users`           | Người dùng           |
| `roles`           | Vai trò & Phân quyền |
| `customer_groups` | Nhóm khách hàng      |
| `price_lists`     | Bảng giá             |
| `promotions`      | Khuyến mãi           |
| `blog_posts`      | Bài viết blog        |
| `blog_categories` | Danh mục blog        |
| `reviews`         | Đánh giá             |
| `product_qa`      | Hỏi đáp sản phẩm     |
| `settings`        | Cài đặt hệ thống     |
| `media`           | Quản lý file         |
| `analytics`       | Thống kê báo cáo     |
| `chat`            | AI Chatbot           |

### 2. Action (Hành động)

| Action   | Mô tả                               |
| -------- | ----------------------------------- |
| `CREATE` | Tạo mới                             |
| `READ`   | Xem/Đọc                             |
| `UPDATE` | Cập nhật/Sửa                        |
| `DELETE` | Xóa                                 |
| `MANAGE` | Toàn quyền (bao gồm tất cả actions) |

### 3. Scope (Phạm vi)

| Scope | Mô tả                                                        |
| ----- | ------------------------------------------------------------ |
| `OWN` | Chỉ record của mình (VD: Biên tập viên chỉ sửa bài của mình) |
| `ALL` | Tất cả records                                               |

## Default Roles

### 1. Super Admin

- **Mô tả**: Toàn quyền quản trị hệ thống
- **Permissions**: `MANAGE` cho tất cả resources
- **Lưu ý**: Vai trò hệ thống, không thể xóa

### 2. Admin (Quản trị viên)

- **Mô tả**: Quản lý hầu hết chức năng, trừ phân quyền
- **Permissions**:
  - ✅ Quản lý sản phẩm, đơn hàng, khuyến mãi, blog
  - ✅ Xem người dùng (không tạo/xóa)
  - ❌ Không quản lý vai trò/phân quyền
  - ❌ Không sửa cài đặt hệ thống

### 3. Product Manager (Quản lý sản phẩm)

- **Mô tả**: Quản lý sản phẩm, danh mục, tồn kho
- **Permissions**:
  - ✅ CRUD sản phẩm, danh mục
  - ✅ Quản lý tồn kho
  - ✅ Trả lời hỏi đáp sản phẩm
  - ❌ Không xem/xử lý đơn hàng

### 4. Order Manager (Quản lý đơn hàng)

- **Mô tả**: Xử lý đơn hàng, vận chuyển, thanh toán
- **Permissions**:
  - ✅ CRUD đơn hàng, vận chuyển, thanh toán
  - ✅ Xem sản phẩm, người dùng
  - ❌ Không sửa sản phẩm

### 5. Content Writer (Biên tập viên)

- **Mô tả**: Viết và quản lý bài blog
- **Permissions**:
  - ✅ Tạo bài viết
  - ✅ Sửa/Xóa bài **của mình** (Scope: OWN)
  - ✅ Upload hình ảnh
  - ❌ Không sửa bài của người khác

### 6. Support (Hỗ trợ khách hàng)

- **Mô tả**: Hỗ trợ khách hàng
- **Permissions**:
  - ✅ Xem đơn hàng, sản phẩm, người dùng
  - ✅ Trả lời hỏi đáp
  - ✅ Xem lịch sử chat
  - ❌ Không sửa/xóa đơn hàng

### 7. Customer (Khách hàng)

- **Mô tả**: Quyền mặc định cho khách hàng đăng ký
- **Permissions**: Không có quyền admin
- **Lưu ý**: Quyền của customer được xử lý ở API level

## Ví dụ sử dụng

### Check permission trong code

```typescript
// Composable: usePermission.ts
export function usePermission() {
  const user = useAuthUser()

  function hasPermission(resource: string, action: string, scope?: string): boolean {
    if (!user.value?.role?.permissions) return false

    return user.value.role.permissions.some(rp => {
      const p = rp.permission
      // MANAGE includes all actions
      if (p.resource === resource && p.action === 'MANAGE') return true
      // Check specific action
      if (p.resource === resource && p.action === action) {
        // Check scope
        if (scope === 'OWN' && (rp.scope || p.scope) !== 'OWN') return false
        return true
      }
      return false
    })
  }

  function can(permission: string): boolean {
    const [resource, action] = permission.split(':')
    return hasPermission(resource, action)
  }

  return { hasPermission, can }
}

// Usage
const { can, hasPermission } = usePermission()

if (can('products:create')) {
  // Show create button
}

if (hasPermission('blog_posts', 'UPDATE', 'OWN')) {
  // Can only update own posts
}
```

### API Middleware

```typescript
// server/middleware/permission.ts
export default defineEventHandler(async event => {
  const user = event.context.user
  const permission = event.context.requiredPermission

  if (!permission) return

  const [resource, action] = permission.split(':')

  if (!userHasPermission(user, resource, action)) {
    throw createError({
      statusCode: 403,
      message: 'Bạn không có quyền thực hiện thao tác này',
    })
  }
})
```

### Admin UI với conditions

```vue
<template>
  <div>
    <!-- Chỉ hiển thị nếu có quyền CREATE products -->
    <Button v-if="can('products:create')" @click="createProduct">Tạo sản phẩm</Button>

    <!-- Chỉ hiển thị delete nếu có quyền DELETE -->
    <Button v-if="can('products:delete')" variant="destructive" @click="deleteProduct">Xóa</Button>
  </div>
</template>
```

## Tạo Role mới

Trong Admin Dashboard, Super Admin có thể:

1. Tạo vai trò mới
2. Chọn các permissions cho vai trò
3. Gán vai trò cho người dùng

Ví dụ tạo vai trò "Marketing":

- ✅ `promotions:MANAGE` - Quản lý khuyến mãi
- ✅ `customer_groups:MANAGE` - Quản lý nhóm KH
- ✅ `analytics:READ` - Xem thống kê
- ✅ `blog_posts:CREATE` - Tạo bài blog
- ✅ `blog_posts:UPDATE:OWN` - Sửa bài của mình

## Database Queries

### Lấy permissions của user

```sql
SELECT
  p.resource,
  p.action,
  COALESCE(rp.scope, p.scope) as scope,
  rp.conditions
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.id = 'user_id';
```

### Lấy users có quyền cụ thể

```sql
SELECT DISTINCT u.*
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource = 'orders'
  AND p.action IN ('MANAGE', 'UPDATE');
```

## Security Notes

1. **Super Admin bảo vệ**: Không thể xóa vai trò Super Admin
2. **Cascade delete**: Khi xóa Role, tất cả RolePermission cũng bị xóa
3. **Scope enforcement**: Phải check scope ở cả frontend và backend
4. **Conditions**: Có thể thêm conditions JSON cho các rule phức tạp
5. **Audit log**: Nên log lại các thay đổi về phân quyền

## Migration từ hệ thống cũ

Nếu bạn có hệ thống phân quyền cũ dạng `permissions: Json` trong Role, có thể migrate:

```typescript
async function migratePermissions() {
  const roles = await prisma.role.findMany()

  for (const role of roles) {
    const oldPermissions = role.permissions as string[]

    for (const perm of oldPermissions) {
      const [resource, action] = perm.split(':')
      // Create permission if not exists
      // Create role_permission link
    }
  }
}
```
