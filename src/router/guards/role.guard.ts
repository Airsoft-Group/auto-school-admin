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

    // 🔹 Rol ko‘rsatilmagan bo‘lsa → ruxsat beramiz
    if (!meta.roles || meta.roles.length === 0) {
        next()
        return
    }

    // 🔹 Foydalanuvchi yo‘q bo‘lsa → login sahifasiga
    if (!user) {
        next('/login')
        return
    }

    const userRole = user.role ?? 'user'

    // 🔹 Agar foydalanuvchi roli sahifadagi rollar ro‘yxatida bo‘lsa → ruxsat
    if (Array.isArray(meta.roles) && meta.roles.includes(userRole)) {
        next()
        return
    }

    ElMessage({
        message: 'Bu sahifaga kirishga ruxsatingiz yo‘q',
        type: 'error',
        duration: 4000,
    })

    if (userRole === 'super_admin') {
        next('/admin/dashboard')
    } else {
        next('/')
    }
}
