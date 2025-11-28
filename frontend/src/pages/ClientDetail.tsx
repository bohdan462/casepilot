import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { Edit, Plus } from 'lucide-react'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const response = await api.get(`/clients/${id}`)
      return response.data
    },
  })

  const { data: cases } = useQuery({
    queryKey: ['cases', 'client', id],
    queryFn: async () => {
      const response = await api.get('/cases', { params: { client_id: id } })
      return response.data
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading client...</div>
  }

  if (!client) {
    return <div className="text-center py-12">Client not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Email</dt>
                <dd className="text-sm font-medium">{client.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Phone</dt>
                <dd className="text-sm font-medium">{client.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Address</dt>
                <dd className="text-sm font-medium">{client.address || '-'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">{cases?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Cases</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {cases?.filter((c: any) => c.status !== 'closed').length || 0}
                </p>
                <p className="text-sm text-gray-600">Active Cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cases for {client.name}</h2>
          <Link
            to="/cases/new"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Link>
        </div>

        {cases?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No cases found for this client</p>
            <Link to="/cases/new" className="text-primary-600 hover:underline">
              Create a new case
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Attorney</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases?.map((caseItem: any) => (
                  <tr
                    key={caseItem.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/cases/${caseItem.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {caseItem.case_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/cases/${caseItem.id}`}
                        className="text-sm font-medium text-primary-600 hover:underline"
                      >
                        {caseItem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        caseItem.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        caseItem.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {caseItem.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.primary_attorney?.full_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.updated_at ? new Date(caseItem.updated_at).toLocaleDateString() : '-'}
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




