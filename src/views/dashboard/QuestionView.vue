<template>
    <div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
                <el-input
                    :prefix-icon="Search"
                    type="text"
                    autocomplete="off"
                    v-model="filters.search"
                    @keypress.enter="fetchQuestions"
                    class="min-w-[300px]"
                    placeholder="Search question..."
                    clearable
                />
                <!-- <el-select v-model="filters.subjectId" placeholder="Select Subject" clearable @change="fetchQuestions">
                    <el-option v-for="s in subjects" :key="s.id" :label="s.name.oz" :value="s.id" />
                </el-select>
    
                <el-select v-model="filters.ticketId" placeholder="Select Ticket" clearable @change="fetchQuestions">
                    <el-option v-for="t in tickets" :key="t.id" :label="t.name" :value="t.id" />
                </el-select> -->
            </div>
            <el-button type="primary" @click="openCreateModal">+ Add Subject</el-button>
        </div>

        <el-table style="width: 100%" class="whiteStripe" :data="questions.data" v-loading="loading">
            <el-table-column label="№" width="70" align="center" type="index" :index="indexMethod" />
            <el-table-column label="Question (🇺🇿)" min-width="320" align="left">
                <template #default="{ row }">
                    <div class="truncate-text" :title="row.title?.oz">
                        {{ row.title?.uz }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Subject" width="200" align="center">
                <template #default="{ row }">
                    {{ row.subject?.name?.uz || '-' }}
                </template>
            </el-table-column>
            <el-table-column label="Ticket" width="160" align="center">
                <template #default="{ row }">
                    {{ row.ticket?.name || '-' }}
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="200" align="center">
                <template #default="{ row }">
                    <div class="flex items-center justify-center gap-2">
                        <el-button size="small" plain @click="openView(row)">
                            <el-icon><View /></el-icon>
                        </el-button>
                        <el-button size="small" type="primary" plain>
                            <el-icon><EditPen /></el-icon>
                        </el-button>
                        <el-button size="small" type="danger" plain>
                            <el-icon><DeleteFilled /></el-icon>
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex justify-center mt-4">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="questions.meta?.pagination?.total"
                :page-size="filters.limit"
                v-model:current-page="filters.page"
                @current-change="handlePageChange"
            />
        </div>
        <el-dialog v-model="viewVisible" title="Question Details" width="600px" :before-close="() => (viewVisible = false)">
            <div v-if="currentQuestion" class="space-y-3">
                <div>
                    <h4 class="font-semibold text-gray-800 mb-1">🇺🇿 O‘zbekcha:</h4>
                    <p>{{ currentQuestion.title?.oz }}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-800 mb-1">Ўзбекча (Кирил):</h4>
                    <p>{{ currentQuestion.title?.uz }}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-800 mb-1">🇷🇺 Русский:</h4>
                    <p>{{ currentQuestion.title?.ru }}</p>
                </div>

                <el-divider />

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <span class="font-medium text-gray-600">Subject:</span>
                        <p>{{ currentQuestion.subject?.name?.uz || '-' }}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Ticket:</span>
                        <p>{{ currentQuestion.ticket?.name || '-' }}</p>
                    </div>
                </div>
                <div v-if="currentQuestion.file" class="mt-3">
                    <span class="font-medium text-gray-600">Attached file:</span>
                    <img :src="'https://timedu.uz' + currentQuestion.file?.path" alt="file" />
                </div>
            </div>
            <el-divider />
            <div>
                <h4 class="font-semibold text-gray-800 mb-2">Answers:</h4>
                <div
                    v-for="(ans, i) in currentQuestion.answers"
                    :key="ans.id"
                    class="p-3 rounded-lg border mb-2 transition-all"
                    :class="ans.isCorrect ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'"
                >
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-sm font-semibold text-gray-700">Variant {{ i + 1 }}</p>
                    </div>
                    <p class="text-gray-800 text-sm leading-snug">🇺🇿 {{ ans.title.oz }}</p>
                    <p class="text-gray-800 text-sm leading-snug">🇺🇿 {{ ans.title.uz }}</p>
                    <p class="text-gray-800 text-sm leading-snug">🇷🇺 {{ ans.title.ru }}</p>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end">
                    <el-button type="primary" @click="viewVisible = false">Close</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
import { useQuestionStore } from '@/stores/questions'
import { DeleteFilled, EditPen, Search, View } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'

const questionStore = useQuestionStore()
const questions = computed(() => questionStore.questions)
const currentQuestion = computed(() => questionStore.currentQuestion?.data)
const loading = ref(false)
const viewVisible = ref(false)
const filters = reactive({
    page: 1,
    limit: 10,
    search: undefined as any,
    subjectId: null as string | null,
    ticketId: null as string | null,
})

const indexMethod = (index: number) => {
    return (filters.page - 1) * filters.limit + (index + 1)
}

const fetchQuestions = async () => {
    loading.value = true
    await questionStore.fetchQuestion(filters)
    loading.value = false
}
const handlePageChange = (page: number) => {
    filters.page = page
    fetchQuestions()
}

const openView = async (row: any) => {
    viewVisible.value = true
    await questionStore.viewQuestion(row.id)
}

function openCreateModal() {}

onMounted(() => {
    fetchQuestions()
})
</script>
