import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

const checkDbConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.$connect();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({ message: 'Service Unavailable: Cannot connect to database' });
  }
};

export default checkDbConnection;
