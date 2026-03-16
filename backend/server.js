import express from "express";
import cors from "cors";
import http from "http";
import routes from "./routes.js";
import { setupWebSocket } from "./ws.js";
import "./init.js";   // ⭐ ADD THIS

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("NebulaShift backend running");
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
