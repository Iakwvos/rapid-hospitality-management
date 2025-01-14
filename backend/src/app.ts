import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import roomsRouter from './routes/rooms'
import guestsRouter from './routes/guests'
import reservationsRouter from './routes/reservations'
import healthRouter from './routes/health'

const app = express()

app.use(cors())
app.use(express.json())

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rapid Hospitality Management Dashboard API',
      version: '1.0.0',
      description: 'API documentation for the Rapid Hospitality Management Dashboard',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use('/api/rooms', roomsRouter)
app.use('/api/guests', guestsRouter)
app.use('/api/reservations', reservationsRouter)
app.use('/health', healthRouter)

export default app 