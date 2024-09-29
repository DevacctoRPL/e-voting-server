"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 *
 * This middleware is used to check the db connection for every request
 * @param {Request} req - request mustopa
 */
const checkDbConnection = (req, res, next) => {
    try {
        prisma.$connect().then(() => console.log("DB connected."));
        next();
    }
    catch (error) {
        console.error('Database connection error:\n', error, "\n");
        res.status(503).json({ message: 'Service Unavailable: Cannot connect to database' });
    }
};
exports.default = checkDbConnection;
