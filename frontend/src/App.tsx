import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/Dashboard'
import { RoomsPage } from './pages/rooms'
import { GuestsPage } from './pages/guests'
import { ReservationsPage } from './pages/reservations'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
