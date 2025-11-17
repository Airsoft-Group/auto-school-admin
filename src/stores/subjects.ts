import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import { ApiResponse } from '@/types'

export interface Subjects {
    id?: string
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
                pagination: {} as any,
            },
        },
    }),

    actions: {
        async fetchSubjects(params?: { page?: number; limit?: number; sortBy: 'createdAt'; order: 'asc' }) {
            const page = params?.page ?? this.subject.meta?.pagination?.page ?? 1
            const limit = params?.limit ?? this.subject.meta?.pagination?.limit ?? 10000
            const res = await request.get(`/v1/subjects?page=${page}&limit=${limit}&sortBy=createdAt&order=asc`)
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
    getters: {
        getSubjectSelect: (state): any[] =>
            state.subject?.data?.map((subject) => ({
                value: subject.id,
                label: subject.name?.uz,
            })),
    },
})
