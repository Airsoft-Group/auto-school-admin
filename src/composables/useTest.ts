import { ref, computed, onUnmounted, watch } from 'vue'

export interface Answer {
    id: string
    title: { [key: string]: string }
    isCorrect: boolean
}

export interface Question {
    id: string
    title: { [key: string]: string }
    answers: Answer[]
    file?: {
        path: string
        name?: string
    }
}

export interface Subject {
    id: string
    name?: string
    title?: { [key: string]: string }
}

export type ExamType = 'ticket' | 'topic'

export interface UserAnswer {
    questionId: string
    answerId: string | null
    isCorrect: boolean | null
}

interface ExamState {
    currentIndex: number
    currentPage: number
    selectedAnswer: string | null
    timeLeft: number
    finished: boolean
    userAnswers: [number, UserAnswer][]
    timestamp: number
    questionIds: string[]
    examType: ExamType
}

export function useExam(questionsData: Question[], examType: ExamType = 'ticket') {
    // Bilet uchun 20 ta, mavzu uchun hammasi
    const questionLimit = examType === 'ticket' ? 20 : questionsData.length
    const questions = ref<Question[]>(questionsData?.slice(0, questionLimit) || [])
    const examTypeRef = ref<ExamType>(examType)
    const STORAGE_KEY = `exam_state_${examType}_${questions.value[0]?.id || 'default'}`

    // LocalStorage'dan ma'lumotlarni yuklash
    const loadState = (): ExamState | null => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) return null

            const state: ExamState = JSON.parse(saved)

            // Savollar o'zgarganini tekshirish
            const currentQuestionIds = questions.value.map((q) => q.id)
            const savedQuestionIds = state.questionIds || []

            const isSameQuestions =
                currentQuestionIds.length === savedQuestionIds.length && currentQuestionIds.every((id, index) => id === savedQuestionIds[index])

            // Test turi o'zgarganini tekshirish
            const isSameExamType = state.examType === examType

            if (!isSameQuestions || !isSameExamType) {
                localStorage.removeItem(STORAGE_KEY)
                return null
            }

            return state
        } catch (error) {
            console.error('Error loading exam state:', error)
            localStorage.removeItem(STORAGE_KEY)
            return null
        }
    }

    const savedState = loadState()

    const currentIndex = ref(savedState?.currentIndex ?? 0)
    const currentPage = ref(savedState?.currentPage ?? 1)
    const selectedAnswer = ref<string | null>(savedState?.selectedAnswer ?? null)
    const timeLeft = ref(savedState?.timeLeft ?? 3600)
    const finished = ref(savedState?.finished ?? false)
    const userAnswers = ref<Map<number, UserAnswer>>(savedState?.userAnswers ? new Map(savedState.userAnswers) : new Map())

    let timer: NodeJS.Timeout | null = null

    // State'ni saqlash
    const saveState = () => {
        try {
            const state: ExamState = {
                currentIndex: currentIndex.value,
                currentPage: currentPage.value,
                selectedAnswer: selectedAnswer.value,
                timeLeft: timeLeft.value,
                finished: finished.value,
                userAnswers: Array.from(userAnswers.value.entries()),
                timestamp: Date.now(),
                questionIds: questions.value.map((q) => q.id),
                examType: examTypeRef.value,
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch (error) {
            console.error('Error saving exam state:', error)
        }
    }

    // Barcha o'zgarishlarni kuzatish
    watch(
        [currentIndex, currentPage, selectedAnswer, timeLeft, finished, userAnswers],
        () => {
            saveState()
        },
        { deep: true }
    )

    const currentQuestion = computed(() => {
        if (!Array.isArray(questions.value) || questions.value.length === 0) return null
        return questions.value[currentIndex.value] ?? null
    })

    const score = computed(() => {
        let correct = 0
        userAnswers.value.forEach((answer) => {
            if (answer.isCorrect === true) correct++
        })
        return correct
    })

    const totalQuestions = computed(() => questions.value.length)

    const isCurrentQuestionAnswered = computed(() => {
        return userAnswers.value.has(currentIndex.value)
    })

    const getQuestionStatus = (index: number) => {
        const answer = userAnswers.value.get(index)
        if (!answer) return 'unanswered'
        if (answer.answerId === null) return 'skipped'
        return answer.isCorrect ? 'correct' : 'incorrect'
    }

    function startTimer() {
        if (timer) clearInterval(timer)
        timer = setInterval(() => {
            if (timeLeft.value > 0 && !finished.value) {
                timeLeft.value--
            } else if (timeLeft.value === 0) {
                finishExam()
            }
        }, 1000)
    }

    function selectAnswer(answerId: string) {
        if (isCurrentQuestionAnswered.value) return

        selectedAnswer.value = answerId
    }

    function nextQuestion() {
        // Joriy javobni saqlash
        if (currentQuestion.value && selectedAnswer.value) {
            const answer = currentQuestion.value.answers.find((a) => a.id === selectedAnswer.value)

            userAnswers.value.set(currentIndex.value, {
                questionId: currentQuestion.value.id,
                answerId: selectedAnswer.value,
                isCorrect: answer ? answer.isCorrect : null,
            })
        }

        if (currentIndex.value < questions.value.length - 1) {
            currentIndex.value++
        } else {
            currentIndex.value = 0
        }

        currentPage.value = currentIndex.value + 1

        const nextAnswer = userAnswers.value.get(currentIndex.value)
        selectedAnswer.value = nextAnswer?.answerId || null
    }

    function finishExam() {
        if (timer) clearInterval(timer)
        finished.value = true
        // Test tugaganda localStorage'ni darhol tozalash
        localStorage.removeItem(STORAGE_KEY)
    }

    function restart() {
        currentIndex.value = 0
        currentPage.value = 1
        selectedAnswer.value = null
        finished.value = false
        timeLeft.value = 3600
        userAnswers.value.clear()

        // LocalStorage'ni tozalash
        localStorage.removeItem(STORAGE_KEY)

        startTimer()
    }

    function jumpToQuestion(index: number) {
        if (index >= 0 && index < questions.value.length) {
            currentIndex.value = index
            currentPage.value = index + 1

            const savedAnswer = userAnswers.value.get(index)
            selectedAnswer.value = savedAnswer?.answerId || null
        }
    }

    watch(currentIndex, (newIndex) => {
        currentPage.value = newIndex + 1
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
    })

    startTimer()

    return {
        currentQuestion,
        currentIndex,
        currentPage,
        questions,
        selectedAnswer,
        timeLeft,
        finished,
        userAnswers,
        score,
        totalQuestions,
        isCurrentQuestionAnswered,
        getQuestionStatus,
        selectAnswer,
        nextQuestion,
        restart,
        jumpToQuestion,
        finishExam,
        examType: examTypeRef,
    }
}
