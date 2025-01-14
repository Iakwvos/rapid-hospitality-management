import { Link, Outlet } from 'react-router-dom'
import { Home, Users, Calendar, Hotel } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Rooms', href: '/rooms', icon: Hotel },
]

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo and Company Info */}
          <div className="flex flex-col items-start h-auto px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">
              HIT
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Hospitality Integrated Technologies
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Leading PMS Solutions Provider
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Company Info Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-2">
              <p>Mock Project Demo</p>
              <p className="font-medium mt-2">Developer Info:</p>
              <ul className="space-y-1">
                <li>Full Stack Developer</li>
                <li>Specialized in Modern Web Apps</li>
                <li>React & .NET Expert</li>
              </ul>
              <div className="mt-4 space-y-1">
                <p>Tech Expertise:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>React, TypeScript, Tailwind</li>
                  <li>.NET Core, C#, SQL</li>
                  <li>Cloud & DevOps</li>
                </ul>
              </div>
              <p className="mt-4">Contact: +30 698 15 63 865</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
} 