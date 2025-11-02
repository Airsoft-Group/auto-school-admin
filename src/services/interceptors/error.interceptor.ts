import { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import router from '../../router'

// ✅ Umumiy xatolikni qayta ishlovchi funksiya
export const handleCommonError = (error: any, redirectToLogin = false) => {
    let message = 'Xatolik yuz berdi'

    const errorData = error.response?.data

    if (errorData) {
        if (errorData.error?.details && Array.isArray(errorData.error.details)) {
            // { error: { details: ["Error 1", "Error 2"] } }
            message = errorData.error.details.join('. ')
        } else if (errorData.message) {
            // { message: "Error message" }
            message = errorData.message
        } else if (errorData.error?.message) {
            // { error: { message: "Error message" } }
            message = errorData.error.message
        } else if (typeof errorData.error === 'string') {
            // { error: "Error message" }
            message = errorData.error
        }
    }

    // 🔹 Faqat foydalanuvchiga ko‘rsatiladigan xabar
    if (message && message !== 'Unauthorized') {
        ElMessage({
            message,
            type: 'error',
            duration: 4000,
        })
    }

    // 🔹 Login sahifasiga yo‘naltirish
    if (redirectToLogin && !window.location.pathname.includes('/login')) {
        router.push('/login')
    }
}

// ✅ Xatoliklarni tutuvchi interceptor
export const setupErrorResponseInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.response.use(
        // 1️⃣ Muvaffaqiyatli javob
        (response) => response.data,
        // 2️⃣ Xatolikni tutish
        async (error) => {
            const status = error.response?.status

            // 🔹 401 holatni auth.interceptor hal qiladi, shuning uchun bu yerda o'tkazib yuboramiz
            if (status === 401) {
                console.log('Error interceptor: 401 detected → handled by auth interceptor')
                return Promise.reject(error)
            }

            // 🔹 403 yoki 500 va boshqa xatoliklarni ko‘rsatish
            handleCommonError(error, false)

            return Promise.reject(error)
        }
    )
}
