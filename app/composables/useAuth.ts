interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  avatar: string | null
  role: string | undefined
  permissions: Array<{
    resource: string
    action: string
    scope: string
  }>
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isLoggedIn = computed(() => !!user.value)

  const fetchUser = async () => {
    try {
      const { data } = await useFetch('/api/auth/me')
      if (data.value?.user) {
        user.value = data.value.user
      }
    } catch {
      user.value = null
    }
  }

  const login = async (credentials: LoginCredentials) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })

    if (response.user) {
      user.value = response.user
    }

    return response
  }

  const register = async (data: RegisterData) => {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: data,
    })

    if (response.user) {
      // Fetch full user with permissions
      await fetchUser()
    }

    return response
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  // Permission helpers
  const hasPermission = (resource: string, action: string) => {
    if (!user.value?.permissions) return false

    return user.value.permissions.some(p => p.resource === resource && (p.action === action || p.action === 'MANAGE'))
  }

  const hasRole = (roleName: string) => {
    return user.value?.role === roleName
  }

  const isAdmin = computed(() => {
    return user.value?.role === 'super_admin' || user.value?.role === 'admin'
  })

  const fullName = computed(() => {
    if (!user.value) return ''
    const parts = [user.value.firstName, user.value.lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : user.value.email
  })

  return {
    user: readonly(user),
    isLoggedIn,
    isAdmin,
    fullName,
    fetchUser,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
  }
}
