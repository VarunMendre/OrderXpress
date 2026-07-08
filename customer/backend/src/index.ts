import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { processTableSessionPayload } from "./controllers/sessionController";

dotenv.config();

const app = express();
const port = Number(process.env.CUSTOMER_BACKEND_PORT ?? 4002);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "customer-backend" });
});

app.post("/session", (req, res) => {
  const result = processTableSessionPayload(req.body);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.listen(port, () => {
  console.log(`[customer-backend] listening on http://localhost:${port}`);
});
