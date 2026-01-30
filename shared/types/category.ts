/**
 * Category types
 */

// Category for list view
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  rank: number
  isActive: boolean
  parent?: {
    id: string
    name: string
  } | null
  children?: Category[]
  _count: {
    products: number
    children: number
  }
}

// Category for detail/edit view
export interface CategoryDetail {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  rank: number
  isActive: boolean
  specTemplate: unknown
  createdAt: string
  updatedAt: string
}

// Category for select options
export interface CategoryOption {
  id: string
  name: string
  slug: string
}

// Input types
export interface CategoryInput {
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  rank?: number
  isActive?: boolean
  specTemplate?: unknown
}
