# CRUD Operations Guide

## ✅ Full CRUD Support Implemented

The mock API now supports complete **Create, Read, Update, Delete** operations for all entities!

### Available Operations

#### **Cases**
- ✅ `GET /cases` - List all cases (with filters)
- ✅ `GET /cases/:id` - Get single case
- ✅ `POST /cases` - Create new case
- ✅ `PUT /cases/:id` - Update case
- ✅ `DELETE /cases/:id` - Delete case (also deletes related tasks, documents, notes)

#### **Tasks**
- ✅ `GET /tasks` - List all tasks (with filters)
- ✅ `GET /tasks/:id` - Get single task
- ✅ `POST /tasks` - Create new task
- ✅ `PUT /tasks/:id` - Update task
- ✅ `DELETE /tasks/:id` - Delete task

#### **Clients**
- ✅ `GET /clients` - List all clients (with search)
- ✅ `GET /clients/:id` - Get single client
- ✅ `POST /clients` - Create new client
- ✅ `PUT /clients/:id` - Update client
- ✅ `DELETE /clients/:id` - Delete client

#### **Documents**
- ✅ `GET /documents` - List all documents (with filters)
- ✅ `GET /documents/:id` - Get single document
- ✅ `POST /documents` - Upload/create document
- ✅ `DELETE /documents/:id` - Delete document

#### **Notes**
- ✅ `GET /notes` - List all notes (with filters)
- ✅ `GET /notes/:id` - Get single note
- ✅ `POST /notes` - Create new note
- ✅ `PUT /notes/:id` - Update note
- ✅ `DELETE /notes/:id` - Delete note

#### **Users** (Admin only)
- ✅ `GET /users` - List all users
- ✅ `GET /users/:id` - Get single user
- ✅ `POST /users` - Create new user
- ✅ `PUT /users/:id` - Update user
- ✅ `DELETE /users/:id` - Delete user

## 🎯 How It Works

### Data Persistence
- All changes are stored in **memory** during the session
- Data persists until you refresh the page (then resets to defaults)
- Each entity gets auto-incremented IDs

### Example Usage

#### Create a Case
```typescript
const response = await api.post('/cases', {
  title: 'New Case Title',
  description: 'Case description',
  case_type: 'Personal Injury',
  status: 'open',
  client_id: 1,
  primary_attorney_id: 2,
})
```

#### Update a Task
```typescript
const response = await api.put('/tasks/1', {
  status: 'in_progress',
  priority: 'high',
  due_date: '2024-03-01',
})
```

#### Delete a Note
```typescript
await api.delete('/notes/1')
```

## 🔄 React Query Integration

The app uses React Query for data fetching. To add mutations, use:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const createCase = useMutation({
  mutationFn: async (data) => {
    const response = await api.post('/cases', data)
    return response.data
  },
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['cases'] })
  },
})

// Use it:
createCase.mutate({
  title: 'New Case',
  client_id: 1,
})
```

## 📝 Testing CRUD Operations

1. **Create**: Click "New Case", "New Task", "New Client" buttons
2. **Read**: All list and detail pages automatically fetch data
3. **Update**: Click "Edit" buttons or modify inline fields
4. **Delete**: Use delete buttons or actions (with confirmation)

## 🎨 UI Components Ready

The following pages have CRUD functionality:
- ✅ Cases List - Create, Read, Update, Delete
- ✅ Case Detail - Update case, Create tasks/documents/notes
- ✅ Tasks View - Create, Read, Update, Delete
- ✅ Clients List - Create, Read, Update, Delete
- ✅ Client Detail - Update client, View cases
- ✅ Users Management - Create, Read, Update, Delete (Owner only)

## 💡 Tips

- All operations simulate network delays (300-500ms)
- Errors are properly handled and displayed
- Data relationships are maintained (e.g., deleting a case deletes its tasks)
- Auto-generated IDs ensure no conflicts
- Timestamps are automatically set on create/update

## 🚀 Next Steps

To use CRUD in your components:

1. Add mutation hooks using React Query
2. Call the API methods (POST, PUT, DELETE)
3. Invalidate queries to refresh data
4. Handle loading and error states

Example component with full CRUD:
```typescript
function TaskManager() {
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data)
  })
  
  const queryClient = useQueryClient()
  
  const createTask = useMutation({
    mutationFn: (data) => api.post('/tasks', data),
    onSuccess: () => queryClient.invalidateQueries(['tasks'])
  })
  
  const updateTask = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['tasks'])
  })
  
  const deleteTask = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['tasks'])
  })
  
  // Use mutations in your UI...
}
```

Happy coding! 🎉




