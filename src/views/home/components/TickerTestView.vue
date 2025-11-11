<template>
    <div class="p-6">
        <!-- Loading -->
        <div v-if="loading" class="p-6">
            <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="finished" class="flex flex-col items-center justify-center min-h-[70vh] py-10">
            <div class="relative p-10 text-center max-w-md w-full animate-fadeIn">
                <!-- Animated check icon -->
                <div class="flex justify-center mb-6">
                    <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-inner animate-bounceIn">
                        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h2 class="text-3xl font-bold text-gray-800 mb-2">
                    {{ t('test.exam_finished') }}
                </h2>
                <p class="text-gray-500 mb-6">{{ t('test.great_job') || 'Great job, keep it up!' }}</p>

                <!-- Score circle -->
                <div class="relative flex justify-center items-center mb-8">
                    <div class="w-36 h-36 rounded-full border-[10px] border-gray-200 flex items-center justify-center relative">
                        <div
                            class="absolute w-36 h-36 rounded-full border-[10px] border-green-500"
                            :style="{ clipPath: 'inset(' + (100 - (score / totalQuestions) * 100) + '% 0 0 0)' }"
                        ></div>
                        <div class="text-center">
                            <p class="text-4xl font-extrabold text-green-600">{{ ((score / totalQuestions) * 100).toFixed(0) }}%</p>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="mb-6">
                    <p class="text-xl text-gray-700 mb-1">
                        {{ t('test.correct_answers') }}: <span class="font-semibold text-blue-600">{{ score }}</span> /
                        <span class="text-gray-500">{{ totalQuestions }}</span>
                    </p>
                </div>

                <!-- Buttons -->
                <div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                    <el-button type="primary" size="large" class="!px-8 !rounded-full" @click="restart"> {{ t('test.restart') }} </el-button>
                    <el-button type="success" size="large" class="!px-8 !rounded-full" @click="goToTopics"> {{ t('app.ticket_list') }} </el-button>
                </div>
            </div>
        </div>

        <!-- Quiz Content -->
        <div v-else>
            <div class="flex justify-between items-center mb-4">
                <div class="flex flex-col gap-2">
                    <h1 class="text-xl font-bold capitalize">{{ subjectTitle || 'title' }}</h1>
                    <h2 class="text-lg font-semibold">{{ t('test.question') }} {{ currentIndex + 1 }}/{{ totalQuestions }}</h2>
                </div>
                <el-tag :type="getTimerType()" size="large" class="text-sm !text-[#fff]"> ⏱ {{ formatTime(timeLeft) }} </el-tag>
            </div>

            <div class="grid gap-6 md:grid-cols-[40%_60%] grid-cols-1">
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
                <div class="p-5 rounded-lg shadow-sm border mb-4 flex items-center justify-center overflow-hidden">
                    <img
                        v-if="currentQuestion?.file?.path"
                        :src="getImageUrl(currentQuestion.file.path)"
                        :alt="currentQuestion.file.name || 'Question Image'"
                        class="w-full h-full object-contain rounded-lg"
                    />
                    <img v-else :src="DefaultImage" alt="" />
                </div>
            </div>
            <div class="flex flex-col justify-center">
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
                <div class="flex gap-3 mt-4 min-w-[700px] justify-center items-center mx-auto">
                    <el-button
                        type="primary"
                        size="large"
                        class="flex-1 w-full"
                        :disabled="!selectedAnswer && !isCurrentQuestionAnswered"
                        @click="nextQuestion"
                    >
                        {{ t('test.next') }} <el-icon> <Right /></el-icon>
                    </el-button>

                    <el-button type="success" size="large" class="flex-1 w-full" @click="finishExam">
                        {{ t('test.finish_exam') }}
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useExam } from '@/composables'
import { useQuestionStore } from '@/stores/questions'
import DefaultImage from '@/assets/images/default-image.svg'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
const questionStore = useQuestionStore()
const route = useRoute()
const { t, locale } = useI18n()

const lang = computed(() => locale.value)
const loading = ref(true)
const router = useRouter()
const ticket = ref<ReturnType<typeof useExam> | null>(null)

const currentQuestion = computed(() => ticket.value?.currentQuestion || null)
const currentIndex = computed(() => ticket.value?.currentIndex ?? 0)
const currentPage = computed(() => ticket.value?.currentPage ?? 1)
const selectedAnswer = computed(() => ticket.value?.selectedAnswer ?? null)
const timeLeft = computed(() => ticket.value?.timeLeft ?? 0)
const finished = computed(() => ticket.value?.finished ?? false)
const score = computed(() => ticket.value?.score ?? 0)
const totalQuestions = computed(() => ticket.value?.totalQuestions ?? 0)
const isCurrentQuestionAnswered = computed(() => ticket.value?.isCurrentQuestionAnswered ?? false)

const subjectTitle = computed(() => {
    const subject = questionStore.questionTicketId?.data[0]
    return subject?.ticket?.name || subject?.name || ''
})

const selectAnswer = (answerId: string) => {
    ticket.value?.selectAnswer(answerId)

    if (currentIndex.value < totalQuestions.value - 1) {
        setTimeout(() => {
            nextQuestion()
        }, 2000)
    }
}
const nextQuestion = () => {
    if (currentIndex.value >= totalQuestions.value - 1) {
        return
    }
    ticket.value?.nextQuestion()
}

const finishExam = () => {
    ticket.value?.finishExam()
}
const goToTopics = () => {
    router.push('/tickets')
}

const restart = () => {
    ticket.value?.restart()
}

const handlePageChange = (page: number) => {
    ticket.value?.jumpToQuestion(page - 1)
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
    const answer = currentQuestion.value?.answers?.find((a) => a.id === answerId)
    const isSelected = answerId === selectedAnswer.value

    if (isAnswered) {
        if (isSelected) {
            return answer?.isCorrect ? 'border-green-500 bg-green-50 cursor-not-allowed' : 'border-red-500 bg-red-50 cursor-not-allowed'
        }

        if (answer?.isCorrect) {
            return 'border-green-500 bg-green-100 cursor-not-allowed'
        }

        return 'border-gray-200 opacity-50 cursor-not-allowed'
    }

    if (isSelected) {
        return 'border-blue-500 bg-blue-50 cursor-pointer hover:shadow-md'
    }

    return 'border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md'
}

const getPaginationButtonClass = (index: number): string => {
    const status = ticket.value?.getQuestionStatus(index)
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
        baseClass += ' ring-4 ring-blue-300 scale-110'
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

onMounted(async () => {
    window.addEventListener('keydown', handleKeyPress)
    try {
        const id = route.params.id as string
        await questionStore.fetchQuestionTicketById(id)

        const questions = questionStore.questionTicketId?.data
        if (questions && questions.length > 0) {
            ticket.value = useExam(questions, 'ticket')
        }
    } catch (error) {
        console.error('Error loading questions:', error)
    } finally {
        loading.value = false
    }
})
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyPress)
    ticket.value?.cleanup()
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
