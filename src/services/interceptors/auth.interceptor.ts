import { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '../../stores'
import router from '../../router'

// Authentication request interceptor
export const setupAuthRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const store = useUserStore()
      if (store.token) {
        config.headers['Authorization'] = `Bearer ${store.token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}

// Authentication response interceptor
export const setupAuthResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Get user store
      const store = useUserStore()
      
      // Handle 401 Unauthorized errors - just logout and redirect to login
      if (error.response?.status === 401) {
        console.log('Auth interceptor: handling 401 error');
        
        // Logout and redirect to login page
        // if (store.token) {
        //   await store.logout();
        // }
        store.resetToken()
        
        // Redirect to login page
        router.push('/login');
      }
      
      // Always reject the error for other handlers
      return Promise.reject(error)
    }
  )
}
