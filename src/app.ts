import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import jwt from 'jsonwebtoken'
import morgan from 'morgan';
import checkDbConnection from './middleware/checkConnectionDB';
import type { DataLiveRes, LoginUserReq, UpdateSuaraReq } from './types/express';
import { IsVoted } from './middleware/isvoted';
import { jwtauth } from './middleware/auth';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(checkDbConnection);
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

app.get('/currentUser', async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401)
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      return res.status(403)
    }
    return res.status(200).json(user)
  })
})

app.post('/loginuser', async (req: Request, res: Response) => {
  const { NIU, password }: LoginUserReq = req.body;
  try {
    const CheckUser = await prisma.user.findUnique({
      where: { NIU: NIU }
    });

    if (!CheckUser) {
      throw new Error("User Not Found");
    }

    const Auth = await prisma.user.findFirst({
      where: { NIU: NIU, Password: password }
    });

    if (!Auth) {
      throw new Error("Password Incorrect");
    }

    const authtoken = jwt.sign(Auth, process.env.JWT_SECRET as string, { expiresIn: "1h" })

    res.cookie('token', authtoken, ({
      httpOnly: true,
      sameSite: 'strict'
    }))
    res.status(200).send({ message: "logged in successfully" })

  } catch (error) {
    console.log(error)
    res.status(500).json({ err: error });
  }
});

app.post('/vote', jwtauth, IsVoted, async (req: Request, res: Response) => {
  const { No_Pilihan, NIU }: UpdateSuaraReq = req.body;
  try {
    const updateUser = await prisma.user.update({
      where: { NIU: NIU },
      data: {
        pilihan: {
          connect: { Id: No_Pilihan }
        }
      }
    });

    if (updateUser) {
      return res.status(200).send({ message: "Vote Updated" });
    }
  } catch (error) {
    console.log(error);
    res.status(505).send("Internal server error");
  }
});

app.get('/datares', jwtauth, async (_: Request, res: Response) => {
  try {
    const [
      Pemilih_1_MPK,
      Pemilih_2_MPK,
      Pemilih_3_MPK,
      Pemilih_1_OSIS,
      Pemilih_2_OSIS,
      Pemilih_3_OSIS,
      Jumlah_User,
    ] = await Promise.all([
      prisma.user.count({ where: { pilihan: { some: { Id: 1, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 2, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 3, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 4, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 5, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 6, } } } }),
      prisma.user.count(),
    ]);

    const ResDataObj: DataLiveRes = {
      MPK: {
        Pemilih_1: Pemilih_1_MPK,
        Pemilih_2: Pemilih_2_MPK,
        Pemilih_3: Pemilih_3_MPK,
        Jumlah_Vote: Pemilih_1_MPK + Pemilih_2_MPK + Pemilih_3_MPK,
      },
      OSIS: {
        Pemilih_1: Pemilih_1_OSIS,
        Pemilih_2: Pemilih_2_OSIS,
        Pemilih_3: Pemilih_3_OSIS,
        Jumlah_Vote: Pemilih_1_OSIS + Pemilih_2_OSIS + Pemilih_3_OSIS,
      },
      Jumlah_User: Jumlah_User
    };

    res.status(200).json(ResDataObj);
  } catch (error) {
    res.status(500).send({ message: "Error Occured.", err: error })
  }
});


export default app;
