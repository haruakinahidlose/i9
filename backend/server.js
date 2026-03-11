import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import routes from "./routes.js";
import setupWS from "./ws.js";
import "./init.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", routes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

setupWS(wss);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("NebulaShift backend running on " + PORT));
