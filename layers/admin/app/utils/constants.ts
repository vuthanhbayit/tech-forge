/**
 * Admin UI constants
 * Centralized strings and options for consistent UI
 */

// =============================================================================
// Status Labels
// =============================================================================

export const STATUS_LABELS = {
  active: 'Hoạt động',
  inactive: 'Vô hiệu hóa',
  pending: 'Chờ xử lý',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
  draft: 'Nháp',
  published: 'Đã xuất bản',
  archived: 'Đã lưu trữ',
} as const

// =============================================================================
// Order Status
// =============================================================================

export const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng',
  REFUNDED: 'Đã hoàn tiền',
} as const

export const ORDER_STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPING: 'primary',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
  RETURNED: 'neutral',
  REFUNDED: 'neutral',
} as const

// =============================================================================
// Payment Status
// =============================================================================

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PARTIALLY_PAID: 'Thanh toán một phần',
  REFUNDED: 'Đã hoàn tiền',
  FAILED: 'Thất bại',
} as const

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'warning',
  PAID: 'success',
  PARTIALLY_PAID: 'info',
  REFUNDED: 'neutral',
  FAILED: 'error',
} as const

// =============================================================================
// Product Status
// =============================================================================

export const PRODUCT_STATUS_LABELS = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang bán',
  ARCHIVED: 'Đã lưu trữ',
} as const

export const PRODUCT_STATUS_COLORS = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  ARCHIVED: 'warning',
} as const

// =============================================================================
// Filter Options (for USelectMenu)
// =============================================================================

export const ACTIVE_STATUS_OPTIONS = [
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã vô hiệu hóa' },
]

export const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'Có' },
  { value: 'false', label: 'Không' },
]

// =============================================================================
// Pagination
// =============================================================================

export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// =============================================================================
// Messages
// =============================================================================

export const MESSAGES = {
  // Success
  created: (item: string) => `Đã tạo ${item} thành công`,
  updated: (item: string) => `Đã cập nhật ${item} thành công`,
  deleted: (item: string) => `Đã xóa ${item} thành công`,
  saved: 'Đã lưu thành công',

  // Error
  createFailed: (item: string) => `Không thể tạo ${item}`,
  updateFailed: (item: string) => `Không thể cập nhật ${item}`,
  deleteFailed: (item: string) => `Không thể xóa ${item}`,
  loadFailed: (item: string) => `Không thể tải ${item}`,
  notFound: (item: string) => `Không tìm thấy ${item}`,

  // Validation
  required: (field: string) => `${field} là bắt buộc`,
  invalid: (field: string) => `${field} không hợp lệ`,

  // Confirmation
  confirmDelete: (item: string) => `Bạn có chắc muốn xóa ${item}?`,
} as const

// =============================================================================
// Entity Names (Vietnamese)
// =============================================================================

export const ENTITY_NAMES = {
  user: 'người dùng',
  users: 'người dùng',
  role: 'role',
  roles: 'roles',
  category: 'danh mục',
  categories: 'danh mục',
  product: 'sản phẩm',
  products: 'sản phẩm',
  order: 'đơn hàng',
  orders: 'đơn hàng',
  setting: 'cài đặt',
  settings: 'cài đặt',
  promotion: 'khuyến mãi',
  promotions: 'khuyến mãi',
} as const
