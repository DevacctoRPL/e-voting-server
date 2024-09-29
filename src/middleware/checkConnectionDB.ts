import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

/**
 * This middleware is used to check the db connection for every request
 */
const checkDbConnection = (req: Request, res: Response, next: NextFunction) => {
  try {
    prisma.$connect().then(() => console.log("DB connected."));
    next();
  } catch (error) {
    console.error('Database connection error:\n', error, "\n");
    res.status(503).json({ message: 'Service Unavailable: Cannot connect to database' });
  }
};

export default checkDbConnection;
