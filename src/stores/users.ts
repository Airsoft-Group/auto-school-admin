import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import { ApiResponse } from '@/types'

export interface Users {
    id?: string
    fullName: string
    email: string
    role?: string
    password?: string
    accessStartAt: string
    accessEndAt: string
}

interface UsersState {
    users: ApiResponse<Users>
    password: any
}

export const useUserManagementStore = defineStore('users', {
    state: (): UsersState => ({
        users: {
            data: [] as any,
        },
        password: null,
    }),

    actions: {
        async fetchUsers() {
            const res = await request.get('/v1/users')
            this.users = res
        },
        async createUser(payload: Users) {
            return request.post('/v1/users', payload)
        },
        async updateUser(id: string, payload: Partial<Users>) {
            return request.put(`/v1/users/${id}`, payload)
        },
        async deleteUser(id: string) {
            return request.delete(`/v1/users/${id}`)
        },
        async viewPassword(id: string) {
            const response = await request.get(`/v1/users/${id}/password`)
            this.password = response
        },
    },
})
