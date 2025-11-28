import React, { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Edit, Plus, Upload, CheckSquare, FileText, MessageSquare, Sparkles, X, Trash2 } from 'lucide-react'
import { CaseStatus, TaskStatus, TaskPriority, UserRole } from '../types'
import { format } from 'date-fns'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'documents' | 'notes'>('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [noteContent, setNoteContent] = useState('')

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const response = await api.get(`/cases/${id}`)
      return response.data
    },
  })

  const { data: tasks } = useQuery({
    queryKey: ['tasks', 'case', id],
    queryFn: async () => {
      const response = await api.get('/tasks', { params: { case_id: id } })
      return response.data
    },
    enabled: activeTab === 'tasks' || activeTab === 'overview',
  })

  const { data: documents } = useQuery({
    queryKey: ['documents', 'case', id],
    queryFn: async () => {
      const response = await api.get('/documents', { params: { case_id: id } })
      return response.data
    },
    enabled: activeTab === 'documents' || activeTab === 'overview',
  })

  const { data: notes } = useQuery({
    queryKey: ['notes', 'case', id],
    queryFn: async () => {
      const response = await api.get('/notes', { params: { case_id: id } })
      return response.data
    },
    enabled: activeTab === 'notes' || activeTab === 'overview',
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data
    },
    enabled: user?.role === UserRole.OWNER || user?.role === UserRole.LAWYER,
  })

  // Mutations
  const updateCase = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/cases/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', id] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      setShowEditModal(false)
    },
  })

  const createTask = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/tasks', { ...data, case_id: parseInt(id!) })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'case', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setShowTaskModal(false)
    },
  })

  const updateTask = useMutation({
    mutationFn: async ({ taskId, ...data }: any) => {
      const response = await api.put(`/tasks/${taskId}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'case', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'case', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const uploadDocument = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/documents', formData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'case', id] })
      setShowDocumentModal(false)
    },
  })

  const deleteDocument = useMutation({
    mutationFn: async (docId: number) => {
      await api.delete(`/documents/${docId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'case', id] })
    },
  })

  const createNote = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post('/notes', {
        case_id: parseInt(id!),
        content,
        is_pinned: false,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'case', id] })
      setNoteContent('')
    },
  })

  const updateNote = useMutation({
    mutationFn: async ({ noteId, ...data }: any) => {
      const response = await api.put(`/notes/${noteId}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'case', id] })
    },
  })

  const deleteNote = useMutation({
    mutationFn: async (noteId: number) => {
      await api.delete(`/notes/${noteId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'case', id] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading case...</div>
  }

  if (!caseData) {
    return <div className="text-center py-12">Case not found</div>
  }

  const getStatusBadge = (status: CaseStatus) => {
    const styles = {
      [CaseStatus.OPEN]: 'bg-blue-100 text-blue-800',
      [CaseStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [CaseStatus.CLOSED]: 'bg-gray-100 text-gray-800',
      [CaseStatus.ON_HOLD]: 'bg-orange-100 text-orange-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority: TaskPriority) => {
    const styles = {
      [TaskPriority.HIGH]: 'bg-red-100 text-red-800',
      [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [TaskPriority.LOW]: 'bg-green-100 text-green-800',
    }
    return styles[priority] || 'bg-gray-100 text-gray-800'
  }

  const todoTasks = tasks?.filter((t: any) => t.status === TaskStatus.TODO) || []
  const inProgressTasks = tasks?.filter((t: any) => t.status === TaskStatus.IN_PROGRESS) || []
  const doneTasks = tasks?.filter((t: any) => t.status === TaskStatus.DONE) || []

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('case_id', id!)
    formData.append('name', file.name)
    formData.append('document_type', 'Legal Document')
    
    uploadDocument.mutate(formData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(caseData.status)}`}>
                {caseData.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm font-mono text-gray-600">{caseData.case_number}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
            <button
              onClick={() => setShowDocumentModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Client</p>
            <Link to={`/clients/${caseData.client_id}`} className="font-medium text-primary-600 hover:underline">
              {caseData.client?.name}
            </Link>
          </div>
          <div>
            <p className="text-gray-600">Primary Attorney</p>
            <p className="font-medium">{caseData.primary_attorney?.full_name || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Opened Date</p>
            <p className="font-medium">
              {caseData.opened_date ? format(new Date(caseData.opened_date), 'MMM d, yyyy') : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Next Hearing</p>
            <p className="font-medium">
              {caseData.next_hearing_date ? format(new Date(caseData.next_hearing_date), 'MMM d, yyyy') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Case Modal */}
      {showEditModal && (
        <EditCaseModal
          caseData={caseData}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => updateCase.mutate(data)}
          isLoading={updateCase.isPending}
          users={users}
        />
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={(data) => createTask.mutate(data)}
          isLoading={createTask.isPending}
          users={users}
        />
      )}

      {/* Upload Document Modal */}
      {showDocumentModal && (
        <UploadDocumentModal
          onClose={() => setShowDocumentModal(false)}
          onUpload={handleDocumentUpload}
          isLoading={uploadDocument.isPending}
        />
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'tasks', label: `Tasks (${tasks?.length || 0})`, icon: CheckSquare },
              { id: 'documents', label: `Documents (${documents?.length || 0})`, icon: FileText },
              { id: 'notes', label: `Notes (${notes?.length || 0})`, icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{caseData.description || 'No description provided.'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Case Information</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Case Type</dt>
                      <dd className="text-sm font-medium">{caseData.case_type || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Status</dt>
                      <dd className="text-sm font-medium">{caseData.status.replace('_', ' ')}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900">{todoTasks.length + inProgressTasks.length}</p>
                      <p className="text-sm text-gray-600">Open Tasks</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900">{documents?.length || 0}</p>
                      <p className="text-sm text-gray-600">Documents</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {caseData.updated_at ? format(new Date(caseData.updated_at), 'MMM d') : '-'}
                      </p>
                      <p className="text-sm text-gray-600">Last Updated</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-purple-900">AI Summary</h3>
                    <span className="ml-auto text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    AI-powered case summaries, key dates, and action items will appear here.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <TasksTab
              tasks={tasks || []}
              onUpdateTask={(taskId, data) => updateTask.mutate({ taskId, ...data })}
              onDeleteTask={(taskId) => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  deleteTask.mutate(taskId)
                }
              }}
              getPriorityBadge={getPriorityBadge}
              format={format}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              documents={documents || []}
              onDeleteDocument={(docId) => {
                if (window.confirm('Are you sure you want to delete this document?')) {
                  deleteDocument.mutate(docId)
                }
              }}
              format={format}
            />
          )}

          {activeTab === 'notes' && (
            <NotesTab
              notes={notes || []}
              noteContent={noteContent}
              onNoteContentChange={setNoteContent}
              onAddNote={() => {
                if (noteContent.trim()) {
                  createNote.mutate(noteContent)
                }
              }}
              onUpdateNote={(noteId, data) => updateNote.mutate({ noteId, ...data })}
              onDeleteNote={(noteId) => {
                if (window.confirm('Are you sure you want to delete this note?')) {
                  deleteNote.mutate(noteId)
                }
              }}
              format={format}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Edit Case Modal Component
function EditCaseModal({ caseData, onClose, onSave, isLoading, users }: any) {
  const [formData, setFormData] = useState({
    title: caseData.title,
    description: caseData.description || '',
    case_type: caseData.case_type || '',
    status: caseData.status,
    primary_attorney_id: caseData.primary_attorney_id || '',
    opened_date: caseData.opened_date || '',
    next_hearing_date: caseData.next_hearing_date || '',
    statute_of_limitations: caseData.statute_of_limitations || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData: any = { ...formData }
    if (submitData.primary_attorney_id) {
      submitData.primary_attorney_id = parseInt(submitData.primary_attorney_id)
    }
    onSave(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Case</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={CaseStatus.OPEN}>Open</option>
                <option value={CaseStatus.IN_PROGRESS}>In Progress</option>
                <option value={CaseStatus.ON_HOLD}>On Hold</option>
                <option value={CaseStatus.CLOSED}>Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Attorney</label>
              <select
                value={formData.primary_attorney_id}
                onChange={(e) => setFormData({ ...formData, primary_attorney_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Unassigned</option>
                {users?.filter((u: any) => u.role === UserRole.LAWYER || u.role === UserRole.OWNER).map((user: any) => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Add Task Modal Component
function AddTaskModal({ onClose, onSave, isLoading, users }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    due_date: '',
    assignee_id: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData: any = { ...formData }
    // Convert assignee_id to number or remove if empty
    if (submitData.assignee_id) {
      submitData.assignee_id = parseInt(submitData.assignee_id)
    } else {
      delete submitData.assignee_id
    }
    // Remove due_date if empty
    if (!submitData.due_date) {
      delete submitData.due_date
    }
    onSave(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
            <select
              value={formData.assignee_id}
              onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Unassigned</option>
              {users?.map((user: any) => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Upload Document Modal Component
function UploadDocumentModal({ onClose, onUpload, isLoading }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={onUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tasks Tab Component
function TasksTab({ tasks, onUpdateTask, onDeleteTask, getPriorityBadge, format }: any) {
  const todoTasks = tasks.filter((t: any) => t.status === TaskStatus.TODO)
  const inProgressTasks = tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS)
  const doneTasks = tasks.filter((t: any) => t.status === TaskStatus.DONE)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">To Do</h3>
          <div className="space-y-2">
            {todoTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                getPriorityBadge={getPriorityBadge}
                format={format}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">In Progress</h3>
          <div className="space-y-2">
            {inProgressTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                getPriorityBadge={getPriorityBadge}
                format={format}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">Done</h3>
          <div className="space-y-2">
            {doneTasks.slice(0, 5).map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                getPriorityBadge={getPriorityBadge}
                format={format}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Task Card Component
function TaskCard({ task, onUpdate, onDelete, getPriorityBadge, format }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [status, setStatus] = useState(task.status)

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus)
    onUpdate(task.id, { status: newStatus })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm">{task.title}</p>
          <p className="text-xs text-gray-500 mt-1">{task.assignee?.full_name || 'Unassigned'}</p>
          {task.due_date && (
            <p className="text-xs text-gray-500">{format(new Date(task.due_date), 'MMM d')}</p>
          )}
          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getPriorityBadge(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Documents Tab Component
function DocumentsTab({ documents, onDeleteDocument, format }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        target="_blank"
                        className="text-primary-600 hover:underline"
                      >
                        {doc.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doc.document_type || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doc.uploaded_by?.full_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-purple-900">AI Document Assistant</h3>
              <span className="ml-auto text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Coming Soon</span>
            </div>
            <ul className="text-sm text-purple-700 space-y-2 mt-3">
              <li>• Summarize all documents</li>
              <li>• Extract key dates and facts</li>
              <li>• Find missing documents</li>
              <li>• Generate case timeline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notes Tab Component
function NotesTab({ notes, noteContent, onNoteContentChange, onAddNote, onUpdateNote, onDeleteNote, format }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {notes.filter((n: any) => n.is_pinned).map((note: any) => (
          <NoteCard
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            format={format}
          />
        ))}
        {notes.filter((n: any) => !n.is_pinned).map((note: any) => (
          <NoteCard
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            format={format}
          />
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <textarea
          placeholder="Add a note..."
          value={noteContent}
          onChange={(e) => onNoteContentChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
        />
        <button
          onClick={onAddNote}
          disabled={!noteContent.trim()}
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Note
        </button>
      </div>
    </div>
  )
}

// Note Card Component
function NoteCard({ note, onUpdate, onDelete, format }: any) {
  const [isPinned, setIsPinned] = useState(note.is_pinned)

  const handlePinToggle = () => {
    const newPinned = !isPinned
    setIsPinned(newPinned)
    onUpdate(note.id, { is_pinned: newPinned })
  }

  return (
    <div className={`${note.is_pinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white border border-gray-200'} p-4 rounded`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          {note.is_pinned && (
            <span className="text-xs font-medium text-yellow-800 bg-yellow-200 px-2 py-1 rounded mr-2">PINNED</span>
          )}
          <span className="text-sm text-gray-600">{note.author?.full_name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
          </span>
          <button
            onClick={handlePinToggle}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-gray-700">{note.content}</p>
    </div>
  )
}
