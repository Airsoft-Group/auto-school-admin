import authGuard from './auth.guard'
import roleGuard from './role.guard'
import { RouteLocationNormalized, NavigationGuardNext, Router } from 'vue-router'

export function setupRouterGuards(router: Router) {
    router.beforeEach(async (to, from, next) => {
        await authGuard(to, from, next)
    })
    router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        roleGuard(to, from, next)
    })
}

export default {
    authGuard,
    roleGuard,
    setupRouterGuards,
}
