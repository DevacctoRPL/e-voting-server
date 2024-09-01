import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const jwtauth = (req: Request, res: Response, next: NextFunction) => {
  // const token = req.cookies.token;
  // if (!token) return res.status(401)
  //
  // if (token === undefined) return res.status(401)
  //
  // jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
  //   if (err) {
  //     return res.status(403)
  //   }
  //   req.body.user = user
  //   next()
  // })
  console.log(req.cookies)
}
