import { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import router from '../../router'

// Common error handler to avoid duplication
export const handleCommonError = (error: any, redirectToLogin = false) => {
    // Default error message
    let message = 'Xatolik yuz berdi'
    // Extract detailed error message if available
    if (error.response?.data) {
        const errorData = error.response.data
        // Check for validation errors in different formats
        if (errorData.error?.details && Array.isArray(errorData.error.details)) {
            // Format is { error: { details: ["Error 1", "Error 2"] } }
            message = errorData.error.details.join('. ')
        } else if (errorData.message) {
            // Format is { message: "Error message" }
            message = errorData.message
        } else if (errorData.error?.message) {
            // Format is { error: { message: "Error message" } }
            message = errorData.error.message
        } else if (typeof errorData.error === 'string') {
            // Format is { error: "Error message" }
            message = errorData.error
        }
    }

    // Show error message
    ElMessage({
        message,
        type: 'error',
        duration: 5 * 1000,
    })

    // Redirect to login if needed and not already on login page
    // if (redirectToLogin && !window.location.pathname.includes('/login')) {
    //     router.push('/login')
    // }
    if (redirectToLogin && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
    }
}

// Error response interceptor
export const setupErrorResponseInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.response.use(
        // Transform successful responses
        (response) => response.data,
        // Handle errors
        async (error) => {
            // Let auth interceptor handle 401 errors
            // if (error.response?.status === 401) {
            //   console.log('Error interceptor: detected 401, bypassing...');
            //   // return false
            //   return Promise.reject(error);
            // }

            // For other errors, show message
            handleCommonError(error, false)

            return Promise.reject(error)
        }
    )
}
