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

export interface UserAnswer {
    questionId: string
    answerId: string | null
    isCorrect: boolean | null
}

export function useExam(questionsData: Question[]) {
    const questions = ref<Question[]>(questionsData?.slice(0, 20) || [])
    const currentIndex = ref(0)
    const currentPage = ref(1)
    const selectedAnswer = ref<string | null>(null)
    const timeLeft = ref(3600)
    const finished = ref(false)
    const userAnswers = ref<Map<number, UserAnswer>>(new Map())
    let timer: NodeJS.Timeout | null = null

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
            if (timeLeft.value > 0) {
                timeLeft.value--
            } else {
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
        if (currentQuestion.value) {
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
    }

    function restart() {
        currentIndex.value = 0
        currentPage.value = 1
        selectedAnswer.value = null
        finished.value = false
        timeLeft.value = 3600
        userAnswers.value.clear()
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
    }
}
