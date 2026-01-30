# TechForge Database Schema Documentation

## Overview

Database schema được thiết kế dựa trên kiến trúc MedusaJS, tối ưu cho website ecommerce bán máy tính và phụ kiện.

## Modules

### 1. User & Authentication Module

```
User
├── Role (1:N) - Phân quyền
├── Session (1:N) - Phiên đăng nhập
├── Address (1:N) - Địa chỉ giao hàng
└── CustomerGroup (N:N) - Nhóm KH (chỉ marketing)
```

**Roles mặc định:**

- `super_admin`: Toàn quyền
- `admin`: Quản lý chung
- `product_manager`: Quản lý sản phẩm
- `support`: Hỗ trợ khách hàng
- `customer`: Khách hàng

---

### 2. Product Module

```
Category
└── Product
    ├── ProductOption (1:N)
    │   └── ProductOptionValue (1:N)
    ├── ProductVariant (1:N)
    │   ├── VariantOptionValue (N:N với OptionValue)
    │   ├── specs (JSON)
    │   └── BOMItem (cho PC builds)
    ├── ProductImage (1:N)
    └── ProductTag (1:N)
```

**Cách hoạt động Options/Variants (theo MedusaJS):**

1. **Product**: Sản phẩm chính (VD: "Laptop Dell XPS 15")
2. **ProductOption**: Các tùy chọn (VD: "RAM", "Storage")
3. **ProductOptionValue**: Giá trị của tùy chọn (VD: "8GB", "16GB")
4. **ProductVariant**: Kết hợp các option values tạo thành variant

**Ví dụ:**

```
Product: Laptop Dell XPS 15
├── Option: RAM
│   ├── Value: 8GB
│   └── Value: 16GB
├── Option: Storage
│   ├── Value: 256GB SSD
│   └── Value: 512GB SSD
└── Variants:
    ├── Variant 1: 8GB + 256GB SSD (price: 25,000,000đ)
    ├── Variant 2: 8GB + 512GB SSD (price: 27,000,000đ)
    ├── Variant 3: 16GB + 256GB SSD (price: 28,000,000đ)
    └── Variant 4: 16GB + 512GB SSD (price: 30,000,000đ)
```

**Specs (JSON):**

```json
{
  "cpu": "Intel Core i7-13700H",
  "ram": "16GB DDR5",
  "storage": "512GB NVMe SSD",
  "display": "15.6 inch 4K OLED",
  "gpu": "NVIDIA RTX 4060",
  "battery": "86Wh",
  "weight": "1.86kg"
}
```

---

### 3. Bill of Materials (BOM) - PC Builds

```
ProductVariant (PC)
└── BOMItem (1:N)
    └── ComponentVariant (ProductVariant)
```

**Cách hoạt động:**

- Một PC variant có thể chứa nhiều component variants
- Khi bán PC, hệ thống tự động trừ tồn kho của tất cả components

**Ví dụ:**

```
PC Gaming Custom Build (parentVariant)
├── BOMItem: Case NZXT H5 Flow (qty: 1)
├── BOMItem: RAM Kingston Fury 16GB x2 (qty: 2)
├── BOMItem: SSD Samsung 990 Pro 1TB (qty: 1)
├── BOMItem: PSU Corsair RM850x (qty: 1)
└── BOMItem: CPU Intel i7-14700K (qty: 1)
```

---

### 4. Pricing Module

```
PriceList
└── PriceListItem (1:N)
    └── ProductVariant (N:1)
```

**Cấu trúc giá:**

1. **Base Price**: `ProductVariant.price` - Giá gốc
2. **Compare At Price**: `ProductVariant.compareAtPrice` - Giá so sánh (hiện giảm giá)
3. **Price List**: Override giá theo thời gian/điều kiện

**Ví dụ Price List:**

```
Flash Sale Tết 2024
├── starts_at: 2024-01-15
├── ends_at: 2024-01-25
└── items:
    ├── Laptop A: 20,000,000đ (gốc 25,000,000đ)
    └── Laptop B: 15,000,000đ (gốc 18,000,000đ)
```

---

### 5. Promotion Module

```
Promotion
├── PromotionRule (1:N) - Điều kiện áp dụng
├── BuyXGetYPromotion (1:1) - Cấu hình Buy X Get Y
└── PromotionUsage (1:N) - Lịch sử sử dụng
```

**Các loại Promotion:**

1. **ORDER_DISCOUNT**: Giảm giá toàn đơn hàng
2. **ITEM_DISCOUNT**: Giảm giá sản phẩm cụ thể
3. **FREE_SHIPPING**: Miễn phí vận chuyển
4. **BUY_X_GET_Y**: Mua X tặng Y

**Ví dụ:**

```
Promotion: SUMMER2024
├── type: ORDER_DISCOUNT
├── discountType: PERCENTAGE
├── discountValue: 10 (10%)
├── maxDiscountAmount: 500,000đ
├── minOrderAmount: 5,000,000đ
└── rules:
    └── category IN ["laptops", "desktops"]
```

---

### 6. Order Module

```
Order
├── OrderItem (1:N)
├── Payment (1:N)
├── Fulfillment (1:N)
└── PromotionUsage (1:N)
```

**Order Flow:**

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → COMPLETED
                                                      ↓
                                               CANCELED/REFUNDED
```

**Payment Flow:**

```
PENDING → AWAITING → PAID
              ↓
           FAILED
```

---

### 7. Payment Module

**Supported Methods:**

- **VIETQR**: Chuyển khoản qua QR code
- **COD**: Ship COD
- **BANK_TRANSFER**: Chuyển khoản thủ công

**VietQR Fields:**

- `bankCode`: Mã ngân hàng
- `accountNumber`: Số tài khoản
- `accountName`: Tên tài khoản
- `qrContent`: Nội dung QR (chuẩn VietQR)

---

### 8. Review & Q&A Module

```
Product
├── Review (1:N)
│   └── User (N:1)
└── ProductQA (1:N)
    ├── Questioner (User)
    └── Answerer (User, optional)
```

---

### 9. Blog Module

```
BlogCategory
└── BlogPost (1:N)
    ├── Author (User)
    └── BlogTag (1:N)
```

---

### 10. Chat Module (AI)

```
ChatSession
├── User (optional - guest support)
└── ChatMessage (1:N)
```

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Category  │────<│   Product   │────<│ProductOption│
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           │              ┌────┴────┐
                           │              │OptionVal│
                           ↓              └────┬────┘
                    ┌──────┴──────┐            │
                    │ProductVariant├────────────┘
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
  ┌─────┴─────┐     ┌──────┴──────┐    ┌─────┴─────┐
  │  BOMItem  │     │PriceListItem│    │ CartItem  │
  └───────────┘     └─────────────┘    └───────────┘
                                             │
                                             ↓
┌─────────────┐     ┌─────────────┐    ┌─────┴─────┐
│    User     │────<│   Address   │    │   Cart    │
└──────┬──────┘     └─────────────┘    └───────────┘
       │
       ├────────────────────────┐
       ↓                        ↓
┌──────┴──────┐          ┌──────┴──────┐
│    Order    │────<─────│  OrderItem  │
└──────┬──────┘          └─────────────┘
       │
       ├────────────────────────┐
       ↓                        ↓
┌──────┴──────┐          ┌──────┴──────┐
│   Payment   │          │ Fulfillment │
└─────────────┘          └─────────────┘
```

---

## Indexes

Các index quan trọng đã được tạo:

- `products.slug` - Tìm kiếm sản phẩm theo URL
- `products.category_id` - Filter theo danh mục
- `product_variants.sku` - Tìm theo SKU
- `orders.status` - Filter đơn hàng theo trạng thái
- `orders.created_at` - Sắp xếp theo thời gian

---

## Soft Delete

Các entity có `deletedAt` field để soft delete:

- User
- Product
- ProductVariant
- PriceList
- Promotion
- BlogPost
