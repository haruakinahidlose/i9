import express from "express";
import cors from "cors";
import router from "./backend/routes.js";
import { createServer } from "http";
import { setupWebSocket } from "./backend/ws.js";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: "NebulaShift backend OK" });
});

app.use("/api", router);

setupWebSocket(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log("NebulaShift backend running on port", PORT);
});
