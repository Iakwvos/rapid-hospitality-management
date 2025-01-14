export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Rapid Hospitality Management Dashboard API',
    version: '0.0.1',
    description: 'API documentation for the Rapid Hospitality Management Dashboard',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'API health check endpoints',
    },
    {
      name: 'Rooms',
      description: 'Room management endpoints',
    },
    {
      name: 'Reservations',
      description: 'Reservation management endpoints',
    },
    {
      name: 'Guests',
      description: 'Guest profile management endpoints',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/rooms': {
      get: {
        tags: ['Rooms'],
        summary: 'Get all rooms',
        responses: {
          '200': {
            description: 'List of all rooms',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Room',
                  },
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/rooms/{id}': {
      get: {
        tags: ['Rooms'],
        summary: 'Get room by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Room ID',
          },
        ],
        responses: {
          '200': {
            description: 'Room details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Room',
                },
              },
            },
          },
          '404': {
            description: 'Room not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/rooms/{id}/availability': {
      get: {
        tags: ['Rooms'],
        summary: 'Check room availability',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Room ID',
          },
          {
            name: 'start_date',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'date',
            },
            description: 'Start date',
          },
          {
            name: 'end_date',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'date',
            },
            description: 'End date',
          },
        ],
        responses: {
          '200': {
            description: 'Room availability status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    available: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Room: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          number: {
            type: 'string',
          },
          type: {
            type: 'string',
            enum: ['single', 'double', 'suite', 'deluxe'],
          },
          capacity: {
            type: 'integer',
          },
          price_per_night: {
            type: 'number',
          },
          amenities: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          status: {
            type: 'string',
            enum: ['available', 'occupied', 'maintenance'],
          },
          floor: {
            type: 'integer',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
        },
      },
    },
  },
}; 