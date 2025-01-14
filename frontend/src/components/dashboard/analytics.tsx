import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reservation } from "@/types"
import { format, parseISO, startOfMonth, endOfMonth, subMonths, differenceInDays } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsProps {
  reservations: Reservation[]
}

export function Analytics({ reservations }: AnalyticsProps) {
  const currentDate = new Date()
  
  // Calculate room type distribution
  const roomTypeDistribution = reservations
    .filter(res => res.status !== 'cancelled' && res.room)
    .reduce((acc, res) => {
      const type = res.room?.type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const roomTypeData = Object.entries(roomTypeDistribution).map(([name, value]) => ({
    name,
    value
  }))

  // Calculate average length of stay
  const averageStayLength = reservations
    .filter(res => res.status !== 'cancelled')
    .reduce((acc, res) => {
      const checkIn = parseISO(res.check_in)
      const checkOut = parseISO(res.check_out)
      return acc + differenceInDays(checkOut, checkIn)
    }, 0) / reservations.length

  // Calculate booking trends over last 6 months
  const bookingTrends = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(currentDate, 5 - i)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    
    const monthBookings = reservations.filter(res => {
      const bookingDate = parseISO(res.created_at || '')
      return bookingDate >= monthStart && bookingDate <= monthEnd
    })

    return {
      name: format(monthDate, 'MMM'),
      bookings: monthBookings.length
    }
  })

  // Calculate payment method distribution
  const paymentMethodDistribution = reservations
    .filter(res => res.status !== 'cancelled')
    .reduce((acc, res) => {
      const method = res.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const paymentMethodData = Object.entries(paymentMethodDistribution).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Room Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {roomTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Length of Stay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageStayLength.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">Average duration per booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 