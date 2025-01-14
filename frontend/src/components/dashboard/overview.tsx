import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reservation } from "@/types"
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, isSameMonth, subMonths, isToday, startOfDay, endOfDay } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface OverviewProps {
  reservations: Reservation[]
}

export function Overview({ reservations }: OverviewProps) {
  // Calculate current month's revenue
  const currentDate = new Date()
  const currentMonthStart = startOfMonth(currentDate)
  const currentMonthEnd = endOfMonth(currentDate)
  
  const currentMonthReservations = reservations.filter(res => {
    const checkIn = parseISO(res.check_in)
    return isWithinInterval(checkIn, { start: currentMonthStart, end: currentMonthEnd }) &&
           res.status !== 'cancelled'
  })

  // Calculate last month's revenue for comparison
  const lastMonthStart = startOfMonth(subMonths(currentDate, 1))
  const lastMonthEnd = endOfMonth(subMonths(currentDate, 1))
  
  const lastMonthReservations = reservations.filter(res => {
    const checkIn = parseISO(res.check_in)
    return isWithinInterval(checkIn, { start: lastMonthStart, end: lastMonthEnd }) &&
           res.status !== 'cancelled'
  })

  const currentMonthRevenue = currentMonthReservations.reduce((sum, res) => sum + res.total_price, 0)
  const lastMonthRevenue = lastMonthReservations.reduce((sum, res) => sum + res.total_price, 0)
  
  // Calculate revenue change percentage
  const revenueChange = lastMonthRevenue === 0 ? 100 : 
    ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

  // Get active reservations (checked_in) for today only
  const activeReservations = reservations.filter(res => {
    const checkIn = parseISO(res.check_in)
    const checkOut = parseISO(res.check_out)
    return res.status === 'checked_in' && 
           isWithinInterval(currentDate, { start: checkIn, end: checkOut })
  })
  
  // Calculate occupancy rate based on current check-ins
  const totalRooms = 10 // We have 10 rooms in our sample data
  const occupiedRooms = new Set(activeReservations.map(res => res.room_id)).size
  const occupancyRate = (occupiedRooms / totalRooms) * 100

  // Calculate total active guests (sum of number_of_guests for active reservations)
  const activeGuestsCount = activeReservations.reduce((sum, res) => sum + res.number_of_guests, 0)

  // Calculate average daily rate (ADR) for current month's non-cancelled reservations
  const adr = currentMonthReservations.length > 0 
    ? currentMonthRevenue / currentMonthReservations.length 
    : 0

  // Generate monthly data for the chart (excluding cancelled reservations)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthDate = subMonths(currentDate, 11 - i)
    const monthReservations = reservations.filter(res => {
      const checkIn = parseISO(res.check_in)
      return isSameMonth(checkIn, monthDate) && res.status !== 'cancelled'
    })
    const revenue = monthReservations.reduce((sum, res) => sum + res.total_price, 0)
    
    return {
      name: format(monthDate, 'MMM'),
      revenue: revenue
    }
  })

  // Calculate today's check-ins and check-outs
  const todayStart = startOfDay(currentDate)
  const todayEnd = endOfDay(currentDate)

  const todayCheckIns = reservations.filter(res => {
    const checkIn = parseISO(res.check_in)
    return isWithinInterval(checkIn, { start: todayStart, end: todayEnd }) &&
           res.status !== 'cancelled'
  }).length

  const todayCheckOuts = reservations.filter(res => {
    const checkOut = parseISO(res.check_out)
    return isWithinInterval(checkOut, { start: todayStart, end: todayEnd }) &&
           res.status !== 'cancelled'
  }).length

  // Calculate pending payments
  const pendingPayments = reservations.filter(res => 
    res.payment_status === 'pending' && res.status !== 'cancelled'
  ).length

  // Calculate upcoming reservations (confirmed, not cancelled, and in the future)
  const upcomingReservations = reservations.filter(res => {
    const checkIn = parseISO(res.check_in)
    return checkIn > currentDate && 
           res.status === 'confirmed'
  }).length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonthRevenue.toFixed(2)}</div>
            <p className={`text-xs ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {occupiedRooms} out of {totalRooms} rooms occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${adr.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per reservation this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGuestsCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently checked in
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckIns}</div>
            <p className="text-xs text-muted-foreground">Expected arrivals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckOuts}</div>
            <p className="text-xs text-muted-foreground">Expected departures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReservations}</div>
            <p className="text-xs text-muted-foreground">Future bookings</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <Bar
                dataKey="revenue"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Revenue
                            </span>
                            <span className="font-bold text-muted-foreground">
                              ${value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 