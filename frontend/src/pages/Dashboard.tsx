import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types'
import api from '../services/api'
import { Briefcase, CheckSquare, AlertCircle, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const isOwner = user?.role === UserRole.OWNER
  const isLawyer = user?.role === UserRole.LAWYER
  const isAssistant = user?.role === UserRole.ASSISTANT

  const { data: cases } = useQuery({
    queryKey: ['cases', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/cases', { params: { limit: 5 } })
      return response.data
    },
  })

  const { data: tasks } = useQuery({
    queryKey: ['tasks', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/tasks', { params: { limit: 10 } })
      return response.data
    },
  })

  const overdueTasks = tasks?.filter((task: any) => {
    if (!task.due_date || task.status === 'done') return false
    return new Date(task.due_date) < new Date()
  }) || []

  const todayTasks = tasks?.filter((task: any) => {
    if (!task.due_date || task.status === 'done') return false
    const today = new Date()
    const dueDate = new Date(task.due_date)
    return dueDate.toDateString() === today.toDateString()
  }) || []

  const upcomingTasks = tasks?.filter((task: any) => {
    if (!task.due_date || task.status === 'done') return false
    const today = new Date()
    const dueDate = new Date(task.due_date)
    return dueDate > today && dueDate.toDateString() !== today.toDateString()
  }) || []

  if (isOwner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Firm Overview</h1>
          <p className="text-gray-600 mt-1">Dashboard for {user?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Open Cases</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {cases?.filter((c: any) => c.status !== 'closed').length || 0}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {tasks?.filter((t: any) => t.status !== 'done').length || 0}
                </p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{overdueTasks.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Open Cases</h2>
              <Link to="/cases" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {cases?.slice(0, 5).map((caseItem: any) => (
                <Link
                  key={caseItem.id}
                  to={`/cases/${caseItem.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{caseItem.title}</p>
                      <p className="text-sm text-gray-600">{caseItem.client?.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      caseItem.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      caseItem.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="text-center text-gray-500 text-sm py-8">
              Recent activity will appear here
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLawyer || isAssistant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isLawyer ? 'My Cases & Tasks' : 'My Assignments'}
          </h1>
          <p className="text-gray-600 mt-1">Dashboard for {user?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Open Cases</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {cases?.filter((c: any) => c.status !== 'closed').length || 0}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{overdueTasks.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Today</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{todayTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Cases</h2>
              <Link to="/cases" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {cases?.slice(0, 5).map((caseItem: any) => (
                <Link
                  key={caseItem.id}
                  to={`/cases/${caseItem.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{caseItem.title}</p>
                      <p className="text-sm text-gray-600">{caseItem.client?.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      caseItem.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      caseItem.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
            <div className="space-y-3">
              {overdueTasks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">Overdue</p>
                  {overdueTasks.slice(0, 3).map((task: any) => (
                    <div key={task.id} className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.case?.title}</p>
                    </div>
                  ))}
                </div>
              )}
              {todayTasks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-2">Due Today</p>
                  {todayTasks.slice(0, 3).map((task: any) => (
                    <div key={task.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.case?.title}</p>
                    </div>
                  ))}
                </div>
              )}
              {upcomingTasks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Upcoming</p>
                  {upcomingTasks.slice(0, 3).map((task: any) => (
                    <div key={task.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-2">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.case?.title}</p>
                    </div>
                  ))}
                </div>
              )}
              {tasks?.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No tasks found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="text-center text-gray-500 text-sm py-8">
            Recent activity will appear here
          </div>
        </div>
      </div>
    )
  }

  return null
}




