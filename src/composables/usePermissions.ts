import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { PERMISSIONS, RESOURCES, USER_ROLES, ActionType } from '@/constants/permissions.constants'

export function usePermissions() {
    const userStore = useUserStore()

    const hasPermission = (permission: string): boolean => {
        const userPermissions = userStore.user?.permissions || []
        return userPermissions.includes(permission)
    }

    // const hasRole = (roleValues: string[]): boolean => {
    //     const userRoles = userStore.user?.roles
    //     return roleValues.some((role) => {
    //         const roleName = role as 'super_admin' | 'admin' | 'teacher' | 'student'
    //         return userRoles.includes(roleName)
    //     })
    // }

    // const isAdmin = computed(() => {
    //     return hasRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN])
    // })
    function canAccess(resourceOrPermission: RESOURCES | string, action?: ActionType): boolean {
        let permissionKey: string
        if (action === undefined) {
            permissionKey = resourceOrPermission as string
        } else {
            permissionKey = `${action}:${resourceOrPermission}`
        }
        const permissionValues = Object.values(PERMISSIONS) as string[]
        const permissionExists = permissionValues.includes(permissionKey)
        if (!permissionExists) {
            console.warn(`Permission check for unknown permission: ${permissionKey}`)
        }

        return hasPermission(permissionKey)
    }

    return {
        hasPermission,
        // hasRole,
        // isAdmin,
        canAccess,
        PERMISSIONS,
        USER_ROLES,
    }
}
