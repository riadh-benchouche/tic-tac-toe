import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            // @ts-ignore
            req.body.user = jwt.verify(token, process.env.SECRET_KEY);
            next();
        } catch (error) {
            res.status(401).send("Token invalide");
        }
    } else {
        res.status(401).send("Authentification requise");
    }
};
