/**
 * Nitro Plugin: Event System Initialization
 *
 * Đăng ký tất cả subscribers khi server khởi động.
 */

import { registerSubscribers } from '../subscribers'

export default defineNitroPlugin(() => {
  registerSubscribers()
})