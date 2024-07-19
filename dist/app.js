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
const dotenv_1 = __importDefault(require("dotenv"));
const checkConnectionDB_1 = __importDefault(require("./middleware/checkConnectionDB"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(checkConnectionDB_1.default);
// Routes
app.get('/', (req, res) => {
    res.json({ message: "Hello World!" });
});
app.post('/LoginUser', async (req, res) => {
    const LoginInfo = req.body;
    try {
        const CheckUser = await prisma.user.findUnique({
            where: {
                NIU: LoginInfo.NIU
            }
        });
        if (!CheckUser) {
            throw new Error("User Not Found");
        }
        const Auth = await prisma.user.findMany({
            where: {
                NIU: LoginInfo.NIU,
                Password: LoginInfo.password,
            }
        });
        if (!Auth) {
            throw new Error("Password Incorrect");
        }
        res.json(Auth);
    }
    catch (error) {
        res.status(500).json({ message: "error authenticating user" });
    }
});
app.post('/UpdateOSIS', async (req, res) => {
    const body = req.body;
    try {
        const updateUser = await prisma.user.update({
            where: {
                NIU: body.NIU
            },
            data: {
                Pilihan_OSIS: body.No_Pilihan
            }
        });
        const updateOSIS = await prisma.paslon_OSIS.update({
            where: {
                No_Pilihan: body.No_Pilihan
            },
            data: {
                Jumlah_Suara: { increment: 1 }
            }
        });
        updateUser ? res.status(200).send({ message: "Success update pilihan OSIS User" }) : res.status(500).json({ message: "Error update pilihan OSIS user" });
        updateOSIS ? res.status(200).send({ message: "Success update jumlah suara OSIS" }) : res.status(400).json({ message: "Error update Jumlah_Suara OSIS" });
    }
    catch (error) {
        console.log(error);
        res.status(505).send("Internal server error");
    }
});
app.post('/UpdateMPK', async (req, res) => {
    const body = req.body;
    try {
        const updateUser = await prisma.user.update({
            where: {
                NIU: body.NIU
            },
            data: {
                Pilihan_MPK: body.No_Pilihan
            }
        });
        const updateMPK = await prisma.calon_MPK.update({
            where: {
                No_Pilihan: body.No_Pilihan
            },
            data: {
                Jumlah_Suara: { increment: 1 }
            }
        });
        updateUser ? res.status(200).json({ message: "Success update pilihan MPK User" }) : res.status(500).json({ message: "Error update pilihan MPK user" });
        updateMPK ? res.status(200).json({ message: "Success update jumlah suara MPK" }) : res.status(400).json({ message: "Error update Jumlah_Suara MPK" });
    }
    catch (error) {
        res.status(505).send("Internal server error");
    }
});
exports.default = app;
