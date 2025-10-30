<template>
    <div class="min-h-screen flex flex-col">
        <!-- Header -->
        <header class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h1 class="text-xl font-bold text-[#303030]">MyApp</h1>
            <div class="flex items-center gap-4">
                <select v-model="lang" class="border rounded px-2 py-1 text-sm">
                    <option value="uz">UZ</option>
                    <option value="ru">RU</option>
                    <option value="en">EN</option>
                </select>
                <button class="bg-[#2563EB] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md text-sm font-medium" @click="router.push('/login')">
                    Login
                </button>
            </div>
        </header>

        <!-- Main content -->
        <main class="flex-1 overflow-y-auto p-6">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <!-- Footer -->
        <footer class="text-center text-sm text-gray-400 py-4 border-t border-gray-100">© 2025 MyApp. All rights reserved.</footer>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const lang = ref('uz')
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
