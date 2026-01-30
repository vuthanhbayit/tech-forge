# Architecture

Kiến trúc dựa trên MedusaJS, đơn giản hóa cho quy mô nhỏ (<1000 sản phẩm), chỉ hỗ trợ 1 ngôn ngữ (Tiếng Việt).

## Product System (MedusaJS style)

```
Product → ProductOption → ProductOptionValue
                ↓
         ProductVariant (kết hợp các option values)
```

**Ví dụ:**
- Product: iPhone 15
- ProductOption: Màu sắc, Dung lượng
- ProductOptionValue: Đen, Trắng, 128GB, 256GB
- ProductVariant: iPhone 15 Đen 128GB, iPhone 15 Trắng 256GB, ...

## BOM (Bill of Materials)

PC builds sử dụng BOM system - khi bán PC sẽ tự động trừ tồn kho của các components.

**Flow:**
1. Tạo Product "PC Gaming X1"
2. Thêm BOM items: CPU, RAM, SSD, VGA, Case, PSU
3. Khi bán 1 PC → tự động trừ tồn kho của tất cả components

## Pricing

- **Base price**: Giá gốc trên mỗi variant
- **Price Lists**: Override giá theo thời gian (flash sale, seasonal)
- **Promotions**: Mã giảm giá, Buy X Get Y (KHÔNG theo nhóm khách hàng)
- **Customer Groups**: Chỉ dùng cho marketing/email, không ảnh hưởng giá

## Permission System

RBAC với phân quyền chi tiết:

- **Resource**: Module/tính năng (products, orders, users, ...)
- **Action**: CREATE, READ, UPDATE, DELETE, MANAGE (full access)
- **Scope**: OWN (chỉ record của mình), ALL (tất cả records)

**Default roles:**
| Role | Mô tả |
|------|-------|
| super_admin | Toàn quyền |
| admin | Quản lý hầu hết, trừ phân quyền |
| product_manager | Quản lý sản phẩm, danh mục, tồn kho |
| order_manager | Xử lý đơn hàng, vận chuyển, thanh toán |
| content_writer | Viết và quản lý blog |
| support | Hỗ trợ khách hàng |
| customer | Quyền mặc định cho khách |

Chi tiết: `docs/PERMISSION_SYSTEM.md`

## Authentication

- **Session-based**: Không dùng JWT, dùng session cookie
- **Password hashing**: scrypt algorithm
- **Middleware**: `auth`, `admin`, `guest`

## Database Modules

| # | Module | Models |
|---|--------|--------|
| 1 | User & Auth | User, Role, Permission, Session, Address |
| 2 | Product | Category, Product, ProductOption, ProductOptionValue, ProductVariant |
| 3 | BOM | BOMItem (cho PC builds) |
| 4 | Pricing | PriceList, PriceListItem |
| 5 | Promotion | Promotion, PromotionRule, BuyXGetYPromotion |
| 6 | Cart | Cart, CartItem |
| 7 | Order | Order, OrderItem |
| 8 | Payment | Payment (VietQR, COD) |
| 9 | Fulfillment | Fulfillment, FulfillmentItem |
| 10 | Review & Q&A | Review, ProductQuestion, ProductAnswer |
| 11 | Blog | BlogPost, BlogCategory |
| 12 | Chat | ChatSession, ChatMessage |
| 13 | Settings & Media | Setting, Media |

Chi tiết: `docs/DATABASE_SCHEMA.md`
