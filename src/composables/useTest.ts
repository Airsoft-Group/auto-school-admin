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
    isSaved: boolean
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

// ExamState interface'ini yangilash kerak
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
    questionSlots?: [number, Question][] // Savollarni saqlash
}

export function useExam(questionsData: Question[], examType: ExamType = 'ticket', examId?: string, sessionId?: string, timeLimitMinutes?: number) {
    const examStore = useExamStore()

    const questionLimit = examType === 'ticket' ? 20 : questionsData.length
    const examTypeRef = ref<ExamType>(examType)
    const sessionIdRef = ref<string>(sessionId || '')

    // Barcha mavjud savollar
    const allQuestions = ref<Question[]>(questionsData || [])

    // Hozirgi test uchun tanlangan savollar
    const questions = ref<Question[]>([])

    // Har bir index uchun tanlangan savollarni saqlash
    const questionSlots = ref<Map<number, Question>>(new Map())

    const STORAGE_KEY = `exam_state_${examType}_${allQuestions.value[0]?.id || 'default'}`

    // Boshlang'ich savollarni yuklash
    const initializeQuestions = () => {
        const shuffled = [...allQuestions.value].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, questionLimit)

        selected.forEach((question, index) => {
            questionSlots.value.set(index, question)
        })

        questions.value = Array.from(questionSlots.value.values())
    }

    const loadState = (): ExamState | null => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) return null

            const state: ExamState = JSON.parse(saved)

            if (state.finished) {
                localStorage.removeItem(STORAGE_KEY)
                return null
            }

            // Saqlangan savollarni qayta yuklash
            if (state.questionSlots) {
                questionSlots.value = new Map(state.questionSlots)
                questions.value = Array.from(questionSlots.value.values())
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

    if (!savedState) {
        initializeQuestions()
    }

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
                questionSlots: Array.from(questionSlots.value.entries()),
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch (error) {
            console.error('Error saving exam state:', error)
        }
    }

    watch(
        [currentIndex, currentPage, selectedAnswer, timeLeft, finished, userAnswers, questionSlots],
        () => {
            saveState()
        },
        { deep: true }
    )

    const currentQuestion = computed(() => {
        const question = questionSlots.value.get(currentIndex.value)
        return question ?? null
    })

    const score = computed(() => {
        let correct = 0
        userAnswers.value.forEach((answer) => {
            if (answer.isCorrect === true) correct++
        })
        return correct
    })

    const totalQuestions = computed(() => questionSlots.value.size)

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

    function getRandomQuestion(currentIndex: number): Question {
        const oldQuestion = questionSlots.value.get(currentIndex)
        const usedIds = Array.from(questionSlots.value.values()).map((q) => q.id)
        let available = allQuestions.value.filter((q) => !usedIds.includes(q.id))

        if (available.length === 0) {
            available = allQuestions.value.filter((q) => q.id !== oldQuestion?.id)
        }

        if (available.length === 0) {
            return oldQuestion || allQuestions.value[0]
        }

        const randomIndex = Math.floor(Math.random() * available.length)
        const newQuestion = available[randomIndex]

        return newQuestion
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

        if (currentIndex.value < questionLimit - 1) {
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
        timeLeft.value = totalSeconds
        userAnswers.value.clear()
        questionSlots.value.clear()

        localStorage.removeItem(STORAGE_KEY)

        // Yangi savollarni yuklash
        initializeQuestions()

        startTimer()
    }

    function jumpToQuestion(index: number) {
        if (index >= 0 && index < questionLimit) {
            console.log('📍 Jumping to index:', index)

            // Agar bu savolga javob berilgan bo'lsa
            const isAnswered = userAnswers.value.has(index)

            if (isAnswered) {
                console.log('✅ Question already answered - keeping same question')
                // Javob berilgan bo'lsa, saqlangan javobni ko'rsatish
                const savedAnswer = userAnswers.value.get(index)
                selectedAnswer.value = savedAnswer?.answerId || null
            } else {
                console.log('🔄 Question not answered - loading random question')
                // Javob berilmagan bo'lsa, random savol ko'rsatish
                const randomQuestion = getRandomQuestion(index)

                // Vue reactivity uchun yangi Map yaratish
                const newSlots = new Map(questionSlots.value)
                newSlots.set(index, randomQuestion)
                questionSlots.value = newSlots

                // questions array'ni ham yangilash
                questions.value = Array.from(questionSlots.value.values())

                // Javobni tozalash
                selectedAnswer.value = null
            }

            currentIndex.value = index
            currentPage.value = index + 1
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
