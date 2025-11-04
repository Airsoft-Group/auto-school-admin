import request from '@/services/api'
import { defineStore } from 'pinia'

export const useFileStore = defineStore('file', {
    actions: {
        async uploadFile(file: File) {
            const formData = new FormData()
            formData.append('file', file, file.name)
            return request.post('/v1/files/upload', formData)
        },
    },
})
