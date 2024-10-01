import { NextFunction, Request, Response } from "express";
import { UpdateSuaraReq } from "../types/express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const HasAllVoted = async (req:Request,res:Response,next:NextFunction) => {
  const { NIU }: UpdateSuaraReq = req.body;

  const user = await prisma.user.findUnique({
    where: {
      NIU: NIU,
    }
  });


  const paslon = await prisma.paslon.findMany({
    where: {
      Suara: {
         some: {
          id: user?.id
        }
      }
    }
  });
  
  if(paslon.length == 2) {
    return res.status(403).send({message: "you have voted all"}) 
  }
  next()
}

export const IsVoted = async (req: Request, res: Response, next: NextFunction) => {
  const { NIU, No_Pilihan }: UpdateSuaraReq = req.body;
  const organ: "MPK" | "OSIS" = No_Pilihan % 2 == 0 ? "MPK" : "OSIS"

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
    return res.status(403).json({ message: "you have voted. dont vote again" })
  }

  next();
};
