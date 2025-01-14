export type Room = {
  id: string
  number: string
  type: 'single' | 'double' | 'suite' | 'deluxe'
  capacity: number
  price_per_night: number
  amenities: string[]
  status: 'available' | 'occupied' | 'maintenance'
  floor: number
  created_at: string
  updated_at: string
}

export type Guest = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  preferences: {
    room_type?: string[]
    special_requests?: string[]
    dietary_restrictions?: string[]
  }
  created_at: string
  updated_at: string
}

export type Reservation = {
  id: string
  room_id: string
  guest_id: string
  check_in: string
  check_out: string
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  total_price: number
  special_requests?: string
  number_of_guests: number
  created_at: string
  updated_at: string
}

export type Database = {
  rooms: Room[]
  guests: Guest[]
  reservations: Reservation[]
} 