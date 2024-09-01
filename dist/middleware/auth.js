"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtauth = void 0;
const jwtauth = (req, res, next) => {
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
    console.log(req.cookies);
};
exports.jwtauth = jwtauth;
