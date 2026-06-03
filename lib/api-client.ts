import { tokenManager } from './token-manager'

const API_BASE_URL = '/api/proxy'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  token?: string
  user?: any
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  requiresAuth?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getHeaders(requiresAuth: boolean = false, endpoint: string = ''): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (requiresAuth) {
      // MeelDev sadece x-auth-token bekler, agentToken gönderilince CB backend 403 yapar
      const isMeelDev = endpoint.includes('meeldev')
      if (!isMeelDev) {
        const agentToken = process.env.NEXT_PUBLIC_AGENT_TOKEN || process.env.AGENT_TOKEN
        if (agentToken) {
          headers['x-agent-token'] = agentToken
          headers['agentToken'] = agentToken
        }
      }

      const token = tokenManager.getToken()
      if (token) {
        headers['x-auth-token'] = token
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, requiresAuth = false } = options
    const url = `${this.baseUrl}${endpoint}`

    const fetchOptions: RequestInit = {
      method,
      headers: this.getHeaders(requiresAuth, endpoint),
      mode: 'cors',
    }

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, fetchOptions)

      if (response.status === 401) {
        tokenManager.removeToken()
      }

      // Boş body kontrolü — 204 veya content-length:0 durumunda json() crash yapar
      let data: any = {}
      const contentType = response.headers.get('content-type') || ''
      const text = await response.text()
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text)
        } catch {
          // JSON parse başarısız — ham text'i error olarak döndür
          return {
            success: false,
            error: text || `HTTP ${response.status} hatası`,
          }
        }
      }

      if (!response.ok) {
        const errorMsg = data.message || data.error || data.msg
        const errorStr = typeof errorMsg === 'string'
          ? errorMsg
          : (errorMsg?.message || `HTTP ${response.status} hatası`)
        return {
          success: false,
          data,
          error: errorStr,
        }
      }

      return {
        success: true,
        data: data.data || data,
        token: data.token,
        user: data.user,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth })
  }

  async post<T>(endpoint: string, body: Record<string, unknown>, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth })
  }

  async put<T>(endpoint: string, body: Record<string, unknown>, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth })
  }

  async delete<T>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
