"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const checkDbConnection = (req, res, next) => {
    console.log("Checking DB...");
    try {
        prisma.$connect().then(() => console.log("db connected"));
        next();
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(503).json({ message: 'Service Unavailable: Cannot connect to database' });
    }
};
exports.default = checkDbConnection;
