import { useEffect, useState } from 'react'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail, Phone, MapPin, Heart,
  Star, MessageSquare, Crown
} from 'lucide-react'

interface GuestPreferences {
  room_type?: string[]
  special_requests?: string[]
  dietary_restrictions?: string[]
}

interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string | null
  preferences: GuestPreferences | null
  vip_status: boolean
  loyalty_points: number
  created_at: string
  updated_at: string
  reservations: any[]
}

interface ApiResponse<T> {
  success: boolean
  count?: number
  data: T
  error?: string
}

export function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guests`)
        if (!response.ok) {
          throw new Error('Failed to fetch guests')
        }
        const data: ApiResponse<Guest[]> = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch guests')
        }
        setGuests(data.data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGuests()
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

  const hasPreferences = (preferences: GuestPreferences | null) => {
    if (!preferences) return false;
    return (
      (preferences.room_type && preferences.room_type.length > 0) ||
      (preferences.special_requests && preferences.special_requests.length > 0) ||
      (preferences.dietary_restrictions && preferences.dietary_restrictions.length > 0)
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Guests</h1>
        <div className="flex gap-2">
          {/* Add filters/actions here later */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {guests.map((guest) => (
          <Card key={guest.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">
                      {guest.first_name} {guest.last_name}
                    </h3>
                    {guest.vip_status && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm text-gray-600">
                      {guest.loyalty_points} points
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`mailto:${guest.email}`} className="text-primary hover:underline">
                    {guest.email}
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`tel:${guest.phone}`} className="text-gray-600 hover:text-primary">
                    {guest.phone}
                  </a>
                </div>
                {guest.address && (
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{guest.address}</span>
                  </div>
                )}

                {hasPreferences(guest.preferences) && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center mb-2">
                      <Heart className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium">Preferences</span>
                    </div>
                    <div className="space-y-2">
                      {guest.preferences?.room_type && guest.preferences.room_type.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Preferred Room Types</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {guest.preferences.room_type.map((type) => (
                              <Badge key={type} variant="secondary">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {guest.preferences?.special_requests && guest.preferences.special_requests.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Special Requests</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {guest.preferences.special_requests.map((request) => (
                              <Badge key={request} variant="outline">
                                {request}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {guest.preferences?.dietary_restrictions && guest.preferences.dietary_restrictions.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Dietary Restrictions</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {guest.preferences.dietary_restrictions.map((restriction) => (
                              <Badge key={restriction} variant="destructive">
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 