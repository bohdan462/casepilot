import axios, { AxiosInstance } from 'axios'
import mockApi, { USE_MOCK_API } from './mockApi'

// Check if we should use mock API (defaults to true for dev mode)
const useMock = USE_MOCK_API

// Log mode for debugging
if (useMock) {
  console.log('🧪 Running in MOCK API mode - using local test data')
} else {
  console.log('🔌 Running in REAL API mode - connecting to backend')
}

let api: AxiosInstance

if (useMock) {
  // Create a mock API adapter with full CRUD support
  api = {
    get: async (url: string, config?: any) => {
      const params = config?.params || {}
      
      if (url === '/auth/me') {
        return mockApi.getCurrentUser()
      }
      if (url.startsWith('/cases/') && url !== '/cases') {
        const id = url.split('/')[2]
        return mockApi.getCase(id)
      }
      if (url === '/cases') {
        return mockApi.getCases(params)
      }
      if (url.startsWith('/clients/') && url !== '/clients') {
        const id = url.split('/')[2]
        return mockApi.getClient(id)
      }
      if (url === '/clients') {
        return mockApi.getClients(params)
      }
      if (url.startsWith('/tasks/') && url !== '/tasks') {
        const id = url.split('/')[2]
        return mockApi.getTask(id)
      }
      if (url === '/tasks') {
        return mockApi.getTasks(params)
      }
      if (url.startsWith('/documents/') && url !== '/documents') {
        const id = url.split('/')[2]
        if (url.includes('/download')) {
          // Mock download - just return success
          return { data: { message: 'Download would start here' } }
        }
        return mockApi.getDocument(id)
      }
      if (url === '/documents') {
        return mockApi.getDocuments(params)
      }
      if (url.startsWith('/notes/') && url !== '/notes') {
        const id = url.split('/')[2]
        return mockApi.getNote(id)
      }
      if (url === '/notes') {
        return mockApi.getNotes(params)
      }
      if (url.startsWith('/users/') && url !== '/users') {
        const id = url.split('/')[2]
        return mockApi.getUser(id)
      }
      if (url === '/users') {
        return mockApi.getUsers()
      }
      
      throw new Error(`Mock API: GET ${url} not implemented`)
    },
    post: async (url: string, data?: any, config?: any) => {
      if (url === '/auth/login') {
        const email = data.get ? data.get('username') : data.username
        const password = data.get ? data.get('password') : data.password
        return mockApi.login(email, password)
      }
      if (url === '/cases') {
        return mockApi.createCase(data)
      }
      if (url === '/clients') {
        return mockApi.createClient(data)
      }
      if (url === '/tasks') {
        return mockApi.createTask(data)
      }
      if (url === '/documents') {
        // Handle file upload - extract data from FormData or regular object
        const docData = data instanceof FormData 
          ? {
              name: data.get('name') || 'document.pdf',
              case_id: parseInt(data.get('case_id') as string),
              document_type: data.get('document_type') as string,
              file_path: '/documents/' + (data.get('name') || 'document.pdf'),
              file_type: (data.get('name') as string)?.split('.').pop() || 'pdf',
              file_size: (data.get('file') as File)?.size || 0,
            }
          : data
        return mockApi.createDocument(docData)
      }
      if (url === '/notes') {
        return mockApi.createNote(data)
      }
      if (url === '/users') {
        return mockApi.createUser(data)
      }
      throw new Error(`Mock API: POST ${url} not implemented`)
    },
    put: async (url: string, data?: any) => {
      if (url.startsWith('/cases/')) {
        const id = url.split('/')[2]
        return mockApi.updateCase(id, data)
      }
      if (url.startsWith('/clients/')) {
        const id = url.split('/')[2]
        return mockApi.updateClient(id, data)
      }
      if (url.startsWith('/tasks/')) {
        const id = url.split('/')[2]
        return mockApi.updateTask(id, data)
      }
      if (url.startsWith('/notes/')) {
        const id = url.split('/')[2]
        return mockApi.updateNote(id, data)
      }
      if (url.startsWith('/users/')) {
        const id = url.split('/')[2]
        return mockApi.updateUser(id, data)
      }
      throw new Error(`Mock API: PUT ${url} not implemented`)
    },
    delete: async (url: string) => {
      if (url.startsWith('/cases/')) {
        const id = url.split('/')[2]
        return mockApi.deleteCase(id)
      }
      if (url.startsWith('/clients/')) {
        const id = url.split('/')[2]
        return mockApi.deleteClient(id)
      }
      if (url.startsWith('/tasks/')) {
        const id = url.split('/')[2]
        return mockApi.deleteTask(id)
      }
      if (url.startsWith('/documents/')) {
        const id = url.split('/')[2]
        return mockApi.deleteDocument(id)
      }
      if (url.startsWith('/notes/')) {
        const id = url.split('/')[2]
        return mockApi.deleteNote(id)
      }
      if (url.startsWith('/users/')) {
        const id = url.split('/')[2]
        return mockApi.deleteUser(id)
      }
      throw new Error(`Mock API: DELETE ${url} not implemented`)
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  } as any
} else {
  // Real API
  api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add token to requests if available
  const token = localStorage.getItem('token')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

export default api

