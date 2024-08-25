import { NextFunction, Request, Response } from "express";
import { UpdateSuaraReq } from "../types/express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const IsVoted = async (req: Request, res: Response, next: NextFunction) => {
  const { NIU }: UpdateSuaraReq = req.body;

  const user = await prisma.user.findUnique({
    where: {
      NIU: NIU
    }
  });

  if (req.path.includes("OSIS")) {
    if (user?.Pilihan_OSIS == null) {
      return next();
    } else {
      return res.status(403).send({ message: "you have already voted for OSIS." });
    }
  }

  if (req.path.includes("MPK")) {
    if (user?.Pilihan_MPK == null) {
      return next();
    } else {
      return res.status(403).send({ message: "you have already voted for MPK." });
    }
  }

  next();
};
