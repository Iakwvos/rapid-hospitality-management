"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const guests_1 = __importDefault(require("./routes/guests"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const health_1 = __importDefault(require("./routes/health"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
    apis: [path_1.default.resolve(__dirname, './routes/*.ts')]
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Routes
app.use('/api/rooms', rooms_1.default);
app.use('/api/guests', guests_1.default);
app.use('/api/reservations', reservations_1.default);
app.use('/health', health_1.default);
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});
exports.default = app;
