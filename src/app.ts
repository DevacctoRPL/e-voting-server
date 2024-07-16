import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import checkDbConnection from './middleware/checkConnectionDB';
import type { UpdateSuaraMPKReq } from './types/express';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(checkDbConnection);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.post('/UpdateMPK', async(req:Request , res: Response ) => {
  const body: UpdateSuaraMPKReq = req.body
  try {
    const updateUser = await prisma.user.update({
      where: {
        NIU: body.NIU
      },
      data: {
        Pilihan_MPK: body.No_Pilihan
      }
    })
    updateUser ? res.status(200) : res.status(404).send("Error update User")
    const updateMPK = await prisma.calon_MPK.update({
      where: {
        No_Pilihan: body.No_Pilihan
      },
      data: {
        Jumlah_Suara: {increment: 1}
      }
    })
    updateUser ? res.status(200) : res.status(404).send("Error update User")
    updateMPK ? res.status(200) : res.status(404).send("Error update mpk")
  } catch (error) {
    res.status(505).send("Internal server error")
  }
  res.send("Updated.")
})
    
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

export default app;
