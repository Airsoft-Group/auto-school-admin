import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import { ApiResponse } from '@/types'

export interface Questions {
    id?: string
    title: {
        oz: string
        uz: string
        ru: string
    }
    correctAnswerIndex: number
    subject: {
        id: string
        name: {
            oz: string
            uz: string
            ru: string
        }
    }
    ticket: {
        id: string
        name: string
    }
    file: any
    createdAt: string
    updatedAt: string
}

interface QuestionState {
    questions: ApiResponse<Questions>
    currentQuestion: any
    questionSubjectId: any
    questionTicketId: any
    translate: any
    answerDetail: any
    savedQuestion: any
}

export const useQuestionStore = defineStore('question', {
    state: (): QuestionState => ({
        questions: {
            data: [] as any,
        },
        currentQuestion: null,
        questionSubjectId: null,
        questionTicketId: null,
        translate: null,
        answerDetail: null,
        savedQuestion: null,
    }),

    actions: {
        async fetchQuestion(filters: { page: number; limit: number; search?: string | null; subjectId?: string | null; ticketId?: string | null }) {
            const res = await request.get('/v1/questions', { params: filters })
            this.questions = res
        },
        async viewQuestion(id: string) {
            const response = await request.get(`/v1/questions/${id}`)
            this.currentQuestion = response
        },
        async fetchQuestionSubjectById(subjectId: string) {
            const response = await request.get(`/v1/questions/subject/${subjectId}`)
            this.questionSubjectId = response
        },
        async fetchQuestionTicketById(id: string) {
            const response = await request.get(`/v1/questions/ticket/${id}`)
            this.questionTicketId = response
        },
        async fetchTranslateText(data: { text: string; sourceLanguage: string }) {
            const response = await request.post('/v1/translation/translate-multiple', data)
            this.translate = response
        },
        async createQuestion(payload: any) {
            return request.post('/v1/questions', payload)
        },
        async updateQuestion(id: string, payload: any) {
            return request.put(`/v1/questions/${id}`, payload)
        },
        async deleteQuestion(id: string) {
            return request.delete(`/v1/questions/${id}`)
        },
        async getAnswerDetail(id: string) {
            const response = await request.get(`/v1/answers/question/${id}`)
            this.answerDetail = response
        },
        async createAnswer(data: any) {
            return request.post('/v1/answers/multiple', data)
        },
        async updateAnswer(id: string, payload: any) {
            return request.put(`/v1/answers/${id}`, payload)
        },
        async deleteAnswer(id: string) {
            return request.delete(`/v1/answers/${id}`)
        },
        async fetchSavedQuestion(filters: {
            page: number
            limit: number
            search?: string | null
            subjectId?: string | null
            ticketId?: string | null
        }) {
            const res = await request.get('/v1/saved-questions', { params: filters })
            this.savedQuestion = res
        },
        async savedQuestions(data: { questionId: string }) {
            return request.post(`/v1/saved-questions`, data)
        },
        // async viewPassword(id: string) {
        //     const response = await request.get(`/v1/users/${id}/password`)
        //     this.password = response
        // },
    },
})
