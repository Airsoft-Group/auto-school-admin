import request from '../api'
import { LoginRequest, RefreshTokenRequest, AuthResponse, UserProfileResponse, ApiResponse } from '../../types/server/user.types'

interface UsernameExistenceResponse {
    data: {
        isExist: boolean
    }
}

/**
 * User authentication and profile related API services
 */
export const userService = {
    /**
     * Authenticates user credentials and returns access and refresh tokens
     * @param data - User login credentials
     */
    login(data: LoginRequest): Promise<AuthResponse> {
        return request.post('/v1/auth/login', data)
    },

    /**
     * Uses a valid refresh token to generate new access and refresh tokens
     * @param data - Refresh token request
     */
    refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
        return request.post('/v1/auth/refresh', data)
    },

    register(data: any) {
        return request.post('/v1/auth/register', data)
    },

    /**
     * Invalidates the current session and refresh tokens
     */
    logout(): Promise<ApiResponse> {
        return request.post('/v1/auth/logout')
    },

    /**
     * Get current user profile information
     */
    getCurrentUser(): Promise<UserProfileResponse> {
        return request.get('/v1/users/me')
    },

    /**
     * Check if a teacher username already exists
     * @param username - Username to check
     * @returns Promise with a boolean indicating if the username exists
     */
    checkExistingTeacherUsername(username: string): Promise<boolean> {
        return request
            .get(`/v1/users/check-for-existing-teacher`, {
                params: { username: username },
            })
            .then((response: UsernameExistenceResponse) => {
                return response.data.isExist
            })
    },
}

export default userService
