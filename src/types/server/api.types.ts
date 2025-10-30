export interface ApiResponse {
  success: boolean
  statusCode: number
  message: string
  timestamp: string
  error?: string | null
}
