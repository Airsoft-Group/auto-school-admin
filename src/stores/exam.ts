import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import { ApiResponse } from '@/types'

interface ExamState {
    exams: any
    result: any
}

export const useExamStore = defineStore('exam', {
    state: (): ExamState => ({
        exams: null,
        result: null,
    }),

    actions: {
        async fetchExamStart(data: any) {
            const response = await request.post('/v1/exams/start', data)
            this.exams = response
        },
        async fetchExamResult(data: any, sessionId: string) {
            return await request.post(`/v1/exams/finish/${sessionId}`, data)
        },
        async fetchResult() {
            const response = await request.get('v1/exams/statistics')
            this.result = response
        },
    },
})
