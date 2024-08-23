import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import checkDbConnection from './middleware/checkConnectionDB';
import type { LoginUserReq, UpdateSuaraMPKReq } from './types/express';

const app = express();
const prisma = new PrismaClient();

// Swagger configuration
const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '3.0.0',
      description: 'A simple CRUD API application made with Express and documented with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/app.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(checkDbConnection);

// Swagger Schemas
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUserReq:
 *       type: object
 *       required:
 *         - NIU
 *         - password
 *       properties:
 *         NIU:
 *           type: string
 *           description: User's NIU (Number Identification Unique)
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         NIU: '123456789'
 *         password: 'password123'
 *     UpdateSuaraMPKReq:
 *       type: object
 *       required:
 *         - NIU
 *         - No_Pilihan
 *       properties:
 *         NIU:
 *           type: string
 *           description: User's NIU (Number Identification Unique)
 *         No_Pilihan:
 *           type: number
 *           description: The user's choice number for the election
 *       example:
 *         NIU: '123456789'
 *         No_Pilihan: 2
 */

// Routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     responses:
 *       200:
 *         description: Returns a hello world message.
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

/**
 * @swagger
 * /loginuser:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserReq'
 *     responses:
 *       200:
 *         description: User authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LoginUserReq'
 *       500:
 *         description: Error authenticating user.
 */
app.post('/loginuser', async (req: Request, res: Response) => {
  const LoginInfo: LoginUserReq = req.body;
  try {
    const CheckUser = await prisma.user.findUnique({
      where: { NIU: LoginInfo.NIU }
    });
    if (!CheckUser) {
      throw new Error("User Not Found");
    }

    const Auth = await prisma.user.findMany({
      where: { NIU: LoginInfo.NIU, Password: LoginInfo.password }
    });
    if (!Auth) {
      throw new Error("Password Incorrect");
    }

    res.json(Auth);
  } catch (error) {
    res.status(500).json({ message: "error authenticating user", err: error });
  }
});

/**
 * @swagger
 * /UpdateOSIS:
 *   post:
 *     summary: Update OSIS selection for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSuaraMPKReq'
 *     responses:
 *       200:
 *         description: OSIS Updated successfully.
 *       505:
 *         description: Internal server error.
 */
app.post('/UpdateOSIS', async (req: Request, res: Response) => {
  const body: UpdateSuaraMPKReq = req.body;
  try {
    const updateUser = await prisma.user.update({
      where: { NIU: body.NIU },
      data: { Pilihan_OSIS: body.No_Pilihan }
    });

    if (updateUser) {
      res.status(200).send({ message: "Osis Updated" });
    }
  } catch (error) {
    console.log(error);
    res.status(505).send("Internal server error");
  }
});

/**
 * @swagger
 * /UpdateMPK:
 *   post:
 *     summary: Update MPK selection for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSuaraMPKReq'
 *     responses:
 *       200:
 *         description: MPK Updated successfully.
 *       505:
 *         description: Internal server error.
 */
app.post('/UpdateMPK', async (req: Request, res: Response) => {
  const body: UpdateSuaraMPKReq = req.body;
  try {
    const updateUser = await prisma.user.update({
      where: { NIU: body.NIU },
      data: { Pilihan_MPK: body.No_Pilihan }
    });

    if (updateUser) {
      res.status(200).send({ message: "MPK Updated" });
    }
  } catch (error) {
    res.status(505).send("Internal server error");
  }
});

export default app;
