import { useExamStore } from '@/stores'
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'

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
    info?: { [key: string]: string }
}

export interface Subject {
    id: string
    name?: string
    title?: { [key: string]: string }
}

export type ExamType = 'ticket' | 'topic' | 'exam'

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

export function useExam(questionsData: Question[], examType: ExamType = 'ticket', examId?: string, sessionId?: string, timeLimitMinutes?: number) {
    const examStore = useExamStore()

    const questionLimit = examType === 'ticket' ? 20 : questionsData.length
    const questions = ref<Question[]>(questionsData?.slice(0, questionLimit) || [])
    const examTypeRef = ref<ExamType>(examType)
    const sessionIdRef = ref<string>(sessionId || '')
    const STORAGE_KEY = `exam_state_${examType}_${questions.value[0]?.id || 'default'}`

    const loadState = (): ExamState | null => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) return null

            const state: ExamState = JSON.parse(saved)

            if (state.finished) {
                localStorage.removeItem(STORAGE_KEY)
                return null
            }

            const currentQuestionIds = questions.value.map((q) => q.id)
            const savedQuestionIds = state.questionIds || []

            const isSameQuestions =
                currentQuestionIds.length === savedQuestionIds.length && currentQuestionIds.every((id, index) => id === savedQuestionIds[index])

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
    const totalSeconds = (timeLimitMinutes ?? 60) * 60
    const savedState = loadState()

    const currentIndex = ref(savedState?.currentIndex ?? 0)
    const currentPage = ref(savedState?.currentPage ?? 1)
    const selectedAnswer = ref<string | null>(savedState?.selectedAnswer ?? null)
    const timeLeft = ref(savedState?.timeLeft ?? totalSeconds)
    const initialTime = ref(totalSeconds)
    const finished = ref(savedState?.finished ?? false)
    const userAnswers = ref<Map<number, UserAnswer>>(savedState?.userAnswers ? new Map(savedState.userAnswers) : new Map())

    let timer: NodeJS.Timeout | null = null

    const saveState = () => {
        if (finished.value) {
            localStorage.removeItem(STORAGE_KEY)
            return
        }

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
            currentPage.value = currentIndex.value + 1

            const nextAnswer = userAnswers.value.get(currentIndex.value)
            selectedAnswer.value = nextAnswer?.answerId || null
        }
    }

    async function submitResult() {
        try {
            if (examTypeRef.value === 'exam' || examTypeRef.value === 'topic' || examTypeRef.value === 'ticket') {
                const correctQuestionIds: string[] = []

                userAnswers.value.forEach((answer) => {
                    if (answer.isCorrect === true) {
                        correctQuestionIds.push(answer.questionId)
                    }
                })

                const payload = {
                    correctQuestionIds: correctQuestionIds,
                }
                const response = await examStore.fetchExamResult(payload, sessionIdRef.value)
                console.log('✅ Natija muvaffaqiyatli yuborildi:', response)
                return response
            } else {
                const timeSpent = initialTime.value - timeLeft.value

                const answersArray = Array.from(userAnswers.value.entries()).map(([index, answer]) => ({
                    questionId: answer.questionId,
                    answerId: answer.answerId,
                    isCorrect: answer.isCorrect,
                }))

                const payload = {
                    type: examTypeRef.value,
                    id: examId || '',
                    correctAnswers: score.value,
                    totalQuestions: totalQuestions.value,
                    score: Math.round((score.value / totalQuestions.value) * 100),
                    timeSpent: timeSpent,
                    answers: answersArray,
                }

                console.log(`📤 ${examTypeRef.value} natijasi yuborilmoqda:`, payload)
                return payload
            }
        } catch (error) {
            console.error('❌ Natija yuborishda xatolik:', error)
            throw error
        }
    }

    async function finishExam() {
        if (timer) clearInterval(timer)
        finished.value = true

        try {
            await submitResult()
        } catch (error) {
            console.error('Natija yuborishda xatolik:', error)
            throw error
        }

        localStorage.removeItem(STORAGE_KEY)
        nextTick(() => {
            localStorage.removeItem(STORAGE_KEY)
        })
    }

    function restart() {
        currentIndex.value = 0
        currentPage.value = 1
        selectedAnswer.value = null
        finished.value = false
        timeLeft.value = 3600
        userAnswers.value.clear()

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

    function cleanup() {
        if (timer) clearInterval(timer)
        if (finished.value) {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    watch(currentIndex, (newIndex) => {
        currentPage.value = newIndex + 1
    })

    onUnmounted(() => {
        cleanup()
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
        submitResult,
        cleanup,
        examType: examTypeRef,
    }
}
