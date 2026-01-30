/**
 * Settings types
 */

export type SettingValue = string | number | boolean | object | null

export interface Setting {
  id: string
  key: string
  value: SettingValue
  group: string | null
  isPublic: boolean
}

export interface SettingInput {
  key: string
  value: SettingValue
  group?: string | null
  isPublic?: boolean
}

// Grouped settings
export type GroupedSettings = Record<string, Setting[]>
