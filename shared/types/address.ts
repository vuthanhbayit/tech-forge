/**
 * Address types (Vietnam format)
 */

export interface Address {
  id: string
  fullName: string
  phone: string
  addressLine: string
  ward: string | null
  district: string
  province: string
  postalCode: string | null
  isDefault: boolean
}

export interface AddressSummary {
  id: string
  addressLine: string
  ward: string | null
  district: string
  province: string
  isDefault: boolean
}

export interface AddressInput {
  fullName: string
  phone: string
  addressLine: string
  ward?: string | null
  district: string
  province: string
  postalCode?: string | null
  isDefault?: boolean
}
