import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import { ApiResponse } from '@/types'

export interface Subjects {
    id?: number
    name: {
        oz: string
        uz: string
        ru: string
    }
}

interface SubjectState {
    subject: ApiResponse<Subjects>
}

export const useSubjectStore = defineStore('subject', {
    state: (): SubjectState => ({
        subject: {
            data: [],
            meta: {
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    lastPage: 1,
                },
            },
        },
    }),

    actions: {
        async fetchSubjects(params?: { page?: number; limit?: number }) {
            const page = params?.page ?? this.subject.meta?.pagination?.page ?? 1
            const limit = params?.limit ?? this.subject.meta?.pagination?.limit ?? 10
            const res = await request.get(`/v1/subjects?page=${page}&limit=${limit}`)
            this.subject = res
        },
        async createSubject(payload: Subjects) {
            return request.post('/v1/subjects', payload)
        },
        async updateSubject(id: string, payload: Partial<Subjects>) {
            return request.put(`/v1/subjects/${id}`, payload)
        },
        async deleteSubject(id: string) {
            return request.delete(`/v1/subjects/${id}`)
        },
    },
})
