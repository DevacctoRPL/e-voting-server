import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const jwtauth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send({ message: "auth not found" })

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      return res.status(403).send({ message: "auth not verified" })
    }

    const nUser = { ...user, Password: parseInt(user.Password) }

    console.log(nUser, typeof nUser.Password)

    req.body.user = user
    next()
  })
}
