import axios from 'axios'
// Import interceptors
import { setupAuthRequestInterceptor, setupAuthResponseInterceptor } from './interceptors/auth.interceptor'
import { setupErrorResponseInterceptor } from './interceptors/error.interceptor'

// Create axios instance with base configuration
const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 60000,
})

// Setup interceptors
// Auth interceptors must run before error interceptor for token refresh to work
setupErrorResponseInterceptor(request)
setupAuthRequestInterceptor(request)
setupAuthResponseInterceptor(request)
// Error interceptor runs last to catch any remaining errors

export default request
