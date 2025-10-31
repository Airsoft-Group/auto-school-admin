<template>
    <div class="w-full">
        <!-- Header with back button -->
        <div class="flex flex-col items-start justify-start gap-3 mb-6">
            <el-button type="text" @click="router.push('/')" class="!p-0 text-gray-600 hover:text-blue-600 transition">
                <el-icon><ArrowLeft /></el-icon>
                <span class="ml-1 text-sm text-left">{{ $t('app.back') }}</span>
            </el-button>
            <h2 class="text-2xl font-bold text-gray-800">🎟️ {{ $t('app.ticket_list') }}</h2>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
            <el-skeleton v-for="n in 10" :key="n" animated class="!rounded-lg p-4 border border-gray-100 shadow-sm">
                <template #template>
                    <div class="flex flex-col items-center justify-center py-6 space-y-3">
                        <el-skeleton-item variant="circle" style="width: 48px; height: 48px" />
                    </div>
                </template>
            </el-skeleton>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
            <el-card
                v-for="ticket in tickets"
                :key="ticket.id"
                shadow="hover"
                class="cursor-pointer hover:shadow-md hover:border-blue-600 transition-all !rounded-lg duration-200 flex flex-col items-center justify-center py-6"
                @click="openTicket(ticket.id as any)"
            >
                <div class="text-xl font-bold text-blue-600">{{ ticket.name }}</div>
                <!-- <p class="text-sm text-gray-500 mt-2">Savollar soni: {{ ticket.question_count }}</p> -->
            </el-card>
        </div>

        <!-- Pagination -->
        <div v-if="meta?.pagination?.total > meta?.pagination?.limit" class="flex justify-center mt-8">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="meta?.pagination.total"
                :page-size="meta?.pagination.limit"
                v-model:current-page="currentPage"
                @current-change="fetchPage"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useTicketStore } from '@/stores/ticket'

const router = useRouter()
const ticketStore = useTicketStore()

const tickets = computed(() => ticketStore.ticket?.data)
const meta = computed(
    () =>
        ticketStore.ticket?.meta ?? {
            pagination: { total: 0, limit: 20, page: 1, lastPage: 1 },
        }
)
const loading = ref(false)

const currentPage = ref(1)
const fetchPage = async (page: number) => {
    loading.value = true
    await ticketStore.fetchTickets({ page })
    currentPage.value = page
    loading.value = false
}

const openTicket = (id: number) => {
    router.push(`/tickets/${id}`)
}

onMounted(() => {
    fetchPage(1)
})
</script>
