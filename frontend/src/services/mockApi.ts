import { mockUsers, delay } from './mockData'
import { mockStore } from './mockStore'
import { User, UserRole, CaseStatus, TaskStatus, TaskPriority } from '../types'

// Check if we should use mock mode
// Defaults to true (dev mode) unless explicitly disabled
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

// Helper to get current user from token
function getCurrentUserId(): number {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')
  return parseInt(token.replace('mock_token_', ''))
}

// Simulate API responses
const mockApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    await delay(500) // Simulate network delay
    
    // Default test credentials
    const testUsers: Record<string, { user: User; password: string }> = {
      'owner@firm.com': { user: mockUsers[0], password: 'password' },
      'lawyer@firm.com': { user: mockUsers[1], password: 'password' },
      'assistant@firm.com': { user: mockUsers[2], password: 'password' },
    }

    const userData = testUsers[email]
    if (userData && userData.password === password) {
      return {
        data: {
          access_token: `mock_token_${userData.user.id}`,
          token_type: 'bearer',
        },
      }
    }
    throw new Error('Invalid email or password')
  },

  async getCurrentUser() {
    await delay(300)
    const userId = getCurrentUserId()
    const user = mockStore.getUser(userId)
    if (!user) throw new Error('User not found')
    return { data: user }
  },

  // Cases endpoints
  async getCases(params?: any) {
    await delay(400)
    let cases = mockStore.getCases()

    // Apply filters
    if (params?.status) {
      cases = cases.filter(c => c.status === params.status)
    }
    if (params?.client_id) {
      cases = cases.filter(c => c.client_id === parseInt(params.client_id))
    }
    if (params?.attorney_id) {
      cases = cases.filter(c => c.primary_attorney_id === parseInt(params.attorney_id))
    }
    if (params?.search) {
      const search = params.search.toLowerCase()
      cases = cases.filter(c => 
        c.title.toLowerCase().includes(search) ||
        c.case_number.toLowerCase().includes(search) ||
        c.client?.name.toLowerCase().includes(search)
      )
    }

    return { data: cases.slice(0, params?.limit || 100) }
  },

  async getCase(id: string) {
    await delay(300)
    const caseItem = mockStore.getCase(parseInt(id))
    if (!caseItem) throw new Error('Case not found')
    return { data: caseItem }
  },

  async createCase(data: any) {
    await delay(500)
    const newCase = mockStore.createCase(data)
    return { data: newCase }
  },

  async updateCase(id: string, data: any) {
    await delay(500)
    const updated = mockStore.updateCase(parseInt(id), data)
    return { data: updated }
  },

  async deleteCase(id: string) {
    await delay(500)
    return mockStore.deleteCase(parseInt(id))
  },

  // Tasks endpoints
  async getTasks(params?: any) {
    await delay(400)
    let tasks = mockStore.getTasks()

    if (params?.case_id) {
      tasks = tasks.filter(t => t.case_id === parseInt(params.case_id))
    }
    if (params?.status) {
      tasks = tasks.filter(t => t.status === params.status)
    }
    if (params?.assignee_id) {
      tasks = tasks.filter(t => t.assignee_id === parseInt(params.assignee_id))
    }
    if (params?.overdue_only) {
      const today = new Date()
      tasks = tasks.filter(t => {
        if (!t.due_date || t.status === TaskStatus.DONE) return false
        return new Date(t.due_date) < today
      })
    }
    if (params?.due_today) {
      const today = new Date().toDateString()
      tasks = tasks.filter(t => {
        if (!t.due_date || t.status === TaskStatus.DONE) return false
        return new Date(t.due_date).toDateString() === today
      })
    }

    return { data: tasks.slice(0, params?.limit || 100) }
  },

  async getTask(id: string) {
    await delay(300)
    const task = mockStore.getTask(parseInt(id))
    if (!task) throw new Error('Task not found')
    return { data: task }
  },

  async createTask(data: any) {
    await delay(500)
    const userId = getCurrentUserId()
    const newTask = mockStore.createTask(data, userId)
    return { data: newTask }
  },

  async updateTask(id: string, data: any) {
    await delay(500)
    const updated = mockStore.updateTask(parseInt(id), data)
    return { data: updated }
  },

  async deleteTask(id: string) {
    await delay(500)
    return mockStore.deleteTask(parseInt(id))
  },

  // Clients endpoints
  async getClients(params?: any) {
    await delay(400)
    let clients = mockStore.getClients()

    if (params?.search) {
      const search = params.search.toLowerCase()
      clients = clients.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.includes(search)
      )
    }

    return { data: clients.slice(0, params?.limit || 100) }
  },

  async getClient(id: string) {
    await delay(300)
    const client = mockStore.getClient(parseInt(id))
    if (!client) throw new Error('Client not found')
    return { data: client }
  },

  async createClient(data: any) {
    await delay(500)
    const newClient = mockStore.createClient(data)
    return { data: newClient }
  },

  async updateClient(id: string, data: any) {
    await delay(500)
    const updated = mockStore.updateClient(parseInt(id), data)
    return { data: updated }
  },

  async deleteClient(id: string) {
    await delay(500)
    return mockStore.deleteClient(parseInt(id))
  },

  // Documents endpoints
  async getDocuments(params?: any) {
    await delay(400)
    let documents = mockStore.getDocuments()

    if (params?.case_id) {
      documents = documents.filter(d => d.case_id === parseInt(params.case_id))
    }
    if (params?.document_type) {
      documents = documents.filter(d => d.document_type === params.document_type)
    }

    return { data: documents.slice(0, params?.limit || 100) }
  },

  async getDocument(id: string) {
    await delay(300)
    const doc = mockStore.getDocument(parseInt(id))
    if (!doc) throw new Error('Document not found')
    return { data: doc }
  },

  async createDocument(data: any) {
    await delay(500)
    const userId = getCurrentUserId()
    const newDoc = mockStore.createDocument(data, userId)
    return { data: newDoc }
  },

  async deleteDocument(id: string) {
    await delay(500)
    return mockStore.deleteDocument(parseInt(id))
  },

  // Notes endpoints
  async getNotes(params?: any) {
    await delay(400)
    let notes = mockStore.getNotes()

    if (params?.case_id) {
      notes = notes.filter(n => n.case_id === parseInt(params.case_id))
    }
    if (params?.pinned_only) {
      notes = notes.filter(n => n.is_pinned)
    }

    // Sort: pinned first, then by date
    notes.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return { data: notes.slice(0, params?.limit || 100) }
  },

  async getNote(id: string) {
    await delay(300)
    const note = mockStore.getNote(parseInt(id))
    if (!note) throw new Error('Note not found')
    return { data: note }
  },

  async createNote(data: any) {
    await delay(500)
    const userId = getCurrentUserId()
    const newNote = mockStore.createNote(data, userId)
    return { data: newNote }
  },

  async updateNote(id: string, data: any) {
    await delay(500)
    const updated = mockStore.updateNote(parseInt(id), data)
    return { data: updated }
  },

  async deleteNote(id: string) {
    await delay(500)
    return mockStore.deleteNote(parseInt(id))
  },

  // Users endpoints (for admin)
  async getUsers() {
    await delay(400)
    return { data: mockStore.getUsers() }
  },

  async getUser(id: string) {
    await delay(300)
    const user = mockStore.getUser(parseInt(id))
    if (!user) throw new Error('User not found')
    return { data: user }
  },

  async createUser(data: any) {
    await delay(500)
    const newUser = mockStore.createUser(data)
    return { data: newUser }
  },

  async updateUser(id: string, data: any) {
    await delay(500)
    const updated = mockStore.updateUser(parseInt(id), data)
    return { data: updated }
  },

  async deleteUser(id: string) {
    await delay(500)
    return mockStore.deleteUser(parseInt(id))
  },
}

export default mockApi

