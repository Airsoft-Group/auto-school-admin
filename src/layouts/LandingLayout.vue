<template>
    <div class="min-h-screen flex flex-col">
        <!-- Header -->
        <header class="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-20">
            <h1 class="text-2xl font-extrabold text-gray-800 leading-tight cursor-pointer" @click="router.push('/')">
                Avto<span class="text-blue-600">School</span>
            </h1>
            <div class="flex items-center gap-4">
                <!-- Language selector -->
                <el-select v-model="lang" @change="setLocale(locale)" class="!w-20">
                    <el-option value="uz">UZ (Lotin)</el-option>
                    <el-option value="oz">O‘Z (Кирилл)</el-option>
                    <el-option value="ru">RU (Русский)</el-option>
                </el-select>

                <!-- If user is logged in -->
                <div v-if="user" class="relative" @mouseenter="menuOpen = true" @mouseleave="menuOpen = false">
                    <div class="flex items-center gap-3 cursor-pointer">
                        <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {{ user.fullName?.charAt(0).toUpperCase() || 'U' }}
                        </div>
                        <div class="flex flex-col text-left leading-tight">
                            <span class="text-sm font-medium text-gray-800">
                                {{ user.fullName }}
                            </span>
                            <span class="text-xs text-gray-500">
                                {{ user.email }}
                            </span>
                        </div>
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <transition name="fade">
                        <div v-if="menuOpen" class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10 flex flex-col">
                            <!-- <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" @click="router.push('/profile')">
                                {{ t('app.profile') }}
                            </button> -->
                            <button class="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-gray-100" @click="logout">
                                {{ t('app.logout') }}
                            </button>
                        </div>
                    </transition>
                </div>
                <button
                    v-else
                    class="bg-[#2563EB] hover:bg-[#1E50C4] text-white px-4 py-2 rounded-md text-sm font-bold transition"
                    @click="router.push('/login')"
                >
                    {{ t('app.login') }}
                </button>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useExamStore, useUserStore } from '@/stores'
import { setLocale } from '@/utils/i18n'
import { ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const examStore = useExamStore()
const user = computed(() => userStore.user)
const router = useRouter()
const menuOpen = ref(false)
const { t, locale } = useI18n()
const lang = ref(localStorage.getItem('lang') || 'uz')

onMounted(() => {
    if (userStore.token) {
        userStore.fetchUserInfo()
        examStore.fetchResult()
    }
})
watch(lang, async (newLang) => {
    await setLocale(newLang)
})
const logout = async () => {
    ElMessageBox.confirm('Tizimdan chiqishni xohlaysizmi?', 'Ogohlantirish', {
        confirmButtonText: 'Ha',
        cancelButtonText: "Yo'q",
        type: 'warning',
        draggable: true,
    })
        .then(async () => {
            await userStore.logout()
            router.push('/login')
        })
        .catch(() => {})
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
