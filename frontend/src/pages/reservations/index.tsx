import { useEffect, useState } from 'react'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Calendar, Clock, Users, DollarSign, Hotel, 
  MessageSquare, CreditCard, User 
} from 'lucide-react'

interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string | null
  preferences: {
    room_type: string[]
    special_requests: string[]
    dietary_restrictions: string[]
  } | null
  vip_status: boolean
  loyalty_points: number
  created_at: string
  updated_at: string
  reservations: any[]
}

interface Reservation {
  id: string
  room_id: string
  guest_id: string
  check_in: string
  check_out: string
  status: string
  total_price: number
  special_requests?: string | null
  number_of_guests: number
  payment_status: string
  payment_method: string
  created_at: string
  updated_at: string
  room?: {
    id: string
    number: string
    type: string
    capacity: number
    price_per_night: number
    amenities: string[]
    status: string
    floor: number
    description: string
    image_url: string
    thumbnail_url: string
    gallery_urls: string[]
    features: string[]
    view_type: string
    size_sqm: number
    bed_type: string
    bathroom_count: number
    created_at: string
    updated_at: string
    reservations: any[]
  }
  guest?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    address: string
    preferences: {
      room_type: string[]
      special_requests: string[]
      dietary_restrictions: string[]
    }
    vip_status: boolean
    loyalty_points: number
    created_at: string
    updated_at: string
    reservations: any[]
  }
}

interface ApiResponse<T> {
  success: boolean
  count?: number
  data: T
  error?: string
}

const newGuestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
})

type NewGuestForm = z.infer<typeof newGuestSchema>

const newReservationSchema = z.object({
  guest_id: z.string().min(1, "Guest is required"),
  room_id: z.string().min(1, "Room is required"),
  check_in: z.date({
    required_error: "Check-in date is required",
  }),
  check_out: z.date({
    required_error: "Check-out date is required",
  }),
  number_of_guests: z.number().min(1, "At least one guest is required"),
  special_requests: z.string().optional(),
})

type NewReservationForm = z.infer<typeof newReservationSchema>

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [showNewGuest, setShowNewGuest] = useState(false)

  const form = useForm<NewReservationForm>({
    resolver: zodResolver(newReservationSchema),
    defaultValues: {
      guest_id: "",
      room_id: "",
      check_in: undefined,
      check_out: undefined,
      number_of_guests: 1,
      special_requests: "",
    },
  })

  const guestForm = useForm<NewGuestForm>({
    resolver: zodResolver(newGuestSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:5035/api/reservations')
        if (!response.ok) {
          throw new Error('Failed to fetch reservations')
        }
        const data: ApiResponse<Reservation[]> = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch reservations')
        }
        setReservations(data.data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
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
    const normalizedStatus = status.toLowerCase()
    switch (normalizedStatus) {
      case 'confirmed':
        return 'default'
      case 'checked_in':
        return 'secondary'
      case 'checked_out':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    switch (normalizedStatus) {
      case 'paid':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'refunded':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDate = (date: string) => {
    const utcDate = new Date(date)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(utcDate)
  }

  const formatPaymentMethod = (method: string) => {
    return method
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatPaymentStatus = (status: string) => {
    return status.toLowerCase()
  }

  const onCreateGuest = async (data: NewGuestForm) => {
    try {
      const guestData = {
        ...data,
        vip_status: false,
        loyalty_points: 0,
        preferences: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const response = await fetch('https://localhost:7138/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create guest')
      }

      const newGuest = await response.json()
      if (!newGuest.success) {
        throw new Error(newGuest.error || 'Failed to create guest')
      }
      setGuests([...guests, newGuest.data])
      form.setValue('guest_id', newGuest.data.id)
      setShowNewGuest(false)
      guestForm.reset()
      toast.success('Guest created successfully')
    } catch (err) {
      console.error('Failed to create guest:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create guest')
    }
  }

  const onSubmit = async (data: NewReservationForm) => {
    try {
      // Calculate total price based on room price and number of nights
      const selectedRoom = rooms.find(room => room.id === data.room_id);
      if (!selectedRoom) {
        throw new Error('Selected room not found');
      }

      const numberOfNights = Math.ceil(
        (data.check_out.getTime() - data.check_in.getTime()) / (1000 * 60 * 60 * 24)
      );
      const total_price = selectedRoom.price_per_night * numberOfNights;

      const formattedData = {
        guest_id: data.guest_id,
        room_id: data.room_id,
        check_in: data.check_in.toISOString(),
        check_out: data.check_out.toISOString(),
        number_of_guests: data.number_of_guests,
        special_requests: data.special_requests || '',
        status: 'confirmed',
        total_price,
        payment_status: 'pending',
        payment_method: 'credit_card',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5035/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const newReservation = await response.json();
      if (!newReservation.success) {
        throw new Error(newReservation.error || 'Failed to create reservation');
      }

      setReservations(prevReservations => [...prevReservations, newReservation.data]);
      toast.success('Reservation created successfully');
      setShowNewReservation(false);
      form.reset();
    } catch (err) {
      console.error('Failed to create reservation:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create reservation');
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reservations</h1>
        <div className="flex gap-2">
          {/* Add filters/actions here later */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Hotel className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">
                      Room {reservation.room?.number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {reservation.room?.type && (
                        reservation.room.type.charAt(0).toUpperCase() + 
                        reservation.room.type.slice(1).toLowerCase()
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusVariant(reservation.status)}>
                    {reservation.status.toLowerCase().replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPaymentStatusVariant(formatPaymentStatus(reservation.payment_status))}>
                    {formatPaymentStatus(reservation.payment_status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Check-in
                  </div>
                  <p className="text-sm font-medium">{formatDate(reservation.check_in)}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Check-out
                  </div>
                  <p className="text-sm font-medium">{formatDate(reservation.check_out)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {reservation.number_of_guests} {reservation.number_of_guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {calculateNights(reservation.check_in, reservation.check_out)} nights
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center text-sm mb-2">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-500">Guest Information</span>
                  </div>
                  <p className="text-sm font-medium">
                    {reservation.guest?.first_name} {reservation.guest?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{reservation.guest?.email}</p>
                  <p className="text-sm text-gray-600">{reservation.guest?.phone}</p>
                  {reservation.guest?.address && (
                    <p className="text-sm text-gray-600">{reservation.guest.address}</p>
                  )}
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center text-sm mb-2">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-500">Payment Details</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Method: {formatPaymentMethod(reservation.payment_method)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {formatPaymentStatus(reservation.payment_status)}
                      </p>
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      ${typeof reservation.total_price === 'number' ? reservation.total_price.toFixed(2) : reservation.total_price}
                    </div>
                  </div>
                </div>

                {reservation.special_requests && reservation.special_requests.trim() !== '' && (
                  <div className="border-t pt-3">
                    <div className="flex items-center text-sm mb-2">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-500">Special Requests</span>
                    </div>
                    <p className="text-sm text-gray-600">{reservation.special_requests}</p>
                  </div>
                )}

                {reservation.room?.amenities && reservation.room.amenities.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center text-sm mb-2">
                      <span className="text-gray-500">Room Amenities</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {reservation.room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
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