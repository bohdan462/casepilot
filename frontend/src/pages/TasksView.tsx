import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { TaskStatus, TaskPriority } from '../types'
import { format } from 'date-fns'

export default function TasksView() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [assigneeFilter, setAssigneeFilter] = useState<number | null>(null)
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [dueToday, setDueToday] = useState(false)

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'all', statusFilter, assigneeFilter, overdueOnly, dueToday],
    queryFn: async () => {
      const params: any = { limit: 100 }
      if (statusFilter) params.status = statusFilter
      if (assigneeFilter) params.assignee_id = assigneeFilter
      if (overdueOnly) params.overdue_only = true
      if (dueToday) params.due_today = true
      const response = await api.get('/tasks', { params })
      return response.data
    },
  })

  const getStatusBadge = (status: TaskStatus) => {
    const styles = {
      [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
      [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [TaskStatus.DONE]: 'bg-green-100 text-green-800',
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

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600 mt-1">Manage all your tasks</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Overdue Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={dueToday}
              onChange={(e) => setDueToday(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Due Today</span>
          </label>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading tasks...</div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No tasks found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks?.map((task: any) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/cases/${task.case_id}`}
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/cases/${task.case_id}`}
                        className="text-sm font-medium text-primary-600 hover:underline"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.case?.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {task.assignee?.full_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {task.due_date ? (
                        <span className={isOverdue(task.due_date) ? 'text-red-600 font-medium' : ''}>
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}




