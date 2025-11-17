<template>
    <div class="p-6 w-full bg-gradient-to-tr from-[#0061FF] to-[#3C89FF] min-h-screen">
        <div v-if="loading" class="p-6">
            <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="finished" class="flex flex-col items-center justify-center min-h-[70vh] py-10">
            <div class="relative p-10 text-center max-w-md w-full animate-fadeIn">
                <div class="flex justify-center mb-6">
                    <div class="w-20 h-20 rounded-full bg-[#D2FFE0] flex items-center justify-center shadow-inner animate-bounceIn">
                        <svg class="w-10 h-10 text-[#18BB49]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h2 class="text-3xl font-bold text-[#fff] mb-2">
                    {{ t('test.exam_finished') }}
                </h2>
                <p class="text-white mb-6">{{ t('test.great_job') || 'Great job, keep it up!' }}</p>

                <div class="relative flex justify-center items-center mb-8">
                    <div class="w-36 h-36 rounded-full border-[10px] border-gray-200 flex items-center justify-center relative">
                        <div
                            class="absolute w-36 h-36 rounded-full border-[10px] border-green-500"
                            :style="{ clipPath: 'inset(' + (100 - (score / totalQuestions) * 100) + '% 0 0 0)' }"
                        ></div>
                        <div class="text-center">
                            <p class="text-4xl font-extrabold text-white">{{ ((score / totalQuestions) * 100).toFixed(0) }}%</p>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <p class="text-xl text-white mb-1">
                        {{ t('test.correct_answers') }}: <span class="font-bold text-[#18BB49]">{{ score }}</span> /
                        <span class="text-white">{{ totalQuestions }}</span>
                    </p>
                </div>

                <div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                    <el-button size="large" class="!px-8 !rounded-full !text-white !border-none !bg-[#18BB49]" @click="goToTopics">
                        {{ t('app.home') }}
                    </el-button>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="flex justify-between items-center mb-4">
                <div class="flex flex-col gap-2">
                    <h2 class="text-lg font-semibold text-white">{{ t('test.question') }} {{ currentIndex + 1 }}/{{ totalQuestions }}</h2>
                </div>
                <div class="flex items-center gap-4">
                    <el-tag :type="getTimerType()" size="large" class="!text-base !text-[#0061FF] !font-semibold">
                        ⏱ {{ formatTime(timeLeft) }}
                    </el-tag>
                    <el-button type="success" size="large" class="flex-1 w-full !ml-0 mt-4 md:mt-0 !bg-[#18BB49] !border-none" @click="finishExam">
                        {{ t('test.finish_exam') }}
                    </el-button>
                </div>
            </div>
            <div class="border-white bg-[#FF2D55] p-5 rounded-lg shadow-sm border mb-4">
                <p class="text-white font-bold text-lg mb-4">
                    {{ currentQuestion?.title?.[lang] || 'Savol yuklanmoqda...' }}
                </p>
            </div>
            <div class="grid gap-6 md:grid-cols-3 grid-cols-1">
                <div class="mb-4">
                    <div class="space-y-3">
                        <div
                            v-for="(option, i) in currentQuestion?.answers || []"
                            :key="option.id"
                            class="flex items-center gap-3 border rounded-lg px-4 py-3 transition-all cursor-pointer"
                            :class="answerClass(option.id)"
                            @click="selectAnswer(option.id)"
                        >
                            <span class="font-semibold text-white min-w-[40px] bg-[#0061FF] w-[40px] h-[40px] flex items-center justify-center"
                                >F{{ i + 1 }}.</span
                            >
                            <span class="text-white">{{ option.title?.[lang] }}</span>
                        </div>
                    </div>
                    <el-button
                        size="large"
                        class="flex-1 w-full mt-4"
                        :disabled="!selectedAnswer && !isCurrentQuestionAnswered"
                        @click="nextQuestion"
                    >
                        {{ t('test.next') }} <el-icon> <Right /></el-icon>
                    </el-button>
                </div>
                <div class="col-span-2">
                    <div class="p-5 mb-4 flex flex-col overflow-hidden shadow-sm border border-[#fff] rounded-xl">
                        <img
                            v-if="currentQuestion?.file?.path"
                            :src="getImageUrl(currentQuestion.file.path)"
                            :alt="currentQuestion.file.name || 'Question Image'"
                            class="w-full h-[500px] object-contain rounded-lg"
                        />
                        <img v-else :src="DefaultImage" alt="" class="w-full h-[500px] object-contain rounded-lg" />
                    </div>
                    <div v-if="totalQuestions > 0" class="mt-5">
                        <div class="flex flex-wrap gap-2 justify-center mb-2">
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
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useExamStore } from '@/stores'
import { Right } from '@element-plus/icons-vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultImage from '@/assets/images/default-image.svg'
import { useExam } from '@/composables'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const { t, locale } = useI18n()
const lang = computed(() => locale.value as any)
const loading = ref(false)
const router = useRouter()
const examStore = useExamStore()

const totalQuestions = computed(() => exam.value?.totalQuestions ?? 0)
const exam = ref<ReturnType<typeof useExam> | null>(null)
const currentQuestion = computed(() => exam.value?.currentQuestion || null)
const currentIndex = computed(() => exam.value?.currentIndex ?? 0)
const selectedAnswer = computed(() => exam.value?.selectedAnswer ?? null)
const timeLeft = computed(() => exam.value?.timeLeft ?? 0)
const isCurrentQuestionAnswered = computed(() => exam.value?.isCurrentQuestionAnswered ?? false)
const finished = computed(() => exam.value?.finished ?? false)
const currentQuestionIndex = ref(0)
const score = computed(() => exam.value?.score ?? 0)

const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const selectAnswer = (answerId: string) => {
    if (isCurrentQuestionAnswered.value) return
    exam.value?.selectAnswer(answerId)
    setTimeout(() => {
        exam.value?.nextQuestion()
    }, 500)
}

const nextQuestion = () => {
    if (currentIndex.value >= totalQuestions.value - 1) {
        return
    }
    exam.value?.nextQuestion()
}

const getTimerType = () => {
    if (timeLeft.value < 300) return 'danger'
    if (timeLeft.value < 600) return 'warning'
    return 'success'
}

const finishExam = async () => {
    try {
        await exam.value?.finishExam()
        ElMessage.success(t('test.result_submitted_successfully'))
    } catch (error) {
        console.error('Natija yuborishda xatolik:', error)
        ElMessage.error(t('test.result_submission_failed'))
    }
}
const goToTopics = () => {
    router.push('/')
}

const restart = () => {
    exam.value?.restart()
}

const handlePageChange = (page: number) => {
    exam.value?.jumpToQuestion(page - 1)
}

const answerClass = (answerId: string): string => {
    const isAnswered = isCurrentQuestionAnswered.value
    const answer = currentQuestion.value?.answers?.find((a) => a.id === answerId)
    const isSelected = answerId === selectedAnswer.value

    if (isAnswered) {
        if (isSelected) {
            return answer?.isCorrect ? 'border-[#18BB49] bg-[#18BB49] cursor-not-allowed' : 'border-[#FF2D55] bg-[#FF2D55] cursor-not-allowed'
        }

        if (answer?.isCorrect) {
            return 'border-[#18BB49] bg-[#18BB49] cursor-not-allowed'
        }

        return 'border-gray-200 opacity-50 cursor-not-allowed'
    }

    if (isSelected) {
        return 'border-blue-500 bg-blue-500 cursor-pointer hover:shadow-md'
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
        default:
            baseClass = 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
    }

    if (isCurrent) {
        baseClass += 'ring-2 inset-ring scale-110'
    }

    return baseClass
}
const handleKeyPress = (event: KeyboardEvent) => {
    const fKeyMap: Record<string, number> = {
        F1: 0,
        F2: 1,
        F3: 2,
        F4: 3,
        F5: 4,
    }

    if (event.key in fKeyMap) {
        event.preventDefault()

        const index = fKeyMap[event.key]
        const answers = currentQuestion.value?.answers || []

        if (answers[index]) {
            selectAnswer(answers[index].id)
        }
    }

    if (event.key >= '1' && event.key <= '5') {
        const index = parseInt(event.key) - 1
        const answers = currentQuestion.value?.answers || []

        if (answers[index]) {
            selectAnswer(answers[index].id)
        }
    }
}

const getImageUrl = (path: string): string => {
    if (!path) return ''
    return path.startsWith('http') ? path : `https://timedu.uz${path}`
}

onMounted(async () => {
    window.addEventListener('keydown', handleKeyPress)
    loading.value = true
    await examStore.fetchExamStart({ type: 'RANDOM' })
    const sessionId = examStore.exams?.data?.id || examStore.exams?.data?.sessionId
    const timeLimit = examStore.exams?.data?.timeLimit
    const ExamQuestions = examStore.exams?.data?.questions
    if (ExamQuestions && ExamQuestions.length > 0) {
        exam.value = useExam(ExamQuestions, 'exam', undefined, sessionId, timeLimit)
    }
    loading.value = false
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyPress)
    exam.value?.cleanup()
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
