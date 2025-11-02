import { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '../../stores'
import router from '../../router'

// 🔹 REQUEST INTERCEPTOR
export const setupAuthRequestInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const store = useUserStore()

            if (store.token) {
                config.headers['Authorization'] = `Bearer ${store.token}`
            }

            return config
        },
        (error) => Promise.reject(error)
    )
}

// 🔹 RESPONSE INTERCEPTOR
export const setupAuthResponseInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const store = useUserStore()
            const status = error.response?.status

            if (status === 401) {
                console.warn('🔒 Auth interceptor: handling 401 error')

                store.resetToken()

                const currentRoute = router.currentRoute.value.fullPath

                if (currentRoute.startsWith('/admin')) {
                    router.push('/login')
                } else {
                    console.log('User uchun 401 — home sahifada qolmoqda')
                }
            }

            return Promise.reject(error)
        }
    )
}
