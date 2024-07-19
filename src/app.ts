import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import checkDbConnection from './middleware/checkConnectionDB';
import type { LoginUserReq, UpdateSuaraMPKReq } from './types/express';

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
  res.json({ message: "Hello World!" });
});

app.post('/LoginUser', async (req: Request, res: Response) => {
  const LoginInfo: LoginUserReq = req.body
  try {
    const CheckUser = await prisma.user.findUnique({
      where: {
        NIU: LoginInfo.NIU
      }
    })

    if (!CheckUser) {
      throw new Error("User Not Found")
    }

    const Auth = await prisma.user.findMany({
      where: {
        NIU: LoginInfo.NIU,
        Password: LoginInfo.password,
      }
    })
    if (!Auth) {
      throw new Error("Password Incorrect")
    }
    res.json(Auth)
  } catch (error) {
    res.status(500).json({ message: "error authenticating user" })
  }
})

app.post('/UpdateOSIS', async (req: Request, res: Response) => {
  const body: UpdateSuaraMPKReq = req.body
  try {
    const updateUser = await prisma.user.update({
      where: {
        NIU: body.NIU
      },
      data: {
        Pilihan_OSIS: body.No_Pilihan
      }
    })
    const updateOSIS = await prisma.paslon_OSIS.update({
      where: {
        No_Pilihan: body.No_Pilihan
      },
      data: {
        Jumlah_Suara: { increment: 1 }
      }
    })

    updateUser ? res.status(200).send({ message: "Success update pilihan OSIS User" }) : res.status(500).json({ message: "Error update pilihan OSIS user" })
    updateOSIS ? res.status(200).send({ message: "Success update jumlah suara OSIS" }) : res.status(400).json({ message: "Error update Jumlah_Suara OSIS" })

  } catch (error) {
    console.log(error)
    res.status(505).send("Internal server error")
  }
})

app.post('/UpdateMPK', async (req: Request, res: Response) => {
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
    const updateMPK = await prisma.calon_MPK.update({
      where: {
        No_Pilihan: body.No_Pilihan
      },
      data: {
        Jumlah_Suara: { increment: 1 }
      }
    })
    updateUser ? res.status(200).json({ message: "Success update pilihan MPK User" }) : res.status(500).json({ message: "Error update pilihan MPK user" })
    updateMPK ? res.status(200).json({ message: "Success update jumlah suara MPK" }) : res.status(400).json({ message: "Error update Jumlah_Suara MPK" })
  } catch (error) {
    res.status(505).send("Internal server error")
  }
})

export default app;
