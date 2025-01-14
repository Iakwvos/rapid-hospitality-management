"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const guests_1 = __importDefault(require("./routes/guests"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const health_1 = __importDefault(require("./routes/health"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Routes
app.use('/api/rooms', rooms_1.default);
app.use('/api/guests', guests_1.default);
app.use('/api/reservations', reservations_1.default);
app.use('/health', health_1.default);
exports.default = app;
