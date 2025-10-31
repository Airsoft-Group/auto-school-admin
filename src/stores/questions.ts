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
}

export const useQuestionStore = defineStore('question', {
    state: (): QuestionState => ({
        questions: {
            data: [] as any,
        },
        currentQuestion: null,
        questionSubjectId: null,
        questionTicketId: null,
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
        // async createUser(payload: Users) {
        //     return request.post('/v1/users', payload)
        // },
        // async updateUser(id: string, payload: Partial<Users>) {
        //     return request.put(`/v1/users/${id}`, payload)
        // },
        // async deleteUser(id: string) {
        //     return request.delete(`/v1/users/${id}`)
        // },
        // async viewPassword(id: string) {
        //     const response = await request.get(`/v1/users/${id}/password`)
        //     this.password = response
        // },
    },
})
