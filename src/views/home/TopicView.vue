<template>
    <div class="w-full mx-auto">
        <div class="flex flex-col items-start justify-start gap-4 mb-6">
            <el-button type="text" @click="router.push('/')" class="!p-0 flex items-center text-gray-600 hover:text-blue-600 transition">
                <el-icon><ArrowLeft /></el-icon>
                <span class="ml-1 text-sm">{{ $t('app.back') }}</span>
            </el-button>
            <h2 class="text-2xl font-bold text-gray-800">📚 {{ $t('app.topic_list') }}</h2>
        </div>
        <div v-if="loading" class="space-y-4">
            <el-card v-for="n in 8" :key="n" class="p-4" shadow="never">
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <el-skeleton :rows="1" animated style="width: 50%" />
                    </div>
                    <el-skeleton animated style="width: 80px; height: 24px" />
                </div>
            </el-card>
        </div>
        <div v-else>
            <el-card
                shadow="hover"
                class="mb-4 cursor-pointer hover:shadow-md transition-all duration-200"
                v-for="(subject, index) in subjects"
                :key="subject.id"
                @click="openSubject(subject.id)"
            >
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 font-medium text-right"> {{ (currentPage - 1) * meta.pagination.limit + index + 1 }} ) </span>
                    <h3 class="text-lg font-semibold text-gray-800 capitalize">{{ subject.name?.uz }}</h3>
                </div>
            </el-card>

            <div v-if="meta.pagination.total > meta.pagination.limit" class="flex justify-center mt-8">
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
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useSubjectStore } from '@/stores/subjects'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useQuestionStore } from '@/stores/questions'

const subjectStore = useSubjectStore()
const questionStore = useQuestionStore()
const router = useRouter()

const loading = ref(true)
const currentPage = ref(1)

const subjects = computed(() => subjectStore.subject.data)
const meta = computed(
    () =>
        subjectStore.subject?.meta ?? {
            pagination: { total: 0, limit: 10, page: 1, lastPage: 1 },
        }
)

const fetchPage = async (page: number) => {
    loading.value = true
    await subjectStore.fetchSubjects({ page })
    currentPage.value = page
    loading.value = false
}

const openSubject = async (id: string) => {
    await questionStore.fetchQuestionSubjectById(id)
    router.push(`/topics/${id}`)
}

onMounted(async () => {
    await fetchPage(1)
})
</script>

<style scoped>
.el-card:hover {
    transform: translateY(-2px);
}
</style>
