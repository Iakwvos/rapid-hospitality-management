import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Wifi, Tv, Wind, Wine, Waves, Home } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Room = {
  id: string
  number: string
  type: 'single' | 'double' | 'suite' | 'deluxe'
  capacity: number
  price_per_night: number
  amenities: string[]
  status: 'available' | 'occupied' | 'maintenance'
  floor: number
}

const amenityIcons: Record<string, React.ComponentType> = {
  wifi: Wifi,
  tv: Tv,
  ac: Wind,
  minibar: Wine,
  jacuzzi: Waves,
  balcony: Home,
}

const statusColors = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
}

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`)
        const result = await response.json()

        if (!result.success && result.error) {
          throw new Error(result.error)
        }

        setRooms(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Rooms</h1>
        <div className="flex gap-2">
          {/* Add filters/actions here later */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const RoomIcon = room.type === 'single' ? Home
            : room.type === 'double' ? Home
            : room.type === 'suite' ? Home
            : Home

          return (
            <Card key={room.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <RoomIcon className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-medium">Room {room.number}</h3>
                  </div>
                  <Badge 
                    className={statusColors[room.status]}
                    variant="secondary"
                  >
                    {room.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-sm font-medium capitalize">{room.type}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="text-sm font-medium">
                      {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Price per night</p>
                    <p className="text-sm font-medium">
                      ${room.price_per_night.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity) => {
                        const Icon = amenityIcons[amenity] || Home
                        return (
                          <div
                            key={amenity}
                            className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1"
                          >
                            <Icon className="w-4 h-4 mr-1" />
                            <span className="capitalize">{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 