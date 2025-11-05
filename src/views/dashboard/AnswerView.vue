<template>
    <div>
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Answer</h2>
            <el-button type="primary" @click="openCreateModal">+ Add Answer</el-button>
        </div>
        <el-dialog v-model="createVisible" title="Create Answers" width="600px">
            <div v-for="(answer, index) in newAnswers" :key="index" class="mb-4 border p-3 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold text-gray-700">Variant {{ index + 1 }}</h4>
                    <el-button size="small" type="danger" plain @click="removeAnswer(index)">Delete</el-button>
                </div>

                <el-input v-model="answer.title.oz" placeholder="O‘zbek (lotin)" class="mb-2" />
                <el-input v-model="answer.title.uz" placeholder="Ўзбек (кир)" class="mb-2" />
                <el-input v-model="answer.title.ru" placeholder="Русский" class="mb-2" />

                <div class="flex items-center justify-between mt-2">
                    <el-checkbox v-model="answer.isCorrect" :disabled="!answer.isCorrect && hasCorrectAnswer" @change="setCorrect(answer)">
                        Correct
                    </el-checkbox>
                    <el-button size="small" type="success" plain @click="translateAnswer(answer)"> Translate 🌐 </el-button>
                </div>
            </div>

            <div class="flex justify-between mt-4">
                <el-button type="primary" plain @click="addNewAnswer">+ Add Variant</el-button>
                <el-button type="success" @click="saveAnswers">Save</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { useQuestionStore } from '@/stores/questions'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import { debounce } from 'lodash'

const questionStore = useQuestionStore()
const route = useRoute()
const translateData = computed(() => questionStore.translate)
const answerDetail = computed(() => questionStore.answerDetail)
const createVisible = ref(false)
const loading = ref(false)
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
    newAnswers.value.push({
        title: { oz: '', uz: '', ru: '' },
        isCorrect: false,
    })
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
        loading.value = true

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
        loading.value = false
    }
}, 500)

async function saveAnswers() {
    try {
        const cleanAnswers = toRaw(newAnswers.value).map((a) => ({
            ...a,
            title: { ...a.title },
            questionId: route.params.id as string,
        }))

        await questionStore.createAnswer(cleanAnswers)
        ElMessage.success('Answers created successfully!')
    } catch (err) {
        console.error('Save error:', err)
        ElMessage.error('Failed to save answers')
    }
}
onMounted(async () => {
    // const questionId = route.params.id as string
    // await questionStore.getAnswerDetail(questionId)
})
</script>
