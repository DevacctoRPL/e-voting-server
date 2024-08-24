"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const checkConnectionDB_1 = __importDefault(require("./middleware/checkConnectionDB"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Swagger configuration
const swaggerOptions = {
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
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(checkConnectionDB_1.default);
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
 *
 *     DataLiveRes:
 *       type: object
 *       properties:
 *         OSIS:
 *           type: object
 *           properties:
 *             Pemilih_1:
 *               type: number
 *               description: Number of votes for the first OSIS candidate
 *             Pemilih_2:
 *               type: number
 *               description: Number of votes for the second OSIS candidate
 *             Pemilih_3:
 *               type: number
 *               description: Number of votes for the third OSIS candidate
 *             Jumlah_Vote:
 *               type: number
 *               description: Total number of votes for OSIS
 *         MPK:
 *           type: object
 *           properties:
 *             Pemilih_1:
 *               type: number
 *               description: Number of votes for the first MPK candidate
 *             Pemilih_2:
 *               type: number
 *               description: Number of votes for the second MPK candidate
 *             Pemilih_3:
 *               type: number
 *               description: Number of votes for the third MPK candidate
 *             Jumlah_Vote:
 *               type: number
 *               description: Total number of votes for MPK
 *         Jumlah_User:
 *           type: number
 *           description: Total number of users
 *       example:
 *         OSIS:
 *           Pemilih_1: 150
 *           Pemilih_2: 200
 *           Pemilih_3: 100
 *           Jumlah_Vote: 450
 *         MPK:
 *           Pemilih_1: 120
 *           Pemilih_2: 180
 *           Pemilih_3: 90
 *           Jumlah_Vote: 390
 *         Jumlah_User: 500
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
app.get('/', (req, res) => {
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
app.post('/loginuser', async (req, res) => {
    const LoginInfo = req.body;
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
    }
    catch (error) {
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
app.post('/UpdateOSIS', async (req, res) => {
    const body = req.body;
    try {
        const updateUser = await prisma.user.update({
            where: { NIU: body.NIU },
            data: { Pilihan_OSIS: body.No_Pilihan }
        });
        if (updateUser) {
            res.status(200).send({ message: "Osis Updated" });
        }
    }
    catch (error) {
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
app.post('/UpdateMPK', async (req, res) => {
    const body = req.body;
    try {
        const updateUser = await prisma.user.update({
            where: { NIU: body.NIU },
            data: { Pilihan_MPK: body.No_Pilihan }
        });
        if (updateUser) {
            res.status(200).send({ message: "MPK Updated" });
        }
    }
    catch (error) {
        res.status(505).send("Internal server error");
    }
});
/**
 * @swagger
 * /datares:
 *   get:
 *     summary: Get live voting results for OSIS and MPK
 *     description: Retrieves the current voting counts for each OSIS and MPK candidate along with the total number of users.
 *     responses:
 *       200:
 *         description: Successful retrieval of voting data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataLiveRes'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: string
 */
app.get('/datares', async (_, res) => {
    try {
        const [Pemilih_1_MPK, Pemilih_2_MPK, Pemilih_3_MPK, Pemilih_1_OSIS, Pemilih_2_OSIS, Pemilih_3_OSIS, Jumlah_User,] = await Promise.all([
            prisma.user.count({ where: { Pilihan_MPK: 1 } }),
            prisma.user.count({ where: { Pilihan_MPK: 2 } }),
            prisma.user.count({ where: { Pilihan_MPK: 3 } }),
            prisma.user.count({ where: { Pilihan_OSIS: 1 } }),
            prisma.user.count({ where: { Pilihan_OSIS: 2 } }),
            prisma.user.count({ where: { Pilihan_OSIS: 3 } }),
            prisma.user.count(),
        ]);
        const ResDataObj = {
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
    }
    catch (error) {
        res.status(500).send({ message: "Error Occured.", err: error });
    }
});
exports.default = app;
