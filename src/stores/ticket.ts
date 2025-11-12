import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/services/api'
import { ApiResponse } from '@/types'

export interface Tickets {
    id?: number
    name: string
}

interface TicketState {
    ticket: ApiResponse<Tickets>
}

export const useTicketStore = defineStore('ticket', {
    state: (): TicketState => ({
        ticket: {
            data: [],
            meta: {
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 20,
                    lastPage: 1,
                },
            },
        },
    }),

    actions: {
        async fetchTickets(params?: { page?: number; limit?: number; sortBy: 'createdAt'; order: 'asc' }) {
            const page = params?.page ?? this.ticket.meta?.pagination?.page ?? 1
            const limit = params?.limit ?? this.ticket.meta?.pagination?.limit ?? 10
            const res = await request.get(`/v1/tickets?page=${page}&limit=${limit}&sortBy=createdAt&order=asc`)
            this.ticket = res
        },
        async createTicket(payload: Tickets) {
            return request.post('/v1/tickets', payload)
        },
        async updateTicket(id: string, payload: Partial<Tickets>) {
            return request.put(`/v1/tickets/${id}`, payload)
        },
        async deleteTicket(id: string) {
            return request.delete(`/v1/tickets/${id}`)
        },
    },
    getters: {
        getTicketSelect: (state): any[] =>
            state.ticket?.data?.map((ticket) => ({
                value: ticket.id,
                label: ticket.name,
            })),
    },
})
