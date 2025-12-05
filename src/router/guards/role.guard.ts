import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '../../stores'
import { ElMessage } from 'element-plus'

interface RouteMeta {
    roles?: string[]
    [key: string]: any
}

export default function roleGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    const store = useUserStore()
    const { user } = store
    const meta = to.meta as RouteMeta

    const publicPages = ['/', '/login', '/register', '/forgot-password']
    if (publicPages.includes(to.path)) {
        next()
        return
    }

    if (!meta.roles || meta.roles.length === 0) {
        next()
        return
    }

    if (!user) {
        ElMessage({
            message: 'Bu sahifaga kirish uchun tizimga kiring',
            type: 'warning',
        })
        next('/')
        return
    }

    const userRole = user.role ?? 'user'

    if (Array.isArray(meta.roles) && meta.roles.includes(userRole)) {
        next()
        return
    }

    ElMessage({
        message: 'Bu sahifaga kirishga ruxsatingiz yo‘q',
        type: 'error',
        duration: 4000,
    })

    if (userRole === 'super_admin' || userRole === 'admin') {
        next('/admin/dashboard')
    } else {
        next('/')
    }
}
