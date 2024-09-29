"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
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
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(checkConnectionDB_1.default);
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
// Routes
app.get('/', (res) => {
    res.json({ message: "Hello World!" });
});
app.get('/logout', (_, res) => {
    res.clearCookie('token');
    res.status(200).send({ message: "Logged out Successfully" });
});
app.get('/currentUser', auth_1.jwtauth, async (req, res) => {
    res.status(200).json(req.body.user);
});
app.post('/loginuser', async (req, res) => {
    const { NIU, password } = req.body;
    try {
        const CheckUser = await prisma.user.findUnique({
            where: { NIU: NIU }
        });
        if (!CheckUser) {
            return res.status(404).send({ message: 'user not found' });
        }
        const Auth = await prisma.user.findFirst({
            where: { NIU: NIU, Password: password }
        });
        if (!Auth) {
            return res.status(401).send({ message: 'password inccorect' });
        }
        const authtoken = jsonwebtoken_1.default.sign(Auth, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie('token', authtoken, ({
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        }));
        res.status(200).send(Auth);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ err: error });
    }
});
app.post('/vote', auth_1.jwtauth, isvoted_1.IsVoted, async (req, res) => {
    const { No_Pilihan, NIU } = req.body;
    try {
        await prisma.user.update({
            where: { NIU: NIU },
            data: {
                pilihan: {
                    connect: { Id: No_Pilihan }
                }
            }
        });
        return res.status(200).send({ message: "Vote Updated" });
    }
    catch (error) {
        console.log(error);
        return res.status(505).send("Internal server error");
    }
});
app.get('/datares', auth_1.jwtauth, async (_, res) => {
    try {
        const [Pemilih_1_OSIS, Pemilih_2_OSIS, Pemilih_1_MPK, Pemilih_2_MPK, Jumlah_User,] = await Promise.all([
            prisma.user.count({ where: { pilihan: { some: { Id: 1, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 3, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 2, } } } }),
            prisma.user.count({ where: { pilihan: { some: { Id: 4, } } } }),
            prisma.user.count(),
        ]);
        const ResDataObj = {
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
    }
    catch (error) {
        res.status(500).send({ message: "Error Occured.", err: error });
    }
});
app.get('/seed', async (req, res) => {
    let users = [];
    for (let i = 0; i < 10; i++) {
        users.push({
            NIU: `NIU${i + 1}`,
            Nama: `Voter${i + 1}`,
            Password: 12 + i
        });
    }
    const rez = await prisma.user.createMany({
        data: users
    });
    if (rez.count <= 0) {
        return res.status(500).send({ message: "error bejir" });
    }
    return res.send(rez);
});
exports.default = app;
