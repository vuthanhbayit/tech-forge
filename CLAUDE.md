# TechForge - Ecommerce Website

Website ecommerce bán máy tính, phụ kiện và tư vấn công nghệ cho thị trường Việt Nam.

## Tech Stack

| Component | Technology                             |
| --------- | -------------------------------------- |
| Framework | Nuxt 4.3 với Nitro Server              |
| UI        | @nuxt/ui 4.4 (bao gồm Tailwind CSS v4) |
| Database  | PostgreSQL 16 + Prisma ORM 7.3         |
| Language  | TypeScript 5.9                         |
| Linting   | ESLint 9 + @nuxt/eslint + vue-tsc      |

## Scripts

```bash
pnpm dev          # Chạy dev server
pnpm build        # Build production
pnpm typecheck    # Kiểm tra TypeScript
pnpm lint         # Kiểm tra ESLint
pnpm lint:fix     # Sửa lỗi ESLint
pnpm format       # Format code với Prettier
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed roles & permissions
pnpm db:seed:admin # Seed super admin user
```

## Database Setup

```bash
docker compose up -d     # Start PostgreSQL
pnpm db:push             # Push schema
pnpm db:seed             # Seed permissions
pnpm db:seed:admin       # Seed admin user
```

Connection: `postgresql://techforge:techforge123@127.0.0.1:5433/techforge`

## Documentation

- `docs/ARCHITECTURE.md` - Kiến trúc hệ thống
- `docs/PROJECT_STRUCTURE.md` - Cấu trúc project
- `docs/API_ENDPOINTS.md` - API reference
- `docs/DATABASE_SCHEMA.md` - Database schema
- `docs/PERMISSION_SYSTEM.md` - Hệ thống phân quyền

---

## Conventions (QUAN TRỌNG)

### Code Style

- Prettier với semi: false, singleQuote: true
- Vue file order: `<template>` → `<script>` → `<style>`

### Naming

| Type            | Convention   | Ví dụ              |
| --------------- | ------------ | ------------------ |
| Database tables | snake_case   | `user_roles`       |
| Prisma models   | PascalCase   | `UserRole`         |
| API routes      | kebab-case   | `/api/admin/users` |
| Components      | PascalCase   | `UserTable.vue`    |
| Composables     | useCamelCase | `useAuth`          |

### ID Format

ID của mỗi bảng phải có prefix:

| Bảng       | Prefix   | Ví dụ          |
| ---------- | -------- | -------------- |
| User       | `user_`  | `user_abc123`  |
| Role       | `role_`  | `role_abc123`  |
| Permission | `perm_`  | `perm_abc123`  |
| Category   | `cat_`   | `cat_abc123`   |
| Product    | `prod_`  | `prod_abc123`  |
| Order      | `order_` | `order_abc123` |
| Session    | `sess_`  | `sess_abc123`  |

```ts
// Sử dụng (auto-import trong server/)
const user = await prisma.user.create({
  data: {
    id: generateId('user'),
    email: '...',
  },
})
```

### Currency

- VND (Vietnamese Dong)
- Decimal(15, 0) - không cần số thập phân

---

## Current Progress

### Completed

- [x] Auth module (login, register, logout, session)
- [x] Categories API + Admin UI
- [x] Roles API + Admin UI
- [x] Permissions API
- [x] Settings API + Admin UI
- [x] Users API + Admin UI
- [x] Shared Types system
- [x] VueUse integration

### Next Steps

- [ ] Product module (API + UI)
- [ ] Cart module
- [ ] Order module
- [ ] Payment (VietQR, COD)

---

## Key Decisions

1. **MedusaJS-inspired but simplified**: Đơn giản cho quy mô nhỏ
2. **Single language**: Chỉ Tiếng Việt, không i18n
3. **BOM for PC builds**: Tự động trừ tồn kho components
4. **Session-based auth**: Không dùng JWT
5. **Nuxt UI over shadcn**: Sử dụng @nuxt/ui chính thức

---

## DRY Principle (BẮT BUỘC)

**LUÔN tuân thủ DRY (Don't Repeat Yourself):**

1. **Shared utilities** → `shared/utils/`
   - Logic dùng chung giữa server và client
   - Ví dụ: `generateId()` trong `shared/utils/id.ts`

2. **Shared types** → `shared/types/`
   - Types dùng chung, không define inline

3. **Server utils** → `server/utils/`
   - Re-export từ shared hoặc logic chỉ dùng trong server
   - Được auto-import trong API routes

4. **Trước khi viết code mới:**
   - Kiểm tra xem đã có utility/function tương tự chưa
   - Kiểm tra `@vt7/utils` trước khi viết utility functions
   - Kiểm tra `shared/` trước khi tạo code mới

5. **Khi thấy code lặp lại:**
   - Extract thành function/component riêng
   - Đặt vào đúng vị trí (shared/ hoặc server/utils/)

---

## Development Rules (QUAN TRỌNG)

### Shared Types

**LUÔN sử dụng types từ `#shared/types`:**

```ts
import type { User, Category, Role } from '#shared/types'
```

| Type           | Mô tả                       |
| -------------- | --------------------------- |
| `Entity`       | List view (User, Category)  |
| `EntityDetail` | Detail view (UserDetail)    |
| `EntityOption` | Select options (RoleOption) |
| `EntityInput`  | Create/update input         |

### @vt7/utils

**LUÔN sử dụng thay vì viết lại:**

```ts
import { removeVietnameseTones, toKebabCase, cloneDeep } from '@vt7/utils'
```

### Nuxt UI v4

**LUÔN tra cứu MCP tools trước khi dùng component:**

```
mcp__nuxt-ui__list-components
mcp__nuxt-ui__get-component(componentName: "Table")
```

Nuxt UI v4 API khác hoàn toàn so với v2/v3.

### Other Rules

- Chạy `pnpm lint && pnpm format && pnpm typecheck` trước khi commit
- Không đặt tên function trùng h3 built-in (dùng `getSessionUser` thay vì `getSession`)
- Server utils (`server/utils/`) được auto-import
