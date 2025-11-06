<template>
    <div>
        <div class="flex items-end justify-between mb-4">
            <div>
                <el-button
                    type="text"
                    plain
                    @click="router.push('/admin/question')"
                    class="!p-0 flex items-center text-gray-600 hover:text-blue-600 transition"
                >
                    <el-icon><ArrowLeftBold /></el-icon>
                    <span class="ml-1 text-sm">Back</span>
                </el-button>
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Answers</h2>
            </div>
            <el-button type="primary" @click="openCreateModal">+ Add Answer</el-button>
        </div>
        <h4 class="text-xl font-semibold text-gray-800 mb-4">{{ answerDetail[0]?.question?.subject?.name?.oz }}</h4>
        <div v-if="answerDetail?.length">
            <el-table style="width: 100%" class="whiteStripe" v-loading="loading" :data="answerDetail">
                <el-table-column type="index" label="#" width="50" />

                <el-table-column label="O‘zbek (Lotin)" prop="title.oz" min-width="200">
                    <template #default="{ row }">
                        <span>{{ row.title?.oz }}</span>
                    </template>
                </el-table-column>

                <el-table-column label="To‘g‘ri javob" align="center" width="140">
                    <template #default="{ row }">
                        <el-tag v-if="row.isCorrect" type="success" effect="dark" class="uppercase font-semibold"> ✅ </el-tag>
                        <el-tag v-else type="info" effect="light">–</el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="Actions" align="center" width="160">
                    <template #default="{ row }">
                        <div class="flex items-center justify-center gap-2">
                            <el-button size="small" type="primary" plain @click="openEditModal(row)">
                                <el-icon><EditPen /></el-icon>
                            </el-button>
                            <el-button size="small" type="danger" plain @click="deleteAnswer(row.id)">
                                <el-icon><DeleteFilled /></el-icon>
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="createVisible" :title="isEditMode ? 'Edit Answer' : 'Create Answers'" width="600px">
            <div v-for="(answer, index) in newAnswers" :key="index" class="mb-4 border p-3 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold text-gray-700">Variant {{ index + 1 }}</h4>
                    <el-button v-if="!isEditMode" size="small" type="danger" plain @click="removeAnswer(index)">Delete</el-button>
                </div>

                <el-input v-model="answer.title.oz" placeholder="O‘zbek (lotin)" class="mb-2" />
                <el-input v-model="answer.title.uz" placeholder="Ўзбек (кир)" class="mb-2" />
                <el-input v-model="answer.title.ru" placeholder="Русский" class="mb-2" />

                <div class="flex items-center justify-between mt-2">
                    <el-checkbox v-model="answer.isCorrect" :disabled="!answer.isCorrect && hasCorrectAnswer" @change="setCorrect(answer)">
                        Correct
                    </el-checkbox>
                    <el-button size="small" type="success" plain @click="translateAnswer(answer)" :loading="translateLoading">
                        Translate 🌐
                    </el-button>
                </div>
            </div>

            <div class="flex justify-between mt-4">
                <el-button type="primary" v-if="!isEditMode" plain @click="addNewAnswer">+ Add Variant</el-button>
                <el-button type="success" @click="saveAnswers">{{ isEditMode ? 'Update' : 'Save' }}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { useQuestionStore } from '@/stores/questions'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'
import { ArrowLeftBold, DeleteFilled, EditPen, View } from '@element-plus/icons-vue'

const questionStore = useQuestionStore()
const route = useRoute()
const router = useRouter()
const translateData = computed(() => questionStore.translate)
const answerDetail = computed(() => questionStore.answerDetail?.data)
const createVisible = ref(false)
const loading = ref(false)
const translateLoading = ref(false)
const isEditMode = ref(false)
const editingAnswerId = ref<string | null>(null)
const newAnswers = ref([
    {
        title: { oz: '' as string, uz: '' as string, ru: '' as string },
        isCorrect: false,
    },
])

const openCreateModal = () => {
    createVisible.value = true
}

const addNewAnswer = () => {
    isEditMode.value = false
    editingAnswerId.value = null
    newAnswers.value.push({
        title: { oz: '', uz: '', ru: '' },
        isCorrect: false,
    })
}
const openEditModal = (row: any) => {
    isEditMode.value = true
    editingAnswerId.value = row.id
    newAnswers.value = [
        {
            title: { ...row.title },
            isCorrect: row.isCorrect,
        },
    ]
    createVisible.value = true
}

const removeAnswer = (index: number) => {
    newAnswers.value.splice(index, 1)
}
const hasCorrectAnswer = computed(() => newAnswers.value.some((a) => a.isCorrect))

function setCorrect(selectedAnswer: any) {
    newAnswers.value.forEach((a) => {
        if (a !== selectedAnswer) a.isCorrect = false
    })
}

const translateAnswer = debounce(async (answer: any) => {
    const text = answer.title.oz
    if (!text) return

    try {
        translateLoading.value = true

        const payload = {
            text,
            sourceLanguage: 'uz',
        }

        await questionStore.fetchTranslateText(payload)

        answer.title.oz = translateData.value?.data?.translations?.oz || text
        answer.title.uz = translateData.value?.data?.translations?.uz || text
        answer.title.ru = translateData.value?.data?.translations?.ru || text
    } catch (err) {
        console.error(err)
        ElMessage.error('Translation failed')
    } finally {
        translateLoading.value = false
    }
}, 500)

async function saveAnswers() {
    try {
        const answers = toRaw(newAnswers.value).map((a) => ({
            isCorrect: a.isCorrect,
            title: { ...a.title },
        }))
        const payload = {
            questionId: route.params.id as string,
            answers,
        }
        if (isEditMode.value && editingAnswerId.value) {
            await questionStore.updateAnswer(editingAnswerId.value, { ...answers[0] })
            ElMessage.success('Answer updated successfully!')
        } else {
            await questionStore.createAnswer(payload)
            ElMessage.success('Answers created successfully!')
        }
        fetchList()
        createVisible.value = false
    } catch (err) {
        console.error('Save error:', err)
        ElMessage.error('Failed to save answers')
    }
}
const deleteAnswer = async (id: string) => {
    try {
        await ElMessageBox.confirm('Are you sure to delete this answer?', 'Confirm', {
            type: 'warning',
        })
        await questionStore.deleteAnswer(id)
        ElMessage.success('Answer deleted!')
        fetchList()
    } catch (err) {
        console.error(err)
    }
}
const fetchList = async () => {
    const questionId = route.params.id as string
    await questionStore.getAnswerDetail(questionId)
}
onMounted(async () => {
    fetchList()
})
</script>
