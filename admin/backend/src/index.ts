import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { processAuthPayload } from "./controllers/authController";

dotenv.config();

const app = express();
const port = Number(process.env.ADMIN_BACKEND_PORT ?? 4001);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "admin-backend" });
});

app.post("/auth", (req, res) => {
  const result = processAuthPayload(req.body);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.listen(port, () => {
  console.log(`[admin-backend] listening on http://localhost:${port}`);
});
