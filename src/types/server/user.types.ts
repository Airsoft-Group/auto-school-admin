export interface LoginRequest {
    phoneNumber: string
    password: string
}

export interface AuthResponse {
    success: boolean
    statusCode: number
    message: string
    data: {
        accessToken: string
        refreshToken: string
    } | null
    error: any
    meta: {
        timestamp: string
    }
}

export interface RefreshTokenRequest {
    refresh_token: string
}

export interface UserProfileResponse {
    success: boolean
    statusCode: number
    message: string
    data: {
        id: string
        fullName: string
        email: string
        role: string
        phoneNumber: string
        permissions: string[]
    } | null
    error: any
    meta: {
        timestamp: string
    }
}

export interface ApiResponse<T = any> {
    success: boolean
    statusCode: number
    message: string
    data: T[] | null
    error: any
    meta: {
        timestamp: string
    }
}
