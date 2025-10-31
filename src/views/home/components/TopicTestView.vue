<template>
    <div class="p-6">
        <!-- Loading -->
        <div v-if="loading" class="p-6">
            <el-skeleton :rows="5" animated />
        </div>

        <!-- Exam Finished -->
        <div v-else-if="finished" class="flex flex-col items-center justify-center h-full py-10">
            <div class="text-center bg-white p-8 rounded-lg shadow-lg">
                <h2 class="text-3xl font-bold text-green-600 mb-4">✅ {{ t('test.exam_finished') }}</h2>
                <div class="mb-6">
                    <p class="text-xl text-gray-700 mb-2">
                        {{ t('test.your_score') }}: <span class="font-bold text-blue-600">{{ score }}/{{ totalQuestions }}</span>
                    </p>
                    <p class="text-lg text-gray-600">
                        {{ t('test.percentage') }}: <span class="font-semibold">{{ ((score / totalQuestions) * 100).toFixed(1) }}%</span>
                    </p>
                </div>
                <el-button type="primary" size="large" @click="restart">
                    {{ t('test.restart') }}
                </el-button>
                <el-button type="success" size="large" @click="goToTopics">
                    {{ t('app.topic_list') }}
                </el-button>
            </div>
        </div>

        <!-- Quiz Content -->
        <div v-else>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold">{{ t('test.question') }} {{ currentIndex + 1 }}/{{ totalQuestions }}</h2>
                <el-tag :type="getTimerType()" size="large" class="text-sm !text-[#fff]"> ⏱ {{ formatTime(timeLeft) }} </el-tag>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Question Section -->
                <div>
                    <div class="bg-white p-5 rounded-lg shadow-sm border mb-4">
                        <p class="text-gray-800 font-medium text-lg mb-4">
                            {{ currentQuestion?.title?.[lang] || 'Savol yuklanmoqda...' }}
                        </p>

                        <div class="space-y-3">
                            <div
                                v-for="(option, i) in currentQuestion?.answers || []"
                                :key="option.id"
                                class="flex items-center gap-3 border rounded-lg px-4 py-3 transition-all"
                                :class="answerClass(option.id)"
                                @click="selectAnswer(option.id)"
                            >
                                <span class="font-semibold text-blue-600 min-w-[40px]"> F{{ i + 1 }}. </span>
                                <span class="text-gray-800">
                                    {{ option.title?.[lang] }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Next Button -->
                    <div class="flex gap-3 mt-4">
                        <el-button
                            type="primary"
                            size="large"
                            class="flex-1"
                            :disabled="!selectedAnswer && !isCurrentQuestionAnswered"
                            @click="nextQuestion"
                        >
                            {{ t('test.next') }} <el-icon> <Right /></el-icon>
                        </el-button>

                        <el-button type="success" size="large" class="flex-1" @click="finishExam">
                            {{ t('test.finish_exam') }}
                        </el-button>
                    </div>

                    <!-- Pagination with colored indicators -->
                    <div v-if="totalQuestions > 0" class="mt-6">
                        <div class="flex flex-wrap gap-2 justify-center mb-4">
                            <button
                                v-for="(_, index) in Array(totalQuestions)"
                                :key="index"
                                class="w-10 h-10 rounded-full font-semibold transition-all border-2"
                                :class="getPaginationButtonClass(index)"
                                @click="handlePageChange(index + 1)"
                            >
                                {{ index + 1 }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Image Section -->
                <div class="flex items-center justify-center">
                    <img
                        v-if="currentQuestion?.file?.path"
                        :src="getImageUrl(currentQuestion.file.path)"
                        :alt="currentQuestion.file.name || 'Question Image'"
                        class="max-h-[400px] w-full rounded-lg object-contain border shadow-sm"
                    />
                    <div v-else class="flex items-center justify-center h-[400px] border rounded-lg bg-gray-50">
                        <p class="text-gray-400">{{ t('test.no_image') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { useExam } from '@/composables/useTest'
import { useI18n } from 'vue-i18n'
import { ArrowRight, ArrowRightBold } from '@element-plus/icons-vue'

const route = useRoute()
const questionStore = useQuestionStore()
const { t, locale } = useI18n()

const lang = computed(() => locale.value)
const loading = ref(true)
const exam = ref<ReturnType<typeof useExam> | null>(null)
const router = useRouter()
// Computed properties
const currentQuestion = computed(() => exam.value?.currentQuestion || null)
const currentIndex = computed(() => exam.value?.currentIndex ?? 0)
const currentPage = computed(() => exam.value?.currentPage ?? 1)
const selectedAnswer = computed(() => exam.value?.selectedAnswer ?? null)
const timeLeft = computed(() => exam.value?.timeLeft ?? 0)
const finished = computed(() => exam.value?.finished ?? false)
const score = computed(() => exam.value?.score ?? 0)
const totalQuestions = computed(() => exam.value?.totalQuestions ?? 0)
const isCurrentQuestionAnswered = computed(() => exam.value?.isCurrentQuestionAnswered ?? false)

// Methods
const selectAnswer = (answerId: string) => {
    exam.value?.selectAnswer(answerId)
}

const nextQuestion = () => {
    exam.value?.nextQuestion()
}

const finishExam = () => {
    exam.value?.finishExam()
}
const goToTopics = () => {
    router.push('/topics')
}

const restart = () => {
    exam.value?.restart()
}

const handlePageChange = (page: number) => {
    exam.value?.jumpToQuestion(page - 1)
}

const getImageUrl = (path: string): string => {
    if (!path) return ''
    return path.startsWith('http') ? path : `https://timedu.uz${path}`
}

const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getTimerType = () => {
    if (timeLeft.value < 300) return 'danger'
    if (timeLeft.value < 600) return 'warning'
    return 'success'
}

const answerClass = (answerId: string): string => {
    const isAnswered = isCurrentQuestionAnswered.value

    if (isAnswered) {
        const answer = currentQuestion.value?.answers?.find((a) => a.id === answerId)
        if (answerId === selectedAnswer.value) {
            return answer?.isCorrect ? 'border-green-500 bg-green-50 cursor-not-allowed' : 'border-red-500 bg-red-50 cursor-not-allowed'
        }
        return 'border-gray-200 opacity-50 cursor-not-allowed'
    }

    if (answerId === selectedAnswer.value) {
        return 'border-blue-500 bg-blue-50 cursor-pointer hover:shadow-md'
    }

    return 'border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md'
}

const getPaginationButtonClass = (index: number): string => {
    const status = exam.value?.getQuestionStatus(index)
    const isCurrent = index === currentIndex.value

    let baseClass = ''

    switch (status) {
        case 'correct':
            baseClass = 'bg-green-500 text-white border-green-600'
            break
        case 'incorrect':
            baseClass = 'bg-red-500 text-white border-red-600'
            break
        case 'skipped':
            baseClass = 'bg-gray-300 text-gray-700 border-gray-400'
            break
        default: // unanswered
            baseClass = 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
    }

    if (isCurrent) {
        baseClass += ' ring-4 ring-blue-300 scale-110'
    }

    return baseClass
}

// Lifecycle
onMounted(async () => {
    try {
        const id = route.params.id as string
        await questionStore.fetchQuestionSubjectById(id)

        const questions = questionStore.questionSubjectId?.data
        if (questions && questions.length > 0) {
            exam.value = useExam(questions)
        }
    } catch (error) {
        console.error('Error loading questions:', error)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
button {
    cursor: pointer;
}

button:disabled {
    cursor: not-allowed;
}
</style>
