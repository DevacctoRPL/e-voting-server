import express, { Request, Response } from 'express';
import cookieparser from 'cookie-parser'
import cors from 'cors';
import { PrismaClient} from '@prisma/client';
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
app.use(cookieparser())
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

app.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).send({ message: "Logged out Successfully" })
});

app.get('/currentUser', jwtauth, async (req: Request, res: Response) => {
  res.status(200).json(req.body.user)
})

app.post('/loginuser', async (req: Request, res: Response) => {
  const { NIU, password }: LoginUserReq = req.body;
  try {
    const CheckUser = await prisma.user.findUnique({
      where: { NIU: NIU }
    });

    if (!CheckUser) {
      return res.status(404).send({ message: 'user not found' })
    }

    const Auth = await prisma.user.findFirst({
      where: { NIU: NIU, Password: password }
    });

    if (!Auth) {
      return res.status(401).send({ message: 'password inccorect' })
    }

    const authtoken = jwt.sign(Auth, process.env.JWT_SECRET as string, { expiresIn: "1h" })

    res.cookie('token', authtoken, ({
      httpOnly: true,
      sameSite: 'strict',
    }))

    res.status(200).send(Auth)

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
    return res.status(505).send("Internal server error");
  }
});

app.get('/datares', jwtauth, async (_: Request, res: Response) => {
  try {
    const [
      Pemilih_1_MPK,
      Pemilih_2_MPK,
      Pemilih_1_OSIS,
      Pemilih_2_OSIS,
      Jumlah_User,
    ] = await Promise.all([
      prisma.user.count({ where: { pilihan: { some: { Id: 1, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 3, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 2, } } } }),
      prisma.user.count({ where: { pilihan: { some: { Id: 4, } } } }),
      prisma.user.count(),
    ]);


    const ResDataObj: DataLiveRes = {
      MPK: {
        Pemilih_1: Pemilih_1_MPK,
        Pemilih_2: Pemilih_2_MPK,
        Jumlah_Vote: Pemilih_1_MPK + Pemilih_2_MPK
      },
      OSIS: {
        Pemilih_1: Pemilih_1_OSIS,
        Pemilih_2: Pemilih_2_OSIS,
        Jumlah_Vote: Pemilih_1_OSIS + Pemilih_2_OSIS
      },
      Jumlah_User: Jumlah_User
    };

    res.status(200).json(ResDataObj);
  } catch (error) {
    res.status(500).send({ message: "Error Occured.", err: error })
  }
});

app.get('/seed', async (req:Request,res:Response)=>{
  let users: {NIU:string,Nama:string,Password:number}[] = []
  for (let i = 0; i < 10; i++) {
    users.push({
      NIU:`NIU${i+1}`,
      Nama:`Voter${i+1}`,
      Password:12 + i
    })
  }

  const rez = await prisma.user.createMany({
    data: users
  })
  
  if(rez.count <= 0) {
    return res.status(500).send({message:"error bejir"})
  }
  return res.send(rez)
})

export default app;
