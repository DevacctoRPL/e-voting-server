import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const jwtauth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.status(401)

  if (token === undefined) return res.status(401).send({message:"auth not found"})

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      return res.status(403).send({message: "auth not verified"})
    }
    req.body.user = user
    next()
  })
}
