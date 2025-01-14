import { useEffect, useState } from 'react'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Wifi, Tv, Wind, Wine, Waves, Home, Users, DollarSign,
  Building, Maximize, Bed, Bath, Eye, Coffee, LucideIcon
} from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

interface Room {
  id: string
  number: string
  type: string
  capacity: number
  price_per_night: number
  amenities: string[]
  status: string
  floor: number
  description: string | null
  image_url: string | null
  thumbnail_url: string | null
  gallery_urls: string[]
  features: string[]
  view_type: string | null
  size_sqm: number
  bed_type: string
  bathroom_count: number
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

interface IconWrapperProps {
  icon: LucideIcon
  className?: string
}

const IconWrapper = ({ icon: Icon, className }: IconWrapperProps) => {
  return <Icon className={className} />
}

const amenityIcons: Record<string, LucideIcon> = {
  wifi: Wifi,
  tv: Tv,
  ac: Wind,
  minibar: Wine,
  jacuzzi: Waves,
  balcony: Home,
  coffee: Coffee,
}

const roomTypeIcons: Record<string, LucideIcon> = {
  single: Home,
  double: Users,
  suite: Building,
  deluxe: DollarSign,
}

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:5035/api/rooms')
        if (!response.ok) {
          throw new Error('Failed to fetch rooms')
        }
        const data: ApiResponse<Room[]> = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch rooms')
        }
        setRooms(data.data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
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

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'default'
      case 'occupied':
        return 'destructive'
      case 'maintenance':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Rooms</h1>
        <div className="flex gap-2">
          {/* Add filters/actions here later */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const RoomIcon = roomTypeIcons[room.type.toLowerCase()] || Home

          return (
            <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <AspectRatio ratio={4/3} className="bg-muted">
                {room.image_url ? (
                  <img
                    src={room.image_url}
                    alt={`Room ${room.number}`}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </AspectRatio>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <IconWrapper icon={RoomIcon} className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Room {room.number}</h3>
                      <p className="text-sm text-gray-500 capitalize">{room.type}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(room.status)}>
                    {room.status}
                  </Badge>
                </div>

                {room.description && (
                  <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <Maximize className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{room.size_sqm} m²</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Up to {room.capacity} guests</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Bed className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{room.bed_type}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Bath className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{room.bathroom_count} {room.bathroom_count === 1 ? 'bathroom' : 'bathrooms'}</span>
                  </div>
                  {room.view_type && (
                    <div className="flex items-center text-sm">
                      <Eye className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{room.view_type}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Floor {room.floor}</span>
                  </div>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity) => {
                        const Icon = amenityIcons[amenity.toLowerCase()] || Home
                        return (
                          <div
                            key={amenity}
                            className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1"
                          >
                            <IconWrapper icon={Icon} className="w-4 h-4 mr-1" />
                            <span className="capitalize">{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {room.features && room.features.length > 0 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Features: {room.features.join(', ')}
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      ${room.price_per_night}/night
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 