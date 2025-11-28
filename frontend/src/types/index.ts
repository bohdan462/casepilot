export enum UserRole {
  OWNER = 'owner',
  LAWYER = 'lawyer',
  ASSISTANT = 'assistant',
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  ON_HOLD = 'on_hold',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface Client {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Case {
  id: number
  case_number: string
  title: string
  description?: string
  case_type?: string
  status: CaseStatus
  client_id: number
  primary_attorney_id?: number
  opened_date?: string
  next_hearing_date?: string
  statute_of_limitations?: string
  created_at: string
  updated_at?: string
  client?: Client
  primary_attorney?: User
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  case_id: number
  assignee_id?: number
  created_by_id: number
  created_at: string
  updated_at?: string
  completed_at?: string
  case?: Case
  assignee?: User
  creator?: User
}

export interface Document {
  id: number
  name: string
  file_path: string
  file_type?: string
  document_type?: string
  file_size?: number
  case_id: number
  uploaded_by_id: number
  uploaded_at: string
  uploaded_by?: User
}

export interface Note {
  id: number
  content: string
  case_id: number
  author_id: number
  is_pinned: boolean
  created_at: string
  updated_at?: string
  author?: User
}




