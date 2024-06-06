import {log} from "@repo/logger";
import {error} from "@repo/logger";
import {createServer} from "./server";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
const port = process.env.PORT;
const dbUri = process.env.DB_URI || "";
const server = createServer();

server.listen(port, () => {
    log(`api running on ${port}`);
});

try {
    mongoose.connect(dbUri).then(() => {
        log("Connected to database");
    })
} catch (e) {
    error(e);
}
