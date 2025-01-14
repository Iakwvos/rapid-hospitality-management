import { format, parseISO } from "date-fns"
import { Reservation } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentReservationsProps {
  reservations: Reservation[]
}

export function RecentReservations({ reservations }: RecentReservationsProps) {
  return (
    <div className="space-y-8">
      {reservations.map((reservation) => {
        const checkIn = parseISO(reservation.check_in)
        const checkOut = parseISO(reservation.check_out)
        
        return (
          <div key={reservation.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {reservation.guest?.first_name?.[0]}
                {reservation.guest?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {reservation.guest?.first_name} {reservation.guest?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Room {reservation.room?.number} • {format(checkIn, "MMM d")} - {format(checkOut, "MMM d")}
              </p>
            </div>
            <div className="ml-auto font-medium">
              ${reservation.total_price}
            </div>
          </div>
        )
      })}
    </div>
  )
} 