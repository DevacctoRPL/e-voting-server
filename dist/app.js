"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const helmet_1 = __importDefault(require("helmet"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const morgan_1 = __importDefault(require("morgan"));
const checkConnectionDB_1 = __importDefault(require("./middleware/checkConnectionDB"));
const isvoted_1 = require("./middleware/isvoted");
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)({
    credentials: true,
}));
app.use(checkConnectionDB_1.default);
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
// Routes
app.get('/', (req, res) => {
    res.json({ message: "Hello World!" });
});
app.post('/loginuser', async (req, res) => {
    const { NIU, password } = req.body;
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
        const authtoken = jsonwebtoken_1.default.sign(Auth, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.cookie('token', authtoken, ({
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }));
        res.status(200).json({ message: "logged in successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ err: error });
    }
});
app.post('/vote', auth_1.jwtauth, isvoted_1.IsVoted, async (req, res) => {
    const { No_Pilihan, NIU } = req.body;
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
    }
    catch (error) {
        console.log(error);
        res.status(505).send("Internal server error");
    }
});
app.get('/datares', auth_1.jwtauth, async (_, res) => {
    try {
        const [Pemilih_1_MPK, Pemilih_2_MPK, Pemilih_3_MPK, Pemilih_1_OSIS, Pemilih_2_OSIS, Pemilih_3_OSIS, Jumlah_User,] = await Promise.all([
            prisma.user.count({ where: { pilihan: { some: { Id: 1, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 2, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 3, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 4, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 5, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 6, } } } }),
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
