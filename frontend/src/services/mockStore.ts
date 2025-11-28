import { User, Client, Case, Task, Document, Note, UserRole, CaseStatus, TaskStatus, TaskPriority } from '../types'
import { mockUsers, mockClients, mockCases, mockTasks, mockDocuments, mockNotes } from './mockData'

// Mutable store that persists during session
class MockStore {
  private users: User[] = JSON.parse(JSON.stringify(mockUsers))
  private clients: Client[] = JSON.parse(JSON.stringify(mockClients))
  private cases: Case[] = JSON.parse(JSON.stringify(mockCases))
  private tasks: Task[] = JSON.parse(JSON.stringify(mockTasks))
  private documents: Document[] = JSON.parse(JSON.stringify(mockDocuments))
  private notes: Note[] = JSON.parse(JSON.stringify(mockNotes))

  private nextId = {
    users: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
    clients: this.clients.length > 0 ? Math.max(...this.clients.map(c => c.id)) + 1 : 1,
    cases: this.cases.length > 0 ? Math.max(...this.cases.map(c => c.id)) + 1 : 1,
    tasks: this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1,
    documents: this.documents.length > 0 ? Math.max(...this.documents.map(d => d.id)) + 1 : 1,
    notes: this.notes.length > 0 ? Math.max(...this.notes.map(n => n.id)) + 1 : 1,
  }

  // Users
  getUsers() { return [...this.users] }
  getUser(id: number) { return this.users.find(u => u.id === id) }
  createUser(userData: Partial<User>) {
    const newUser: User = {
      id: this.nextId.users++,
      email: userData.email!,
      full_name: userData.full_name!,
      role: userData.role!,
      is_active: userData.is_active ?? true,
      created_at: new Date().toISOString(),
      last_login: userData.last_login,
    }
    this.users.push(newUser)
    return newUser
  }
  updateUser(id: number, updates: Partial<User>) {
    const index = this.users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    this.users[index] = { ...this.users[index], ...updates, id }
    return this.users[index]
  }
  deleteUser(id: number) {
    const index = this.users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    this.users.splice(index, 1)
    return { message: 'User deleted' }
  }

  // Clients
  getClients() { return [...this.clients] }
  getClient(id: number) { return this.clients.find(c => c.id === id) }
  createClient(clientData: Partial<Client>) {
    const newClient: Client = {
      id: this.nextId.clients++,
      name: clientData.name!,
      email: clientData.email,
      phone: clientData.phone,
      address: clientData.address,
      is_active: clientData.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.clients.push(newClient)
    return newClient
  }
  updateClient(id: number, updates: Partial<Client>) {
    const index = this.clients.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Client not found')
    this.clients[index] = { ...this.clients[index], ...updates, id, updated_at: new Date().toISOString() }
    return this.clients[index]
  }
  deleteClient(id: number) {
    const index = this.clients.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Client not found')
    this.clients.splice(index, 1)
    return { message: 'Client deleted' }
  }

  // Cases
  getCases() { return [...this.cases] }
  getCase(id: number) { return this.cases.find(c => c.id === id) }
  createCase(caseData: Partial<Case>) {
    const year = new Date().getFullYear()
    const caseNumber = `CASE-${year}-${String(this.nextId.cases).padStart(3, '0')}`
    
    const newCase: Case = {
      id: this.nextId.cases++,
      case_number: caseNumber,
      title: caseData.title!,
      description: caseData.description,
      case_type: caseData.case_type,
      status: caseData.status ?? CaseStatus.OPEN,
      client_id: caseData.client_id!,
      primary_attorney_id: caseData.primary_attorney_id,
      opened_date: caseData.opened_date,
      next_hearing_date: caseData.next_hearing_date,
      statute_of_limitations: caseData.statute_of_limitations,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client: this.getClient(caseData.client_id!),
      primary_attorney: caseData.primary_attorney_id ? this.getUser(caseData.primary_attorney_id) : undefined,
    }
    this.cases.push(newCase)
    return newCase
  }
  updateCase(id: number, updates: Partial<Case>) {
    const index = this.cases.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Case not found')
    const existing = this.cases[index]
    this.cases[index] = {
      ...existing,
      ...updates,
      id,
      client_id: updates.client_id ?? existing.client_id,
      updated_at: new Date().toISOString(),
      client: updates.client_id ? this.getClient(updates.client_id) : existing.client,
      primary_attorney: updates.primary_attorney_id ? this.getUser(updates.primary_attorney_id) : existing.primary_attorney,
    }
    return this.cases[index]
  }
  deleteCase(id: number) {
    const index = this.cases.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Case not found')
    this.cases.splice(index, 1)
    // Also delete related tasks, documents, notes
    this.tasks = this.tasks.filter(t => t.case_id !== id)
    this.documents = this.documents.filter(d => d.case_id !== id)
    this.notes = this.notes.filter(n => n.case_id !== id)
    return { message: 'Case deleted' }
  }

  // Tasks
  getTasks() { return [...this.tasks] }
  getTask(id: number) { return this.tasks.find(t => t.id === id) }
  createTask(taskData: Partial<Task>, createdBy: number) {
    const newTask: Task = {
      id: this.nextId.tasks++,
      title: taskData.title!,
      description: taskData.description,
      status: taskData.status ?? TaskStatus.TODO,
      priority: taskData.priority ?? TaskPriority.MEDIUM,
      due_date: taskData.due_date,
      case_id: taskData.case_id!,
      assignee_id: taskData.assignee_id,
      created_by_id: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      case: this.getCase(taskData.case_id!),
      assignee: taskData.assignee_id ? this.getUser(taskData.assignee_id) : undefined,
      creator: this.getUser(createdBy),
    }
    this.tasks.push(newTask)
    return newTask
  }
  updateTask(id: number, updates: Partial<Task>) {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Task not found')
    const existing = this.tasks[index]
    const updatedTask = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
      completed_at: updates.status === TaskStatus.DONE && !existing.completed_at 
        ? new Date().toISOString() 
        : updates.status !== TaskStatus.DONE 
          ? undefined 
          : existing.completed_at,
      assignee: updates.assignee_id ? this.getUser(updates.assignee_id) : existing.assignee,
    }
    this.tasks[index] = updatedTask
    return updatedTask
  }
  deleteTask(id: number) {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Task not found')
    this.tasks.splice(index, 1)
    return { message: 'Task deleted' }
  }

  // Documents
  getDocuments() { return [...this.documents] }
  getDocument(id: number) { return this.documents.find(d => d.id === id) }
  createDocument(docData: Partial<Document>, uploadedBy: number) {
    const newDoc: Document = {
      id: this.nextId.documents++,
      name: docData.name!,
      file_path: docData.file_path || `/documents/${docData.name}`,
      file_type: docData.file_type,
      document_type: docData.document_type,
      file_size: docData.file_size,
      case_id: docData.case_id!,
      uploaded_by_id: uploadedBy,
      uploaded_at: new Date().toISOString(),
      uploaded_by: this.getUser(uploadedBy),
    }
    this.documents.push(newDoc)
    return newDoc
  }
  deleteDocument(id: number) {
    const index = this.documents.findIndex(d => d.id === id)
    if (index === -1) throw new Error('Document not found')
    this.documents.splice(index, 1)
    return { message: 'Document deleted' }
  }

  // Notes
  getNotes() { return [...this.notes] }
  getNote(id: number) { return this.notes.find(n => n.id === id) }
  createNote(noteData: Partial<Note>, authorId: number) {
    const newNote: Note = {
      id: this.nextId.notes++,
      content: noteData.content!,
      case_id: noteData.case_id!,
      author_id: authorId,
      is_pinned: noteData.is_pinned ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: this.getUser(authorId),
    }
    this.notes.push(newNote)
    return newNote
  }
  updateNote(id: number, updates: Partial<Note>) {
    const index = this.notes.findIndex(n => n.id === id)
    if (index === -1) throw new Error('Note not found')
    this.notes[index] = {
      ...this.notes[index],
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    }
    return this.notes[index]
  }
  deleteNote(id: number) {
    const index = this.notes.findIndex(n => n.id === id)
    if (index === -1) throw new Error('Note not found')
    this.notes.splice(index, 1)
    return { message: 'Note deleted' }
  }
}

// Singleton instance
export const mockStore = new MockStore()

