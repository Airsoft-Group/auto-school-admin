<template>
    <div class="relative w-full h-[92.5vh] bg-gradient-to-br from-sky-50 via-white to-blue-50 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div
                class="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            ></div>
        </div>

        <div class="relative z-10">
            <div v-if="isLoggedIn" class="container mx-auto px-6 py-12">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                    <div>
                        <h2 class="text-4xl font-extrabold text-gray-800">👋 Salom, {{ user?.fullName || 'Haydovchi' }}</h2>
                        <p class="text-gray-500 text-lg mt-1">Bugun o‘qishni davom ettirishga tayyormisiz?</p>
                    </div>
                    <div class="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3 text-blue-700 text-sm font-semibold shadow-sm">
                        🌤 {{ greetingMessage }}
                    </div>
                </div>

                <div class="grid sm:grid-cols-3 gap-6">
                    <el-card
                        v-for="(stat, i) in stats"
                        :key="i"
                        shadow="hover"
                        class="text-center border !rounded-2xl border-gray-100 hover:shadow-lg transition-all"
                    >
                        <p class="text-gray-500 text-sm mb-1">{{ $t(stat.label) }}</p>
                        <p :class="stat.colorClass" class="font-bold text-xl">{{ stat.value }}</p>
                    </el-card>
                </div>
                <div class="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <div
                        v-for="(item, i) in cards"
                        :key="i"
                        class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                        @click="handleCardClick(item.route)"
                    >
                        <div
                            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-200/30 to-indigo-100/30 blur-2xl"
                        ></div>

                        <div class="relative z-10 flex flex-col justify-between h-full p-6">
                            <div>
                                <div class="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-500">
                                    {{ item.icon }}
                                </div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                    {{ $t(item.title) }}
                                </h3>
                                <p class="text-gray-500 text-sm leading-relaxed">
                                    {{ $t(item.desc) }}
                                </p>
                            </div>

                            <button
                                class="mt-6 py-2 px-4 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-300"
                            >
                                {{ $t(item.btnText) }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center text-center py-20 px-5">
                <h1 class="text-[62px] font-extrabold text-gray-800 mb-6 leading-tight">
                    Avto<span class="text-blue-600">School</span> — Sizning yo‘ldagi <br />
                    hamrohingiz
                </h1>

                <p class="text-gray-600 max-w-2xl text-lg mb-10">
                    Haydovchilik guvohnomasiga tayyorlanish uchun mukammal joy: yo‘l harakati qoidalarini o‘rganing, interaktiv testlarni yeching va
                    haqiqiy imtihon oldidan o‘zingizni sinab ko‘ring.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                    <el-button
                        type="primary"
                        size="large"
                        round
                        class="!bg-blue-600 !text-white font-semibold hover:!bg-blue-700 transition-all"
                        @click="$router.push('/login')"
                    >
                        Tizimga kirish
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const isLoggedIn = computed(() => !!userStore.token)
const stats = [
    { label: 'dashboard.stats.tests_done', value: '12', colorClass: 'text-blue-600' },
    { label: 'dashboard.stats.best_score', value: '98%', colorClass: 'text-green-600' },
    { label: 'dashboard.stats.last_test', value: '3 kun oldin', colorClass: 'text-yellow-600' },
]
const greetingMessage = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Ertalabki mashg‘ulot uchun ajoyib vaqt ☀️'
    if (hour < 18) return 'Kunning o‘rtasida mashq qilish foydali 🔋'
    return 'Kechqurun ham o‘rganishni davom ettiring 🌙'
})
const cards = [
    {
        icon: '📘',
        title: 'dashboard.cards.topics.title',
        desc: 'dashboard.cards.topics.desc',
        btnText: 'dashboard.cards.topics.btn',
        route: '/topics',
    },
    {
        icon: '🎟️',
        title: 'dashboard.cards.tickets.title',
        desc: 'dashboard.cards.tickets.desc',
        btnText: 'dashboard.cards.tickets.btn',
        route: '/tickets',
    },
    {
        icon: '🧠',
        title: 'dashboard.cards.exam.title',
        desc: 'dashboard.cards.exam.desc',
        btnText: 'dashboard.cards.exam.btn',
        route: '/exam',
    },
]

const handleCardClick = (route: string) => {
    if (!userStore.token) {
        router.push('/login')
    } else {
        router.push(route)
    }
}
</script>

<style scoped>
.text-center {
    text-align: center;
}
</style>
