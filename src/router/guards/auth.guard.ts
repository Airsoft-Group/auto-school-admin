import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '../../stores'
import { ElMessage } from 'element-plus'

export default async function authGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): Promise<void> {
    const store = useUserStore()

    const publicPages = ['/', '/login', '/register', '/forgot-password']
    const authRequired = !publicPages.includes(to.path)

    if (authRequired) {
        if (!store.token) {
            ElMessage({
                message: 'Iltimos, tizimga kiring',
                type: 'warning',
            })
            return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        }

        if (store.token && !store.user) {
            try {
                await store.fetchUserInfo()
            } catch {
                store.$reset()
                ElMessage({
                    message: 'Sessiya muddati tugadi. Iltimos, qayta kiring.',
                    type: 'error',
                })
                return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
            }
        }
    }

    if (to.path === '/login' && store.token) {
        const role = store.user?.role
        if (role === 'super_admin') {
            return next('/admin/dashboard')
        } else {
            return next('/')
        }
    }

    next()
}
