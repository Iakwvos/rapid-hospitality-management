import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Reservation } from "@/types"
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Download } from "lucide-react"

interface ReportsProps {
  reservations: Reservation[]
}

export function Reports({ reservations }: ReportsProps) {
  const currentDate = new Date()
  const currentMonth = format(currentDate, 'MMMM yyyy')
  const lastMonth = format(subMonths(currentDate, 1), 'MMMM yyyy')

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'report.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadFinancialReport = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    const monthlyReservations = reservations.filter(res => {
      const checkIn = parseISO(res.check_in)
      return checkIn >= monthStart && checkIn <= monthEnd
    })

    const reportData = monthlyReservations.map(res => ({
      date: format(parseISO(res.check_in), 'yyyy-MM-dd'),
      room_number: res.room?.number,
      guest_name: `${res.guest?.first_name} ${res.guest?.last_name}`,
      total_price: res.total_price,
      payment_status: res.payment_status,
      payment_method: res.payment_method
    }))

    generateCSV(reportData, ['date', 'room_number', 'guest_name', 'total_price', 'payment_status', 'payment_method'])
  }

  const downloadOccupancyReport = () => {
    const reportData = reservations
      .filter(res => res.status !== 'cancelled')
      .map(res => ({
        check_in: format(parseISO(res.check_in), 'yyyy-MM-dd'),
        check_out: format(parseISO(res.check_out), 'yyyy-MM-dd'),
        room_number: res.room?.number,
        room_type: res.room?.type,
        guest_count: res.number_of_guests,
        status: res.status
      }))

    generateCSV(reportData, ['check_in', 'check_out', 'room_number', 'room_type', 'guest_count', 'status'])
  }

  const downloadGuestReport = () => {
    const guestData = new Map()
    
    reservations.forEach(res => {
      if (!res.guest) return
      const guestId = res.guest.id
      if (!guestData.has(guestId)) {
        guestData.set(guestId, {
          guest_name: `${res.guest.first_name} ${res.guest.last_name}`,
          email: res.guest.email,
          phone: res.guest.phone,
          total_stays: 0,
          total_spent: 0
        })
      }
      
      const data = guestData.get(guestId)
      data.total_stays++
      data.total_spent += res.total_price
      guestData.set(guestId, data)
    })

    const reportData = Array.from(guestData.values())
    generateCSV(reportData, ['guest_name', 'email', 'phone', 'total_stays', 'total_spent'])
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Financial Report</CardTitle>
          <CardDescription>
            Revenue and payment details for {currentMonth}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadFinancialReport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy Report</CardTitle>
          <CardDescription>
            Room occupancy and booking details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadOccupancyReport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guest Analysis</CardTitle>
          <CardDescription>
            Guest statistics and booking history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadGuestReport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 