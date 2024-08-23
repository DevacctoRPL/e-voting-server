"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerOptions = {
    openapi: '3.0.0',
    info: {
        title: 'My API',
        version: '1.0.0',
        description: 'API documentation for my Express application',
    },
    servers: [
        {
            url: 'http://localhost:5000', // Replace with your server URL
            description: 'Local server',
        },
    ],
    apis: ['app.ts'], // Path to your API files
};
exports.default = swaggerOptions;
