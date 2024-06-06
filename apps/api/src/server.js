import {json, urlencoded} from "body-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import roomRouter from "./routes/roomRouter.js";
import messageRouter from "./routes/messageRouter.js";
import gameRouter from "./routes/gameRouter";

dotenv.config({});
export const createServer = () => {
    const app = express();
    app
        .disable("x-powered-by")
        .use(urlencoded({extended: true}))
        .use(json())
        .use(cors())
        .use("/auth", auth)
        .use("/room", roomRouter)
        .use("/messages", messageRouter)
        .use("/games", gameRouter)


    return app;
};
