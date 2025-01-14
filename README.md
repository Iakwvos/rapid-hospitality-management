# Rapid Hospitality Management Dashboard

A modern, real-time hospitality management system built with .NET 7 and React. This application provides a comprehensive solution for managing hotel reservations, guest information, and room management.

## Features

- 📅 Real-time reservation management
- 👥 Guest management with detailed profiles
- 🏨 Room management with comprehensive details
- 💳 Payment status tracking
- 📊 Interactive calendar views (week/month)
- 🔄 Real-time updates using Supabase
- 🎨 Modern UI with Tailwind CSS and Shadcn UI

## Tech Stack

### Backend
- .NET 7 Web API
- Supabase for database and real-time features
- RESTful API architecture
- Entity Framework Core

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn UI for components
- React Hook Form for form handling
- Zod for validation
- Date-fns for date manipulation

## Prerequisites

- .NET 7 SDK
- Node.js (v16 or later)
- npm or yarn
- Supabase account and project

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Iakwvos/rapid-hospitality-management.git
   cd rapid-hospitality-management
   ```

2. Backend Setup:
   ```bash
   cd RapidHospitalityManagement.Api
   dotnet restore
   dotnet build
   ```

   Create `appsettings.Development.json` and add your Supabase configuration:
   ```json
   {
     "Supabase": {
       "Url": "your_supabase_url",
       "Key": "your_supabase_key"
     }
   }
   ```

3. Frontend Setup:
   ```bash
   cd frontend
   npm install
   ```

   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5035
   ```

4. Run the application:

   Backend:
   ```bash
   cd RapidHospitalityManagement.Api
   dotnet run
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Project Structure

```
rapid-hospitality-management/
├── RapidHospitalityManagement.Api/    # .NET Backend
│   ├── Controllers/                   # API Controllers
│   ├── Models/                        # Data Models
│   ├── Services/                      # Business Logic
│   └── Properties/                    # Configuration
├── frontend/                          # React Frontend
│   ├── src/
│   │   ├── components/               # Reusable Components
│   │   ├── pages/                    # Page Components
│   │   ├── lib/                      # Utilities
│   │   └── styles/                   # Global Styles
│   └── public/                       # Static Assets
└── README.md
```

## API Endpoints

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/{id}` - Get reservation by ID
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Delete reservation

### Guests
- `GET /api/guests` - Get all guests
- `GET /api/guests/{id}` - Get guest by ID
- `POST /api/guests` - Create new guest
- `PUT /api/guests/{id}` - Update guest
- `DELETE /api/guests/{id}` - Delete guest

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{id}` - Get room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.io/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system 