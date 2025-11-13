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
                <el-select class="min-w-[150px]" v-model="filters.subjectId" placeholder="Select Subject" clearable @change="fetchQuestions">
                    <el-option v-for="item in [...subjectStore.getSubjectSelect]" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <el-select class="min-w-[150px]" v-model="filters.ticketId" placeholder="Select Ticket" clearable @change="fetchQuestions">
                    <el-option v-for="item in [...ticketStore.getTicketSelect]" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <el-button type="primary" @click="openCreateModal">+ Add Question</el-button>
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
            <el-table-column label="Answers" width="160" align="center">
                <template #default="{ row }">
                    <el-button size="small" type="success" plain @click="openAnswer(row)">View answer </el-button>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="200" align="center">
                <template #default="{ row }">
                    <div class="flex items-center justify-center gap-2">
                        <el-button size="small" plain @click="openView(row)">
                            <el-icon><View /></el-icon>
                        </el-button>
                        <el-button size="small" type="primary" plain @click="openEditModal(row)">
                            <el-icon><EditPen /></el-icon>
                        </el-button>
                        <el-button size="small" type="danger" plain @click="confirmDelete(row)">
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

                <el-divider v-if="currentQuestion && currentQuestion.answers && currentQuestion.answers.length" />

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
                <div v-if="currentQuestion?.file?.path" class="mt-3">
                    <span class="font-medium text-gray-600">Attached file:</span>
                    <img :src="`https://timedu.uz${currentQuestion.file.path}`" alt="file" class="mt-2 rounded-lg border max-h-[200px]" />
                </div>
            </div>
            <el-divider v-if="currentQuestion && currentQuestion.answers && currentQuestion.answers.length" />
            <div v-if="currentQuestion && currentQuestion.answers && currentQuestion.answers.length">
                <h4 class="font-semibold text-gray-800 my-2">Answers:</h4>
                <div
                    v-for="(ans, i) in currentQuestion?.answers"
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
            <div v-if="currentQuestion && currentQuestion.info">
                <h4 class="font-semibold text-gray-800 my-2">Info:</h4>
                <div>
                    <p class="text-gray-800 text-sm leading-snug">🇺🇿 {{ currentQuestion.info.oz }}</p>
                    <p class="text-gray-800 text-sm leading-snug">🇺🇿 {{ currentQuestion.info.uz }}</p>
                    <p class="text-gray-800 text-sm leading-snug">🇷🇺 {{ currentQuestion.info.ru }}</p>
                </div>
            </div>
        </el-dialog>

        <el-dialog :title="isEditing ? 'Edit Question' : 'Add Question'" v-model="isModalOpen" width="500px">
            <div>
                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-position="top" v-loading="loading">
                    <el-form-item label="Select ticket" prop="ticketId">
                        <el-select v-model="ruleForm.ticketId" placeholder="Select a ticket">
                            <el-option v-for="item in ticketStore.getTicketSelect" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Select subject" prop="subjectId">
                        <el-select v-model="ruleForm.subjectId" placeholder="Select a subject">
                            <el-option v-for="item in subjectStore.getSubjectSelect" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Name (O‘zbekcha)" prop="title.oz" class="relative">
                        <el-input
                            type="textarea"
                            v-model="ruleForm.title.oz"
                            placeholder="O‘zbekcha matn kiriting..."
                            :rows="4"
                            clearable
                            @clear="clearTranslations"
                        >
                        </el-input>
                        <button
                            :disabled="!ruleForm.title.oz"
                            type="button"
                            @click="translateTitle"
                            :class="ruleForm.title.oz ? 'text-[#326CFF] cursor-pointer' : 'text-gray-400 cursor-not-allowed'"
                            class="absolute right-3 top-[-35px] flex items-center justify-center"
                            title="Translate"
                        >
                            Translate 🌐
                        </button>
                    </el-form-item>

                    <el-form-item label="Question (Kirill)" prop="title.uz">
                        <el-input type="textarea" v-model="ruleForm.title.uz" placeholder="Tarjima (Kirill)" :rows="4" readonly />
                    </el-form-item>

                    <el-form-item label="Question (Ruscha)" prop="title.ru">
                        <el-input type="textarea" v-model="ruleForm.title.ru" placeholder="Tarjima (Ruscha)" :rows="4" readonly />
                    </el-form-item>
                    <el-form-item label="Info (O‘zbekcha)" prop="info.oz" class="relative">
                        <el-mention type="textarea" v-model="ruleForm.info.oz" placeholder="Tarjima (Uzbek)" />
                        <button
                            :disabled="!ruleForm.info.oz"
                            type="button"
                            @click="translateInfo"
                            :class="ruleForm.info.oz ? 'text-[#326CFF] cursor-pointer' : 'text-gray-400 cursor-not-allowed'"
                            class="absolute right-3 top-[-35px] flex items-center justify-center"
                            title="Translate"
                        >
                            Translate 🌐
                        </button>
                    </el-form-item>

                    <el-form-item label="Info (Кирил)" prop="info.uz">
                        <el-mention type="textarea" v-model="ruleForm.info.uz" placeholder="Tarjima (Kirill)" />
                    </el-form-item>

                    <el-form-item label="Info (Русский)" prop="info.ru">
                        <el-mention type="textarea" v-model="ruleForm.info.ru" placeholder="Tarjima (Ruscha)" />
                    </el-form-item>
                    <el-form-item prop="fileId" label="Attach document" class="w-full">
                        <AppUpload @upload="(file) => (ruleForm.fileId = file?.data?.id)" @remove="ruleForm.fileId = null">
                            <el-button class="!h-12 !text-sm !font-semibold w-full !justify-start hover:shadow-lg">
                                <svg width="24" height="24" class="mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5 12H12M12 12H19M12 12V5M12 12V19"
                                        stroke="#326CFF"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                                Press here to upload your file
                            </el-button>
                        </AppUpload>
                    </el-form-item>
                </el-form>
            </div>

            <div class="flex items-center justify-between gap-3 mt-4">
                <el-button class="w-full" size="large" @click="isModalOpen = false"> Cancel </el-button>
                <el-button class="w-full" size="large" type="primary" @click="submitForm(ruleFormRef)">
                    {{ isEditing ? 'Save Changes' : 'Add Question' }}
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
import { useQuestionStore } from '@/stores/questions'
import { DeleteFilled, EditPen, Refresh, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { debounce } from 'lodash'
import { useSubjectStore } from '@/stores/subjects'
import { useTicketStore } from '@/stores/ticket'
import AppUpload from '@/components/common/fileUpload.vue'
import { useRouter } from 'vue-router'

export interface IFile {
    id: string
    name: string
    size: number
    type: string
    created_at: Date
    bucket_name: string
}

const questionStore = useQuestionStore()
const subjectStore = useSubjectStore()
const ticketStore = useTicketStore()
const questions = computed(() => questionStore.questions)
const currentQuestion = computed(() => questionStore.currentQuestion?.data)
const translateData = computed(() => questionStore.translate)
const ruleFormRef = ref<FormInstance>()
const loading = ref(false)
const viewVisible = ref(false)
const isModalOpen = ref(false)
const isEditing = ref(false)
const router = useRouter()
const editingId = ref<string | null>(null)
const filters = reactive({
    page: 1,
    limit: 10,
    search: undefined as any,
    subjectId: undefined as any,
    ticketId: undefined as any,
})

const ruleForm = reactive({
    ticketId: '',
    subjectId: '',
    title: {
        uz: '',
        oz: '',
        ru: '',
    },
    info: {
        uz: '',
        oz: '',
        ru: '',
    },
    fileId: null as any,
})

const rules = reactive<FormRules>({
    ticketId: [
        {
            required: true,
            message: 'Iltimos, biletni tanlang',
            trigger: 'change',
        },
    ],
    subjectId: [
        {
            required: true,
            message: 'Iltimos, mavzuni tanlang',
            trigger: 'change',
        },
    ],
    'name.oz': [{ required: true, message: 'O‘zbekcha nom kiritish majburiy', trigger: 'blur' }],
    'name.uz': [{ required: true, message: 'Кириллча ном кiритиш мажбурий', trigger: 'blur' }],
    'name.ru': [{ required: true, message: 'Введите русское название', trigger: 'blur' }],
    'info.oz': [{ required: true, message: 'O‘zbekcha nom kiritish majburiy', trigger: 'blur' }],
    'info.uz': [{ required: true, message: 'Кириллча ном кiритиш мажбурий', trigger: 'blur' }],
    'info.ru': [{ required: true, message: 'Введите русское название', trigger: 'blur' }],
})
const indexMethod = (index: number) => {
    return (filters.page - 1) * filters.limit + (index + 1)
}
const clearTranslations = () => {
    ruleForm.title.uz = ''
    ruleForm.title.ru = ''
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

function openAnswer(row: any) {
    if (!row?.id) return
    router.push({
        name: 'answer',
        params: { id: row.id },
    })
}

function openCreateModal() {
    isEditing.value = false
    resetForm()
    isModalOpen.value = true
}

function openEditModal(data: any) {
    isEditing.value = true
    editingId.value = data.id
    Object.assign(ruleForm, {
        title: {
            oz: data.title?.oz ?? '',
            uz: data.title?.uz ?? '',
            ru: data.title?.ru ?? '',
        },
        info: {
            oz: data.info?.oz ?? '',
            uz: data.info?.uz ?? '',
            ru: data.info?.ru ?? '',
        },
        ticketId: data.ticket?.id ?? ruleForm.ticketId,
        subjectId: data.subject?.id ?? ruleForm.subjectId,
        fileId: data.file?.id ?? ruleForm.fileId,
    })
    isModalOpen.value = true
}
function confirmDelete(question: any) {
    ElMessageBox.confirm(`Are you sure you want to delete "${question.title?.name?.uz}"?`, 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    })
        .then(async () => {
            loading.value = true
            await questionStore.deleteQuestion(question.id)
            ElMessage.success('Question deleted successfully')
            await fetchQuestions()
            loading.value = false
        })
        .catch((error: any) => {
            console.log(error)
            ElMessage.error('Question deleted error')
        })
}

function resetForm() {
    ruleForm.title.oz = ''
    ruleForm.title.uz = ''
    ruleForm.title.ru = ''
    ruleForm.info.oz = ''
    ruleForm.info.uz = ''
    ruleForm.info.ru = ''
    ;(ruleForm.fileId = null), (ruleForm.subjectId = ''), (ruleForm.ticketId = '')
}

const translateTitle = debounce(async () => {
    const text = ruleForm.title.oz
    if (!text) return

    try {
        loading.value = true

        const payload = {
            text,
            sourceLanguage: 'uz',
        }
        await questionStore.fetchTranslateText(payload)
        ruleForm.title.oz = translateData?.value?.data?.translations?.oz
        ruleForm.title.uz = translateData?.value?.data?.translations?.uz
        ruleForm.title.ru = translateData?.value?.data?.translations?.ru
    } catch (err) {
        console.error(err)
        ElMessage.error('Translation failed')
    } finally {
        loading.value = false
    }
}, 500)

const translateInfo = debounce(async () => {
    const text = ruleForm.info.oz
    if (!text) return

    try {
        loading.value = true

        const payload = {
            text,
            sourceLanguage: 'uz',
        }
        await questionStore.fetchTranslateText(payload)
        ruleForm.info.oz = translateData?.value?.data?.translations?.oz
        ruleForm.info.uz = translateData?.value?.data?.translations?.uz
        ruleForm.info.ru = translateData?.value?.data?.translations?.ru
    } catch (err) {
        console.error(err)
        ElMessage.error('Translation failed')
    } finally {
        loading.value = false
    }
}, 500)

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (!valid) return
        try {
            loading.value = true
            if (isEditing.value && editingId.value) {
                await questionStore.updateQuestion(editingId.value, {
                    ...ruleForm,
                })
                ElMessage.success('Subject updated successfully')
            } else {
                await questionStore.createQuestion({
                    ...ruleForm,
                })
                ElMessage.success('Subject created successfully')
            }
            await fetchQuestions()
            isModalOpen.value = false
        } catch (error) {
            console.error(error)
            ElMessage.error('Error while saving subject')
        } finally {
            loading.value = false
        }
    })
}

onMounted(() => {
    fetchQuestions()

    if (!ticketStore.getTicketSelect.length) {
        ticketStore.fetchTickets({ page: 1, limit: 100 } as any)
    }
    if (!subjectStore.getSubjectSelect.length) {
        subjectStore.fetchSubjects({ page: 1, limit: 100 } as any)
    }
})
</script>
