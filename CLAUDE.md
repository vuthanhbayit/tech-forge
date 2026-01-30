# TechForge - Ecommerce Website

## Project Overview

Website ecommerce bán máy tính, phụ kiện và tư vấn công nghệ cho thị trường Việt Nam.

## Tech Stack

| Component  | Technology                             |
| ---------- | -------------------------------------- |
| Framework  | Nuxt 4.3 với Nitro Server              |
| UI         | @nuxt/ui 4.4 (bao gồm Tailwind CSS v4) |
| Database   | PostgreSQL 16 + Prisma ORM 7.3         |
| Payment    | VietQR (chuyển khoản QR), COD          |
| AI Chatbot | OpenAI GPT (để sau)                    |
| Hosting    | Vercel                                 |
| Language   | TypeScript 5.9                         |
| Linting    | ESLint 9 + @nuxt/eslint + vue-tsc      |
| Formatting | Prettier 3.8                           |

## Scripts

```bash
pnpm dev          # Chạy dev server
pnpm build        # Build production
pnpm typecheck    # Kiểm tra TypeScript (vue-tsc + tsc)
pnpm lint         # Kiểm tra ESLint
pnpm lint:fix     # Sửa lỗi ESLint
pnpm format       # Format code với Prettier
pnpm format:check # Kiểm tra format
pnpm db:generate  # Generate Prisma Client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Mở Prisma Studio
pnpm db:seed      # Seed roles & permissions
```

## Database Setup

PostgreSQL chạy qua Docker (port 5433 để tránh xung đột với local PostgreSQL):

```bash
docker compose up -d     # Start PostgreSQL
pnpm db:push             # Push schema
pnpm db:seed             # Seed permissions
```

Connection string: `postgresql://techforge:techforge123@127.0.0.1:5433/techforge`

## Architecture

Kiến trúc dựa trên MedusaJS, đơn giản hóa cho quy mô nhỏ (<1000 sản phẩm), chỉ hỗ trợ 1 ngôn ngữ (Tiếng Việt).

### Product System (MedusaJS style)

```
Product → ProductOption → ProductOptionValue
                ↓
         ProductVariant (kết hợp các option values)
```

### BOM (Bill of Materials)

PC builds sử dụng BOM system - khi bán PC sẽ tự động trừ tồn kho của các components.

### Pricing

- Base price trên mỗi variant
- Price Lists: Override giá theo thời gian (flash sale, seasonal)
- Promotions: Mã giảm giá, Buy X Get Y (KHÔNG theo nhóm khách hàng)
- Customer Groups: Chỉ dùng cho marketing/email, không ảnh hưởng giá

### Permission System

RBAC với phân quyền chi tiết:

- Resource + Action (CREATE/READ/UPDATE/DELETE/MANAGE) + Scope (OWN/ALL)
- Mỗi tính năng trên Admin Dashboard đều có thể phân quyền
- Default roles: super_admin, admin, product_manager, order_manager, content_writer, support, customer

### Authentication

- Session-based authentication với cookie
- Password hashing với scrypt
- Middleware: `auth`, `admin`, `guest`

## Database

Schema file: `prisma/schema.prisma`

### Main Modules

1. User & Auth (User, Role, Permission, Session, Address)
2. Product (Category, Product, ProductOption, ProductOptionValue, ProductVariant)
3. BOM (BOMItem - cho PC builds)
4. Pricing (PriceList, PriceListItem)
5. Promotion (Promotion, PromotionRule, BuyXGetYPromotion)
6. Cart (Cart, CartItem)
7. Order (Order, OrderItem)
8. Payment (Payment - VietQR, COD)
9. Fulfillment
10. Review & Q&A
11. Blog
12. Chat (ChatSession, ChatMessage)
13. Settings & Media

## Project Structure

```
tech-forge/
├── app/
│   ├── assets/css/main.css      # Tailwind + Nuxt UI imports
│   ├── composables/
│   │   └── useAuth.ts           # Auth composable
│   ├── layouts/
│   │   ├── default.vue          # Store layout
│   │   └── admin.vue            # Admin dashboard layout
│   ├── middleware/
│   │   ├── auth.ts              # Require login
│   │   ├── admin.ts             # Require admin role
│   │   └── guest.ts             # Only for guests
│   ├── pages/
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   └── admin/
│   │       ├── index.vue        # Dashboard
│   │       ├── roles/
│   │       │   ├── index.vue    # Roles list
│   │       │   └── [id].vue     # Role edit/create
│   │       └── settings/
│   │           └── index.vue    # Settings management
│   └── app.vue
├── server/
│   ├── api/
│   │   ├── auth/                # Auth endpoints
│   │   ├── settings/            # Public settings
│   │   └── admin/
│   │       ├── categories/      # Categories CRUD
│   │       ├── roles/           # Roles CRUD
│   │       ├── permissions/     # Permissions list
│   │       └── settings/        # Settings CRUD
│   └── utils/
│       ├── prisma.ts            # Prisma client singleton
│       ├── password.ts          # Password hashing
│       ├── session.ts           # Session management
│       └── slug.ts              # Slug generation (uses @vt7/utils)
├── prisma/
│   ├── schema.prisma
│   ├── prisma.config.ts         # Prisma 7 config
│   ├── seed-permissions.ts      # Seed roles & permissions
│   ├── seed-admin.ts            # Seed super admin user
│   └── tsconfig.json            # TypeScript config for prisma/
├── docs/
├── nuxt.config.ts
├── eslint.config.mjs
├── .prettierrc
├── docker-compose.yml
└── package.json
```

## Conventions

### Code Style (Prettier)

```json
{
  "htmlWhitespaceSensitivity": "ignore",
  "semi": false,
  "arrowParens": "avoid",
  "singleQuote": true,
  "endOfLine": "auto",
  "tabWidth": 2,
  "printWidth": 120
}
```

### Vue File Structure

Thứ tự các block trong file `.vue`:

```vue
<template>
  <!-- HTML template -->
</template>

<script setup lang="ts">
// Logic
</script>

<style scoped>
/* Styles */
</style>
```

### Naming

- Database tables: snake_case (via @map)
- Prisma models: PascalCase
- API routes: kebab-case
- Components: PascalCase
- Composables: useCamelCase

### Currency

- VND (Vietnamese Dong)
- Decimal(15, 0) - không cần số thập phân

### Address Format (Vietnam)

- addressLine, ward (Phường/Xã), district (Quận/Huyện), province (Tỉnh/TP)

## Current Progress

### Completed

- [x] Requirements gathering
- [x] Architecture design
- [x] Database schema (Prisma)
- [x] Permission system design
- [x] Documentation
- [x] Initialize Nuxt 4 project
- [x] Setup @nuxt/ui + Tailwind CSS v4
- [x] Setup ESLint + Prettier + vue-tsc
- [x] Setup PostgreSQL (Docker) + Prisma 7
- [x] Create layouts (default, admin)
- [x] Implement Auth module (login, register, logout, session)
- [x] Seed roles & permissions
- [x] Tạo super_admin user (admin@techforge.vn / Admin@123)
- [x] Categories API (CRUD)
- [x] Roles API (CRUD + permission assignment)
- [x] Permissions API (list grouped)
- [x] Settings API (CRUD + public endpoint)
- [x] Admin UI: Roles management (list, create, edit, delete, permissions)
- [x] Admin UI: Settings management (CRUD với JSON support)
- [x] Admin UI: Categories management (list, create, edit, delete, hierarchical structure)

### Next Steps
- [ ] Implement Product module (API + UI)
- [ ] Implement Users management (admin)
- [ ] Implement Cart module
- [ ] Implement Order module
- [ ] Implement Payment (VietQR, COD)
- [ ] ... (continue with other modules)

## Key Decisions

1. **MedusaJS-inspired but simplified**: Không cần full complexity của MedusaJS
2. **Single language**: Chỉ Tiếng Việt, không i18n
3. **Single warehouse**: Không multi-location inventory
4. **No customer group pricing**: Customer groups chỉ cho marketing
5. **BOM for PC builds**: Quan trọng - tự động trừ tồn kho components
6. **Permission per feature**: Mọi tính năng admin đều phân quyền được
7. **Nuxt UI over shadcn**: Sử dụng @nuxt/ui chính thức thay vì shadcn-vue
8. **Prisma 7 with adapter**: Sử dụng @prisma/adapter-pg cho PostgreSQL
9. **Session-based auth**: Không dùng JWT, dùng session cookie

## API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Thông tin user hiện tại |

### Admin - Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/categories` | Danh sách categories |
| GET | `/api/admin/categories/:id` | Chi tiết category |
| POST | `/api/admin/categories` | Tạo category |
| PUT | `/api/admin/categories/:id` | Cập nhật category |
| DELETE | `/api/admin/categories/:id` | Xóa category |

### Admin - Roles
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/roles` | Danh sách roles |
| GET | `/api/admin/roles/:id` | Chi tiết role + permissions |
| POST | `/api/admin/roles` | Tạo role |
| PUT | `/api/admin/roles/:id` | Cập nhật role + permissions |
| DELETE | `/api/admin/roles/:id` | Xóa role |

### Admin - Permissions
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/permissions` | Danh sách permissions (grouped) |

### Admin - Settings
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/settings` | Danh sách settings |
| GET | `/api/admin/settings/:key` | Chi tiết setting |
| PUT | `/api/admin/settings/:key` | Upsert setting |
| POST | `/api/admin/settings` | Bulk upsert settings |
| DELETE | `/api/admin/settings/:key` | Xóa setting |

### Public
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/settings` | Public settings (no auth) |

## Important Files

### Configuration
- `nuxt.config.ts` - Nuxt configuration
- `prisma/schema.prisma` - Database schema
- `prisma/prisma.config.ts` - Prisma 7 configuration
- `eslint.config.mjs` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `docker-compose.yml` - PostgreSQL Docker setup

### Server Utils
- `server/utils/prisma.ts` - Prisma client singleton
- `server/utils/session.ts` - Session management (`getSessionUser`)
- `server/utils/password.ts` - Password hashing (scrypt)
- `server/utils/slug.ts` - Slug generation (Vietnamese support)

### App
- `app/composables/useAuth.ts` - Auth composable
- `app/layouts/admin.vue` - Admin dashboard layout
- `app/assets/css/main.css` - Global CSS với Tailwind

### Prisma
- `prisma/seed-permissions.ts` - Seed 84 permissions, 7 roles
- `prisma/seed-admin.ts` - Seed super admin user

### Documentation
- `docs/DATABASE_SCHEMA.md` - Database documentation
- `docs/PERMISSION_SYSTEM.md` - Permission system guide

## Notes for Development

- Khi phát triển từng tính năng, cần hỏi lại user để làm rõ chi tiết
- Luôn tuân theo patterns đã định nghĩa trong schema
- AI/RAG features sẽ thêm sau, không cần implement ngay
- Sử dụng Nuxt UI components thay vì tự build UI từ đầu
- Chạy `pnpm lint && pnpm format && pnpm typecheck` trước khi commit
- Server utils (`server/utils/`) được auto-import trong API routes
- **QUAN TRỌNG**: Không đặt tên function trùng với h3 built-in (getSession, getCookie, etc.)
  - Dùng `getSessionUser` thay vì `getSession` để tránh xung đột với h3

### Admin Page Template

```vue
<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar title="Page Title">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <!-- Content here -->
    </div>
  </div>
</template>
```

**Lưu ý scroll**: Cần `h-full min-h-0` ở root và `min-h-0 flex-1 overflow-y-auto` ở content area

## @vt7/utils - QUAN TRỌNG

**LUÔN sử dụng @vt7/utils cho các utility functions thay vì viết lại:**

```ts
import { removeVietnameseTones, toKebabCase, cloneDeep, ... } from '@vt7/utils'
```

Các functions thường dùng:
- `removeVietnameseTones(str)` - Bỏ dấu tiếng Việt
- `toKebabCase(str)` - Chuyển thành kebab-case (dùng cho slug)
- `cloneDeep(obj)` - Deep clone object
- `omit(obj, ...keys)` - Loại bỏ keys từ object
- `pick(obj, ...keys)` - Chọn keys từ object
- `isEmpty(v)` - Kiểm tra empty
- `formatCurrency(num)` - Format tiền tệ

Xem đầy đủ tại: `node_modules/@vt7/utils/CLAUDE.md`

## Nuxt UI v4 - QUAN TRỌNG

**LUÔN sử dụng MCP tools để tra cứu documentation trước khi dùng bất kỳ component nào của @nuxt/ui:**

```
# Liệt kê tất cả components
mcp__nuxt-ui__list-components

# Xem chi tiết component (thay ComponentName bằng tên thực tế)
mcp__nuxt-ui__get-component(componentName: "Table", sections: ["usage", "api"])
```

### Lý do:
- Nuxt UI v4 có API khác hoàn toàn so với v2/v3
- Nhiều component đã đổi tên hoặc cấu trúc props
- Không đoán mò component name hoặc props

### Ví dụ thay đổi quan trọng:
| Cũ (v2/v3) | Mới (v4) |
|------------|----------|
| `UDashboardLayout` | `UDashboardGroup` |
| `UDashboardSidebarLinks` | `UNavigationMenu` với `orientation="vertical"` |
| `UDashboardMain` | `UDashboardPanel` |
| `UTable :columns="[{key, label}]" :rows="[]"` | `UTable :columns="[{accessorKey, header}]" :data="[]"` |
