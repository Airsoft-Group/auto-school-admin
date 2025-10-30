<template>
    <aside class="flex relative flex-col justify-between px-4 py-7 mx-auto w-full bg-bg-2 border-r border-gray-200">
        <div>
            <header class="flex items-center relative h-8 gap-5 pl-2 justify-between w-full text-base font-semibold text-black whitespace-nowrap">
                🚗 Avto Test
            </header>
            <nav class="mt-8">
                <ul class="space-y-1">
                    <template v-for="menu in menuItems" :key="menu.id">
                        <li v-if="hasRole(menu.role)">
                            <router-link
                                :to="resolvePath(menu.path)"
                                class="flex items-center gap-3 py-2.5 px-3 rounded-md font-medium text-sm whitespace-nowrap transition-all"
                                :class="{
                                    'bg-primary text-white': isMenuActive(menu.path),
                                    'text-gray-700 hover:bg-gray-100': !isMenuActive(menu.path),
                                }"
                            >
                                <!-- <div class="flex items-center justify-center w-6 h-6">
                                    <Icon size="20" :color="isMenuActive(menu.path) ? '#FFFFFF' : '#667085'" :name="`local-${menu.icon}`" />
                                </div> -->
                                <span>{{ menu.title }}</span>
                            </router-link>
                        </li>
                    </template>
                </ul>
            </nav>
        </div>

        <div class="w-full border-t flex justify-between items-start pt-5">
            <div class="flex items-center gap-3">
                <img width="40" height="40" src="@/assets/images/avatars/olivia.png" alt="default" />
                <div>
                    <p class="text-[#344054] text-sm font-semibold">{{ user?.fullName }}</p>
                    <span class="text-[#475467] text-sm"> {{ user?.email || 'default' }} </span>
                </div>
            </div>
            <button class="mt-1" @click="logOut">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5M7.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H7.5"
                        stroke="#667085"
                        stroke-width="1.66667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
        </div>
    </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import LogoIcon from '@/components/icons/LogoIcon.vue'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores'
import { menuItems } from '@/constants/routes.constants'

const emit = defineEmits(['toggle'])
const props = defineProps(['isCallapse'])

const router = useRouter()
const usersStore = useUserStore()
const user = computed(() => usersStore.getUser)

const isMenuActive = (path: string) => {
    const current = router.currentRoute.value.path
    const resolvedPath = path.startsWith('/') ? path : `/admin/${path}`

    return current.includes(resolvedPath.replace(/^\/+/, ''))
}

const hasRole = (roles: string[]) => {
    const userRole = user.value?.role || 'super_admin'
    return roles.includes(userRole)
}

const resolvePath = (path: string) => {
    return path.startsWith('/') ? path : `/admin/${path}`
}

const logOut = async () => {
    ElMessageBox.confirm('Tizimdan chiqishni xohlaysizmi?', 'Ogohlantirish', {
        confirmButtonText: 'Ha',
        cancelButtonText: "Yo'q",
        type: 'warning',
        draggable: true,
    })
        .then(async () => {
            await usersStore.logout()
            router.push('/login')
        })
        .catch(() => {})
}
</script>

<style scoped>
.nested-dropdown-menu {
    position: absolute;
    left: 100%;
    top: 0;
    margin-left: 10px;
}
</style>
