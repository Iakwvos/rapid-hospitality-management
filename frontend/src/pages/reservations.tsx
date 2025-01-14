import * as React from "react"
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, parseISO, isSameDay, addDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, set } from 'date-fns'
import { Check, ChevronsUpDown, ChevronLeft, ChevronRight, Filter, Plus, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { Room, Guest, Reservation, FilterType } from '@/types'
import { Toaster } from 'sonner'

interface TimeSlot {
  hour: number;
  minute: number;
}

// Change to hourly increments (8 AM to 5 PM)
const HOURS: TimeSlot[] = Array.from({ length: 10 }, (_, i) => ({
  hour: i + 8,
  minute: 0
}))

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

const newGuestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
})

type NewGuestForm = z.infer<typeof newGuestSchema>

const editReservationSchema = z.object({
  status: z.enum(['confirmed', 'checked_in', 'checked_out', 'cancelled']),
  payment_status: z.enum(['pending', 'paid', 'refunded']),
  check_in: z.date(),
  check_out: z.date(),
  special_requests: z.string().optional(),
})

type EditReservationForm = z.infer<typeof editReservationSchema>

type FormFieldProps = {
  field: {
    onChange: (...event: any[]) => void;
    value: any;
    name: string;
    onBlur: () => void;
  };
}

export type ViewMode = 'week' | 'month'

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [filter, setFilter] = useState<FilterType>('all')
  const [showNewReservation, setShowNewReservation] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [openGuest, setOpenGuest] = useState(false)
  const [openRoom, setOpenRoom] = useState(false)
  const [showNewGuest, setShowNewGuest] = useState(false)
  const [guestSearch, setGuestSearch] = useState("")
  const [roomSearch, setRoomSearch] = useState("")

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

  const editForm = useForm<EditReservationForm>({
    resolver: zodResolver(editReservationSchema),
  })

  useEffect(() => {
    if (selectedReservation) {
      editForm.reset({
        status: selectedReservation.status,
        payment_status: selectedReservation.payment_status,
        check_in: parseISO(selectedReservation.check_in),
        check_out: parseISO(selectedReservation.check_out),
        special_requests: selectedReservation.special_requests || '',
      });
    }
  }, [selectedReservation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guestsResponse, roomsResponse, reservationsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/guests`),
          fetch(`${import.meta.env.VITE_API_URL}/api/rooms`),
          fetch(`${import.meta.env.VITE_API_URL}/api/reservations`)
        ])

        if (!guestsResponse.ok || !roomsResponse.ok || !reservationsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const guestsData = await guestsResponse.json()
        const roomsData = await roomsResponse.json()
        const reservationsData = await reservationsResponse.json()

        setGuests(guestsData.data || [])
        setRooms(roomsData.data || [])
        setReservations(reservationsData.data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guests`)
        if (!response.ok) {
          throw new Error('Failed to fetch guests')
        }
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch guests')
        }
        setGuests(data.data)
      } catch (err) {
        console.error('Error fetching guests:', err)
        toast.error('Failed to fetch guests')
      }
    }

    if (showNewReservation) {
      fetchGuests()
    }
  }, [showNewReservation])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`)
        if (!response.ok) {
          throw new Error('Failed to fetch rooms')
        }
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch rooms')
        }
        setRooms(data.data)
      } catch (err) {
        console.error('Error fetching rooms:', err)
        toast.error('Failed to fetch rooms')
      }
    }

    if (showNewReservation) {
      fetchRooms()
    }
  }, [showNewReservation])

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

  const getReservationsForDateAndHour = (date: Date, timeSlot: TimeSlot) => {
    return reservations.filter(reservation => {
      if (!reservation.check_in || !reservation.check_out) return false;
      
      const checkIn = parseISO(reservation.check_in)
      const checkOut = parseISO(reservation.check_out)
      const checkInHour = checkIn.getHours()
      const checkOutHour = checkOut.getHours()
      const isCheckIn = isSameDay(date, checkIn) && checkInHour === timeSlot.hour
      const isCheckOut = isSameDay(date, checkOut) && checkOutHour === timeSlot.hour

      switch (filter) {
        case 'check-in':
          return isCheckIn
        case 'check-out':
          return isCheckOut
        case 'confirmed':
          return reservation.status === 'confirmed' && (isCheckIn || isCheckOut)
        case 'cancelled':
          return reservation.status === 'cancelled' && (isCheckIn || isCheckOut)
        default:
          return isCheckIn || isCheckOut
      }
    })
  }

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      if (!reservation.check_in || !reservation.check_out) return false;
      
      const checkIn = parseISO(reservation.check_in)
      const checkOut = parseISO(reservation.check_out)
      const isCheckIn = isSameDay(date, checkIn)
      const isCheckOut = isSameDay(date, checkOut)

      switch (filter) {
        case 'check-in':
          return isCheckIn
        case 'check-out':
          return isCheckOut
        case 'confirmed':
          return reservation.status === 'confirmed' && (isCheckIn || isCheckOut)
        case 'cancelled':
          return reservation.status === 'cancelled' && (isCheckIn || isCheckOut)
        default:
          return isCheckIn || isCheckOut
      }
    })
  }

  const getStatusColor = (status: Reservation['status'], isCheckIn: boolean, isCheckOut: boolean) => {
    const baseColor = {
      confirmed: 'bg-blue-500 text-white',
      checked_in: 'bg-green-500 text-white',
      checked_out: 'bg-gray-500 text-white',
      cancelled: 'bg-red-500 text-white',
    }[status] || 'bg-gray-500 text-white'

    const border = isCheckIn ? 'border-l-4 border-green-300' : 
                  isCheckOut ? 'border-r-4 border-orange-300' : ''

    return `${baseColor} ${border}`
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(current => {
      switch (viewMode) {
        case 'week':
          return direction === 'next' ? addWeeks(current, 1) : subWeeks(current, 1)
        case 'month':
          return direction === 'next' ? addMonths(current, 1) : subMonths(current, 1)
        default:
          return current
      }
    })
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setViewMode('week')
  }

  const weekStart = startOfWeek(selectedDate)
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  
  const daysToShow = viewMode === 'week'
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : eachDayOfInterval({ start: monthStart, end: monthEnd })

  const calculateReservationPosition = (
    reservation: Reservation, 
    allReservations: Reservation[], 
    timeSlot: TimeSlot
  ) => {
    const overlappingReservations = allReservations.filter(r => {
      const rCheckIn = parseISO(r.check_in)
      const rCheckOut = parseISO(r.check_out)
      const rCheckInHour = rCheckIn.getHours()
      const rCheckOutHour = rCheckOut.getHours()
      return rCheckInHour === timeSlot.hour || rCheckOutHour === timeSlot.hour
    })

    const index = overlappingReservations.findIndex(r => r.id === reservation.id)
    const totalOverlapping = overlappingReservations.length
    const height = 24 // Base height for each reservation
    const gap = 2 // Gap between overlapping reservations
    const totalHeight = 100 - 8 // Total available height (100px minus padding)
    
    if (totalOverlapping === 1) {
      return {
        top: '4px',
        height: `${height}px`,
        width: 'calc(100% - 8px)'
      }
    }

    const reservationHeight = Math.min(height, (totalHeight - (gap * (totalOverlapping - 1))) / totalOverlapping)
    const top = 4 + (index * (reservationHeight + gap))

    return {
      top: `${top}px`,
      height: `${reservationHeight}px`,
      width: 'calc(100% - 8px)'
    }
  }

  const renderWeekView = () => (
    <>
      <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b">
        <div className="p-4 font-medium text-gray-500">Time</div>
        {daysToShow.map((day) => (
          <div key={day.toISOString()} className="p-4 text-center">
            <div className="font-medium">{format(day, 'EEE')}</div>
            <div className="text-sm text-gray-500">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div className="divide-y">
        {HOURS.map((timeSlot) => (
          <div key={`${timeSlot.hour}`} className="grid grid-cols-[100px_repeat(7,1fr)] min-h-[100px]">
            <div className="p-2 text-sm text-gray-500 border-r">
              {format(set(new Date(), { hours: timeSlot.hour, minutes: 0 }), 'h a')}
            </div>
            {daysToShow.map((day) => {
              const dayReservations = getReservationsForDateAndHour(day, timeSlot)
              return (
                <div key={day.toISOString()} className="p-1 border-r relative">
                  {dayReservations.map((reservation) => {
                    const checkIn = parseISO(reservation.check_in)
                    const checkOut = parseISO(reservation.check_out)
                    const isCheckIn = isSameDay(day, checkIn) && 
                      checkIn.getHours() === timeSlot.hour
                    const isCheckOut = isSameDay(day, checkOut) && 
                      checkOut.getHours() === timeSlot.hour
                    const position = calculateReservationPosition(reservation, dayReservations, timeSlot)

                    return (
                      <button
                        key={reservation.id}
                        onClick={() => setSelectedReservation(reservation)}
                        className={`absolute rounded p-1 text-xs ${getStatusColor(reservation.status, isCheckIn, isCheckOut)}`}
                        style={{
                          ...position,
                          left: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div className="font-medium truncate">
                          Room {reservation.room?.number}
                          {isCheckIn && ' (In)'}
                          {isCheckOut && ' (Out)'}
                        </div>
                        <div className="truncate">
                          {reservation.guest?.first_name} {reservation.guest?.last_name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )

  const handleEventClick = (e: React.MouseEvent, reservation: Reservation) => {
    e.stopPropagation() // Prevent day click from triggering
    setSelectedReservation(reservation)
  }

  const onSubmit = async (data: NewReservationForm) => {
    try {
      const selectedRoom = rooms.find(room => room.id === data.room_id);
      if (!selectedRoom) {
        throw new Error('Selected room not found');
      }

      const numberOfNights = Math.ceil(
        (data.check_out.getTime() - data.check_in.getTime()) / (1000 * 60 * 60 * 24)
      );
      const total_price = selectedRoom.price_per_night * numberOfNights;

      // Format the data according to the backend's expectations
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

      console.log('Sending reservation data:', formattedData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
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

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create reservation');
      }

      setReservations(prevReservations => [...prevReservations, result.data]);
      toast.success('Reservation created successfully');
      setShowNewReservation(false);
      form.reset();
    } catch (err) {
      console.error('Failed to create reservation:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create reservation');
    }
  }

  const renderMonthView = () => {
    const weeks = Math.ceil(daysToShow.length / 7)
    return (
      <>
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-rows-[repeat(6,minmax(120px,1fr))]">
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b">
              {daysToShow.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const dayReservations = getReservationsForDate(day)
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`p-2 border-r relative text-left hover:bg-gray-50 ${
                      format(day, 'M') !== format(selectedDate, 'M')
                        ? 'bg-gray-50'
                        : ''
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayReservations.map((reservation) => {
                        const checkIn = parseISO(reservation.check_in)
                        const checkOut = parseISO(reservation.check_out)
                        const isCheckIn = isSameDay(day, checkIn)
                        const isCheckOut = isSameDay(day, checkOut)

                        return (
                          <div
                            key={reservation.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(e, reservation)
                            }}
                            className={`w-full rounded p-1 text-xs cursor-pointer ${getStatusColor(
                              reservation.status,
                              isCheckIn,
                              isCheckOut
                            )}`}
                          >
                            <div className="font-medium truncate">
                              Room {reservation.room?.number}
                              {isCheckIn && ' (In)'}
                              {isCheckOut && ' (Out)'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </>
    )
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'week':
        return `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
      case 'month':
        return format(selectedDate, 'MMMM yyyy')
      default:
        return ''
    }
  }

  const onCreateGuest = async (data: NewGuestForm) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create guest')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to create guest')
      }

      setGuests([...guests, result.data])
      form.setValue('guest_id', result.data.id)
      setShowNewGuest(false)
      guestForm.reset()
      toast.success('Guest created successfully')
    } catch (err) {
      console.error('Failed to create guest:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create guest')
    }
  }

  const filteredGuests = guests.filter(guest => 
    `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(guestSearch.toLowerCase())
  )

  const filteredRooms = rooms.filter(room => 
    room.number.toLowerCase().includes(roomSearch.toLowerCase()) ||
    room.type.toLowerCase().includes(roomSearch.toLowerCase()) ||
    `Floor ${room.floor}`.toLowerCase().includes(roomSearch.toLowerCase())
  )

  const renderGuestField = ({ field }: FormFieldProps) => (
    <FormItem className="flex flex-col">
      <FormLabel>Guest</FormLabel>
      <div className="flex gap-2">
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select guest" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {guests.map((guest) => (
              <SelectItem key={guest.id} value={guest.id}>
                {guest.first_name} {guest.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowNewGuest(true)}
          className="shrink-0 px-3"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Guest
        </Button>
      </div>
      <FormMessage />
    </FormItem>
  )

  const renderRoomField = ({ field }: FormFieldProps) => (
    <FormItem className="flex flex-col">
      <FormLabel>Room</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select room" />
        </SelectTrigger>
        <SelectContent>
          {rooms.map((room) => (
            <SelectItem key={room.id} value={room.id}>
              Room {room.number} ({room.type}) - ${room.price_per_night}/night
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )

  const onEditSubmit = async (data: EditReservationForm) => {
    if (!selectedReservation) return;
    
    try {
      // Calculate total price if dates have changed
      const numberOfNights = Math.ceil(
        (data.check_out.getTime() - data.check_in.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get the room details from the existing reservation
      const room = selectedReservation.room;
      if (!room) {
        throw new Error('Room information not found');
      }

      // Format the data according to the backend's expectations
      const formattedData = {
        id: selectedReservation.id,
        guest_id: selectedReservation.guest_id,
        room_id: selectedReservation.room_id,
        check_in: data.check_in.toISOString(),
        check_out: data.check_out.toISOString(),
        status: data.status,
        total_price: room.price_per_night * numberOfNights,
        special_requests: data.special_requests || '',
        number_of_guests: selectedReservation.number_of_guests,
        payment_status: data.payment_status,
        payment_method: selectedReservation.payment_method,
        created_at: selectedReservation.created_at,
        updated_at: new Date().toISOString()
      };

      console.log('Updating reservation with data:', formattedData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update reservation');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update reservation');
      }

      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === selectedReservation.id ? result.data : res
        )
      );
      
      toast.success('Reservation updated successfully');
      setSelectedReservation(null);
    } catch (err) {
      console.error('Failed to update reservation:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update reservation');
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Toaster position="bottom-right" richColors />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Reservations
            <span className="ml-2 text-lg font-normal text-gray-500">
              {getViewTitle()}
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2">
              <div className="space-y-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilter('all')}
                >
                  All Events
                </Button>
                <Button 
                  variant={filter === 'check-in' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilter('check-in')}
                >
                  Check-ins Only
                </Button>
                <Button 
                  variant={filter === 'check-out' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilter('check-out')}
                >
                  Check-outs Only
                </Button>
                <Button 
                  variant={filter === 'confirmed' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilter('confirmed')}
                >
                  Confirmed Only
                </Button>
                <Button 
                  variant={filter === 'cancelled' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setFilter('cancelled')}
                >
                  Cancelled Only
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            size="icon" 
            variant="outline" 
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              setShowNewReservation(true)
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>

      <Dialog 
        open={!!selectedReservation} 
        onOpenChange={(open) => {
          if (!open) setSelectedReservation(null)
        }}
      >
        <DialogContent 
          className="sm:max-w-[600px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Guest</div>
                    <div>{selectedReservation.guest?.first_name} {selectedReservation.guest?.last_name}</div>
                    <div className="text-sm text-gray-500">{selectedReservation.guest?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Room</div>
                    <div>Room {selectedReservation.room?.number}</div>
                    <div className="text-sm text-gray-500">Floor {selectedReservation.room?.floor}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="check_in"
                    defaultValue={parseISO(selectedReservation.check_in)}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Check-in Date & Time</FormLabel>
                        <div className="flex flex-col gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date: Date | undefined) => {
                                  if (date) {
                                    const newDate = new Date(date.getTime());
                                    newDate.setHours(12, 0, 0, 0); // Set default check-in time to 12:00 PM
                                    field.onChange(newDate);
                                  }
                                }}
                                disabled={(date) =>
                                  editForm.getValues("check_out") && date > editForm.getValues("check_out")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Select
                            value={format(field.value, 'HH:mm')}
                            onValueChange={(time) => {
                              const [hours, minutes] = time.split(':').map(Number);
                              const newDate = new Date(field.value);
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                              {HOURS.map((timeSlot) => {
                                const time = set(new Date(), { hours: timeSlot.hour, minutes: timeSlot.minute });
                                const value = format(time, 'HH:mm');
                                const display = format(time, 'h:mm a');
                                return (
                                  <SelectItem key={value} value={value}>
                                    {display}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="check_out"
                    defaultValue={parseISO(selectedReservation.check_out)}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Check-out Date & Time</FormLabel>
                        <div className="flex flex-col gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date: Date | undefined) => {
                                  if (date) {
                                    const newDate = new Date(date.getTime());
                                    newDate.setHours(11, 0, 0, 0); // Set default check-out time to 11:00 AM
                                    field.onChange(newDate);
                                  }
                                }}
                                disabled={(date) =>
                                  editForm.getValues("check_in") && date < editForm.getValues("check_in")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Select
                            value={format(field.value, 'HH:mm')}
                            onValueChange={(time) => {
                              const [hours, minutes] = time.split(':').map(Number);
                              const newDate = new Date(field.value);
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                              {HOURS.map((timeSlot) => {
                                const time = set(new Date(), { hours: timeSlot.hour, minutes: timeSlot.minute });
                                const value = format(time, 'HH:mm');
                                const display = format(time, 'h:mm a');
                                return (
                                  <SelectItem key={value} value={value}>
                                    {display}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="status"
                    defaultValue={selectedReservation.status}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="checked_in">Checked In</SelectItem>
                            <SelectItem value="checked_out">Checked Out</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="payment_status"
                    defaultValue={selectedReservation.payment_status}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="special_requests"
                  defaultValue={selectedReservation.special_requests}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setSelectedReservation(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showNewReservation} 
        onOpenChange={(open) => {
          if (!open) setShowNewReservation(false)
        }}
      >
        <DialogContent 
          className="max-w-md" 
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>New Reservation</DialogTitle>
            <DialogDescription id="reservation-dialog-description">
              Create a new reservation by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="guest_id"
                render={renderGuestField}
              />
              <FormField
                control={form.control}
                name="room_id"
                render={renderRoomField}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="check_in"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-in Date & Time</FormLabel>
                      <div className="flex flex-col gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date: Date | undefined) => {
                                if (date) {
                                  const newDate = new Date(date.getTime());
                                  newDate.setHours(12, 0, 0, 0); // Set default check-in time to 12:00 PM
                                  field.onChange(newDate);
                                }
                              }}
                              disabled={(date) =>
                                date < new Date() || (form.getValues("check_out") && date > form.getValues("check_out"))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Select
                          value={field.value ? format(field.value, 'HH:mm') : '12:00'}
                          onValueChange={(time) => {
                            const [hours, minutes] = time.split(':').map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hours, minutes);
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {HOURS.map((timeSlot) => {
                              const time = set(new Date(), { hours: timeSlot.hour, minutes: 0 });
                              const value = format(time, 'HH:mm');
                              const display = format(time, 'h:mm a');
                              return (
                                <SelectItem key={value} value={value}>
                                  {display}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="check_out"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-out Date & Time</FormLabel>
                      <div className="flex flex-col gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date: Date | undefined) => {
                                if (date) {
                                  const newDate = new Date(date.getTime());
                                  newDate.setHours(11, 0, 0, 0); // Set default check-out time to 11:00 AM
                                  field.onChange(newDate);
                                }
                              }}
                              disabled={(date) =>
                                date < new Date() || (form.getValues("check_in") && date < form.getValues("check_in"))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Select
                          value={field.value ? format(field.value, 'HH:mm') : '11:00'}
                          onValueChange={(time) => {
                            const [hours, minutes] = time.split(':').map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hours, minutes);
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {HOURS.map((timeSlot) => {
                              const time = set(new Date(), { hours: timeSlot.hour, minutes: 0 });
                              const value = format(time, 'HH:mm');
                              const display = format(time, 'h:mm a');
                              return (
                                <SelectItem key={value} value={value}>
                                  {display}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="number_of_guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="special_requests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Reservation</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showNewGuest} 
        onOpenChange={(open) => {
          if (!open) setShowNewGuest(false)
        }}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Create New Guest</DialogTitle>
          </DialogHeader>
          <Form {...guestForm}>
            <form onSubmit={guestForm.handleSubmit(onCreateGuest)} className="space-y-4">
              <FormField
                control={guestForm.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestForm.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewGuest(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Guest</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 