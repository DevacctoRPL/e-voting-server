"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsVoted = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const IsVoted = async (req, res, next) => {
    const { NIU } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            NIU: NIU
        }
    });
    if (req.path.includes("OSIS")) {
        if (user?.Pilihan_OSIS == null) {
            return next();
        }
        else {
            return res.status(403).send({ message: "you have already voted for OSIS." });
        }
    }
    if (req.path.includes("MPK")) {
        if (user?.Pilihan_MPK == null) {
            return next();
        }
        else {
            return res.status(403).send({ message: "you have already voted for MPK." });
        }
    }
    // If the path does not match either condition, just call next().
    next();
};
exports.IsVoted = IsVoted;
