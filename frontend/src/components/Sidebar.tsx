import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Calendar,
  Shield,
  Settings
} from 'lucide-react'
import { UserRole } from '../types'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Calendar', href: '/calendar', icon: Calendar, disabled: true },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const isOwner = user?.role === UserRole.OWNER

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">CasePilot</h1>
        <p className="text-sm text-gray-500 mt-1">Law Firm Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const isDisabled = item.disabled
          
          if (isDisabled) {
            return (
              <div
                key={item.name}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 cursor-not-allowed"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </div>
            )
          }
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          {isOwner && (
            <Link
              to="/admin/users"
              className={clsx(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                location.pathname.startsWith('/admin')
                  ? "bg-red-50 text-red-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Shield className="mr-3 h-5 w-5" />
              Admin
            </Link>
          )}
          <Link
            to="/settings"
            className={clsx(
              "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-1",
              location.pathname === '/settings'
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </div>
      </nav>
    </div>
  )
}




