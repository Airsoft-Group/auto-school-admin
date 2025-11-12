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

                <div class="grid sm:grid-cols-3 gap-6" v-if="stats">
                    <el-card
                        v-for="(stat, i) in stats"
                        :key="i"
                        shadow="hover"
                        class="text-center border !rounded-2xl border-gray-100 hover:shadow-lg transition-all"
                    >
                        <p class="text-gray-500 text-sm mb-1">
                            {{ t('stats.completed_tests') }}
                        </p>
                        <p :class="stat.colorClass" class="font-bold text-xl">
                            {{ stat.value }}
                        </p>
                    </el-card>
                </div>
                <div class="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <div
                        v-for="(item, i) in cards"
                        :key="i"
                        class="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300 cursor-pointer"
                        @click="handleCardClick(item.route, item)"
                    >
                        <div class="p-6 flex flex-col justify-between h-full">
                            <component
                                :is="item.icon"
                                class="w-10 h-10 mb-2 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                            />

                            <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                {{ $t(item.title) }}
                            </h3>
                            <p class="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                                {{ $t(item.desc) }}
                            </p>

                            <div class="mt-6 flex items-center justify-between">
                                <button class="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                                    {{ $t(item.btnText) }}
                                </button>

                                <div
                                    class="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center text-center py-20 px-5">
                <h1 class="text-[62px] font-extrabold text-gray-800 mb-6 leading-tight">
                    Avto<span class="text-blue-600">School</span> — {{ $t('landing.subtitle_line1') }} <br />
                    {{ $t('landing.subtitle_line2') }}
                </h1>

                <p class="text-gray-600 max-w-2xl text-lg mb-10">
                    {{ $t('landing.description') }}
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                    <el-button
                        type="primary"
                        size="large"
                        round
                        class="!bg-blue-600 !text-white font-bold hover:!bg-blue-700 transition-all"
                        @click="$router.push('/login')"
                    >
                        {{ $t('landing.login_button') }}
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore, useUserStore } from '@/stores'
import { useI18n } from 'vue-i18n'
import TopicsIcon from '@/components/icons/IconTopic.vue'
import TicketsIcon from '@/components/icons/IconTicket.vue'
import ExamIcon from '@/components/icons/IconExam.vue'
const router = useRouter()
const userStore = useUserStore()
const examStore = useExamStore()
const user = computed(() => userStore.user)
const results = computed(() => examStore.result)
const isLoggedIn = computed(() => !!userStore.token)
const { t, locale } = useI18n()
const lang = computed(() => locale.value as any)

const greetingMessage = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Ertalabki mashg‘ulot uchun ajoyib vaqt ☀️'
    if (hour < 18) return 'Kunning o‘rtasida mashq qilish foydali 🔋'
    return 'Kechqurun ham o‘rganishni davom ettiring 🌙'
})
const stats = computed(() => {
    if (!results.value) return []

    return results.value.data?.statistics.map((stat: any) => {
        let displayValue: string | number = stat.count

        if (stat.type === 'percentage') {
            displayValue = `${stat.count}%`
        } else if (stat.type === 'days') {
            displayValue = stat.count === 0 ? t('app.today') : `${stat.count} ${t('app.days')}`
        }

        return {
            label: stat.label,
            value: displayValue,
            colorClass: stat.type === 'percentage' ? 'text-green-600' : 'text-gray-800',
        }
    })
})

const cards = [
    {
        icon: TopicsIcon,
        title: 'dashboard.cards.topics.title',
        desc: 'dashboard.cards.topics.desc',
        btnText: 'dashboard.cards.topics.btn',
        route: '/topics',
    },
    {
        icon: TicketsIcon,
        title: 'dashboard.cards.tickets.title',
        desc: 'dashboard.cards.tickets.desc',
        btnText: 'dashboard.cards.tickets.btn',
        route: '/tickets',
    },
    {
        icon: ExamIcon,
        title: 'dashboard.cards.exam.title',
        desc: 'dashboard.cards.exam.desc',
        btnText: 'dashboard.cards.exam.btn',
        route: '/exam',
        isExam: true,
    },
]

async function handleCardClick(route: string, card?: any) {
    if (!userStore.token) {
        router.push('/login')
    } else if (card?.isExam) {
        try {
            await examStore.fetchExamStart({ type: 'RANDOM' })
            router.push({
                name: 'exams',
            })
        } catch (error) {
            console.error('Exam API error:', error)
        }
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
