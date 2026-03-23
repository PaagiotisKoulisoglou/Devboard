import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,  
})

api.interceptors.request.use(
  (config) => {
    const token = api.defaults.headers.common['Authorization']
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedRequestsQueue = []

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error)
      }
      
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = token
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const { data } = await api.post('/auth/refresh')
        const newToken = `Bearer ${data.accessToken}`

        api.defaults.headers.common['Authorization'] = newToken

        failedRequestsQueue.forEach(({ resolve }) => resolve(newToken))
        failedRequestsQueue = []

        originalRequest.headers['Authorization'] = newToken
        return api(originalRequest)
      } catch (refreshError) {
        failedRequestsQueue.forEach(({ reject }) => reject(refreshError))
        failedRequestsQueue = []
        api.defaults.headers.common['Authorization'] = ''
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api