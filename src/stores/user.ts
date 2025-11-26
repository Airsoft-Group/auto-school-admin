import { defineStore } from 'pinia'
import {
    removeAccessToken,
    removeRefreshToken,
    setAccessToken,
    getAccessToken,
    getRefreshToken,
    setRefreshToken,
    setUserInfo,
    removeUserInfo,
} from '../utils/cookies'
import userService from '../services/modules/user.service'
import { LoginRequest } from '../types/server/user.types'
import { UserProfileResponse } from '@/types/server/user.types'

interface UserState {
    token?: string
    refresh_token?: string
    user: UserProfileResponse['data'] | null
    screenSplit: boolean
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        token: getAccessToken(),
        refresh_token: getRefreshToken(),
        user: null,
        screenSplit: false,
    }),
    actions: {
        async login(data: LoginRequest) {
            const response = await userService.login(data)
            if (response.success && response.data) {
                this.setTokens(response.data.accessToken, response.data.refreshToken)
            }
            return response
        },
        async register(data: { fullName: string; password: string; email: string; phoneNumber: string }) {
            return await userService.register(data)
        },
        async fetchUserInfo() {
            const response = await userService.getCurrentUser()
            if (response.success && response.data) {
                this.user = response.data
                setUserInfo(response.data)
            }
            return response
        },
        async refreshToken() {
            const response = await userService.refreshToken({
                refresh_token: this.refresh_token || getRefreshToken() || '',
            })
            if (response.success && response.data) {
                this.setTokens(response.data.accessToken, response.data.refreshToken)
            }

            return response
        },
        setTokens(accessToken: string, refreshToken: string) {
            this.token = accessToken
            this.refresh_token = refreshToken
            setAccessToken(accessToken)
            setRefreshToken(refreshToken)
        },
        resetToken() {
            removeAccessToken()
            removeRefreshToken()
            removeUserInfo()
            this.token = ''
            this.refresh_token = ''
            this.user = null
        },
        async logout() {
            const response = await userService.logout()
            if (response.success) {
                this.resetToken()
            }
            return response
        },
    },
    getters: {
        getUser: (state) => state.user,
        getToken: (state) => state.token,
    },
})
