import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

const checkDbConnection = (req: Request, res: Response, next: NextFunction) => {
  console.log("Checking DB...")
  try {
    prisma.$connect().then(() => console.log("db connected"));
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({ message: 'Service Unavailable: Cannot connect to database' });
  }
};

export default checkDbConnection;
