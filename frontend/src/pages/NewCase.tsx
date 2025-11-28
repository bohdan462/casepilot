import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { CaseStatus, UserRole } from '../types'
import { ArrowLeft } from 'lucide-react'

export default function NewCase() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    case_type: '',
    status: CaseStatus.OPEN,
    client_id: '',
    primary_attorney_id: user?.role === UserRole.LAWYER ? user.id.toString() : '',
    opened_date: '',
    next_hearing_date: '',
    statute_of_limitations: '',
  })

  // Fetch clients and users for dropdowns
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get('/clients')
      return response.data
    },
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data
    },
    enabled: user?.role === UserRole.OWNER,
  })

  const createCase = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/cases', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      navigate(`/cases/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData: any = {
      title: formData.title,
      description: formData.description || undefined,
      case_type: formData.case_type || undefined,
      status: formData.status,
      client_id: parseInt(formData.client_id),
      opened_date: formData.opened_date || undefined,
      next_hearing_date: formData.next_hearing_date || undefined,
      statute_of_limitations: formData.statute_of_limitations || undefined,
    }

    if (formData.primary_attorney_id) {
      submitData.primary_attorney_id = parseInt(formData.primary_attorney_id)
    }

    createCase.mutate(submitData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Case</h1>
          <p className="text-gray-600 mt-1">Create a new case</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {createCase.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {createCase.error instanceof Error ? createCase.error.message : 'Failed to create case'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Smith v. Insurance Co."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a client</option>
              {clients?.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Type
            </label>
            <input
              type="text"
              value={formData.case_type}
              onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Personal Injury, Employment Law"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStatus })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={CaseStatus.OPEN}>Open</option>
              <option value={CaseStatus.IN_PROGRESS}>In Progress</option>
              <option value={CaseStatus.ON_HOLD}>On Hold</option>
              <option value={CaseStatus.CLOSED}>Closed</option>
            </select>
          </div>

          {(user?.role === UserRole.OWNER || user?.role === UserRole.LAWYER) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Attorney
              </label>
              <select
                value={formData.primary_attorney_id}
                onChange={(e) => setFormData({ ...formData, primary_attorney_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Unassigned</option>
                {users?.filter((u: any) => u.role === UserRole.LAWYER || u.role === UserRole.OWNER).map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
                {user?.role === UserRole.LAWYER && (
                  <option value={user.id}>{user.full_name} (You)</option>
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opened Date
            </label>
            <input
              type="date"
              value={formData.opened_date}
              onChange={(e) => setFormData({ ...formData, opened_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Hearing Date
            </label>
            <input
              type="date"
              value={formData.next_hearing_date}
              onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statute of Limitations
            </label>
            <input
              type="date"
              value={formData.statute_of_limitations}
              onChange={(e) => setFormData({ ...formData, statute_of_limitations: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Case description and details..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCase.isPending}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createCase.isPending ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  )
}




