import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import dotenv from 'dotenv';

import roomsRouter from './routes/rooms';
import guestsRouter from './routes/guests';
import reservationsRouter from './routes/reservations';
import healthRouter from './routes/health';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rapid Hospitality Management Dashboard API',
      version: '0.0.2',
      description: 'API documentation for the Rapid Hospitality Management Dashboard',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Guest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            preferences: {
              type: 'object',
              properties: {
                room_type: { type: 'array', items: { type: 'string' } },
                special_requests: { type: 'array', items: { type: 'string' } },
                dietary_restrictions: { type: 'array', items: { type: 'string' } }
              }
            },
            vip_status: { type: 'boolean' },
            loyalty_points: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Room: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            number: { type: 'string' },
            type: { type: 'string', enum: ['single', 'double', 'suite', 'deluxe'] },
            capacity: { type: 'number' },
            price_per_night: { type: 'number' },
            amenities: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['available', 'occupied', 'maintenance'] },
            floor: { type: 'number' },
            image_url: { type: 'string' },
            thumbnail_url: { type: 'string' },
            description: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            room_id: { type: 'string', format: 'uuid' },
            guest_id: { type: 'string', format: 'uuid' },
            check_in: { type: 'string', format: 'date-time' },
            check_out: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] },
            total_price: { type: 'number' },
            special_requests: { type: 'string' },
            number_of_guests: { type: 'number' },
            payment_status: { type: 'string', enum: ['pending', 'paid', 'refunded'] },
            payment_method: { type: 'string', enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            room: { $ref: '#/components/schemas/Room' },
            guest: { $ref: '#/components/schemas/Guest' }
          }
        }
      }
    }
  },
  apis: [path.resolve(__dirname, './routes/*.ts')]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/rooms', roomsRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/health', healthRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

export default app; 