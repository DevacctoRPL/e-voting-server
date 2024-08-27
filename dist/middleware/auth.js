"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtauth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtauth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401);
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403);
        }
        req.body.user = user;
        next();
    });
};
exports.jwtauth = jwtauth;
