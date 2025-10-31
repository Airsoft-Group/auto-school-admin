<template>
    <div>
        <div class="w-full mx-auto mb-8">
            <div class="flex justify-between items-center flex-wrap gap-2">
                <h2 class="text-xl font-bold text-gray-800">
                    {{ $t('dashboard.hello', { name: user?.fullName || 'Haydovchi' }) }}
                </h2>
                <el-tag type="success" effect="light">{{ $t('dashboard.level') }}</el-tag>
            </div>

            <p class="text-gray-600 mb-6">{{ $t('dashboard.continue') }}</p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <el-card v-for="(stat, i) in stats" :key="i" shadow="never" class="text-center border !rounded-lg border-gray-100">
                    <p class="text-gray-500 text-sm mb-1">{{ $t(stat.label) }}</p>
                    <p :class="stat.colorClass" class="font-bold text-lg">{{ stat.value }}</p>
                </el-card>
            </div>
        </div>

        <div class="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <el-card
                v-for="(item, i) in cards"
                :key="i"
                shadow="hover"
                class="flex flex-col !rounded-lg justify-between !w-full h-full hover:shadow-md transition-all"
            >
                <div>
                    <div class="text-4xl mb-3">{{ item.icon }}</div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">
                        {{ $t(item.title) }}
                    </h3>
                    <p class="text-gray-500 text-sm">{{ $t(item.desc) }}</p>
                </div>
                <el-button type="primary" round class="mt-5" @click="router.push(item.route)">
                    {{ $t(item.btnText) }}
                </el-button>
            </el-card>
        </div>

        <div class="w-full mx-auto mt-10">
            <h4 class="text-gray-700 font-semibold mb-3">{{ $t('dashboard.recent.title') }}</h4>
            <el-table :data="recentTests" style="width: 100%">
                <el-table-column prop="title" :label="$t('dashboard.recent.name')" min-width="180" />
                <el-table-column prop="score" :label="$t('dashboard.recent.score')" width="140" />
                <el-table-column prop="date" :label="$t('dashboard.recent.date')" width="160" />
                <el-table-column :label="$t('dashboard.recent.status')" width="180">
                    <template #default="{ row }">
                        <el-tag :type="row.passed ? 'success' : 'danger'" size="small" effect="light">
                            {{ row.passed ? $t('dashboard.recent.passed') : $t('dashboard.recent.failed') }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
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
const stats = [
    { label: 'dashboard.stats.tests_done', value: '12', colorClass: 'text-blue-600' },
    { label: 'dashboard.stats.best_score', value: '98%', colorClass: 'text-green-600' },
    { label: 'dashboard.stats.last_test', value: '3 kun oldin', colorClass: 'text-yellow-600' },
]
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

const progress = ref(78)

const recentTests = ref([
    { title: 'Bilet 12', score: 95, date: '2025-10-28', passed: true },
    { title: 'Mavzu 4: Belgilar', score: 88, date: '2025-10-25', passed: true },
    { title: 'Imtihon sinovi', score: 60, date: '2025-10-20', passed: false },
])
</script>

<style scoped>
.text-center {
    text-align: center;
}
</style>
