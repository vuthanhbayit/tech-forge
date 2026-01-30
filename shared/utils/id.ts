/**
 * Generate prefixed ID for database tables
 *
 * Shared utility - used by both server and prisma seed scripts
 */

// Prefix mapping for each table
const prefixMap = {
  user: 'user',
  role: 'role',
  permission: 'perm',
  category: 'cat',
  product: 'prod',
  variant: 'var',
  option: 'opt',
  optionValue: 'optval',
  order: 'order',
  orderItem: 'oi',
  cart: 'cart',
  cartItem: 'ci',
  payment: 'pay',
  address: 'addr',
  session: 'sess',
  setting: 'set',
  priceList: 'pl',
  priceListItem: 'pli',
  promotion: 'promo',
  promotionRule: 'rule',
  buyXGetY: 'bxgy',
  customerGroup: 'cg',
  bom: 'bom',
  fulfillment: 'ful',
  fulfillmentItem: 'fi',
  review: 'rev',
  question: 'qa',
  answer: 'ans',
  blog: 'blog',
  blogCategory: 'blogcat',
  chatSession: 'chat',
  chatMessage: 'msg',
  media: 'media',
} as const

export type IdPrefix = keyof typeof prefixMap

/**
 * Generate a random string
 */
function randomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a prefixed ID
 *
 * @param type - The entity type (user, role, category, etc.)
 * @returns Prefixed ID string (e.g., user_m1abc123)
 */
export function generateId(type: IdPrefix): string {
  const prefix = prefixMap[type]
  const timestamp = Date.now().toString(36)
  const random = randomString(8)
  return `${prefix}_${timestamp}${random}`
}
