"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsVoted = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const IsVoted = async (req, res, next) => {
    const { NIU, No_Pilihan } = req.body;
    const organ = No_Pilihan % 2 == 0 ? "MPK" : "OSIS";
    const user = await prisma.user.findUnique({
        where: {
            NIU: NIU,
        }
    });
    const paslon = await prisma.paslon.findMany({
        where: {
            Organisasi: organ,
            Suara: {
                some: {
                    id: user?.id
                }
            }
        }
    });
    if (paslon.length > 0) {
        return res.status(403).json({ message: "you have voted. dont vote again" });
    }
    next();
};
exports.IsVoted = IsVoted;
