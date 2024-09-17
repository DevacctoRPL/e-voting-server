import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

/**
 *
 * This middleware is used to check the db connection for every request
 * @param {Request} req - request mustopa 
 */
const checkDbConnection = (req: Request, res: Response, next: NextFunction) => {
  try {
    const boday = req.body ? JSON.stringify(req.body) : "nothing"
    prisma.$connect().then(() => console.log(`DB connected. \nGoing to ${req.path} \n with ${boday}`));
    next();
  } catch (error) {
    console.error('Database connection error:\n', error, "\n");
    res.status(503).json({ message: 'Service Unavailable: Cannot connect to database' });
  }
};

export default checkDbConnection;
