import { useState, useEffect } from "react"
import { Overview } from "@/components/dashboard/overview"
import { Reservation } from "@/types"
import { Loading } from "@/components/ui/loading"
import { ErrorMessage } from "@/components/ui/error-message"

export function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`)
        if (!response.ok) {
          throw new Error('Failed to fetch reservations')
        }
        const data = await response.json()
        setReservations(data.data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size={48} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">HIT Management Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Integrated Hospitality Solutions</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </span>
            <p className="text-xs text-gray-500 mt-1">Demo Version 1.0</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Tech Stack Highlights</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Frontend:</span> React + TypeScript
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium">Styling:</span> Tailwind CSS
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium">Backend:</span> ASP.NET Core Web API
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium">Database:</span> Supabase
            </div>
          </div>
        </div>
      </div>
      <Overview reservations={reservations} />
    </div>
  )
} 