import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { processAuthPayload } from "./controllers/authController";
import { processCollectionsQuery } from "./controllers/collectionController";
import { processOrderLookup, processOrderStatusChange, processOrdersQuery } from "./controllers/orderController";
import { processQrSessionPayload } from "./controllers/qrController";
import { processSettingsGet, processSettingsUpdate } from "./controllers/settingsController";
import { processMenuExtractionPayload } from "./controllers/menuExtractionController";
import {
  createMenuItemResponse,
  deleteMenuItemResponse,
  getMenuItemsResponse,
  publishMenuResponse,
  toggleAvailabilityResponse,
  updateMenuItemResponse,
} from "./controllers/menuCrudController";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
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

app.post("/menu/extract", upload.single("menuImage"), (req, res) => {
  const result = processMenuExtractionPayload(req.body, req.file ?? undefined);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.post("/qr/sessions", async (req, res) => {
  const result = await processQrSessionPayload(req.body);
  const status = result.success ? 201 : 400;
  res.status(status).json(result);
});

app.get("/orders", (req, res) => {
  const result = processOrdersQuery(req.query);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.get("/orders/:id", (req, res) => {
  const result = processOrderLookup(req.params.id);
  const status = result.success ? 200 : 404;
  res.status(status).json(result);
});

app.patch("/orders/:id/status", (req, res) => {
  const result = processOrderStatusChange(req.params.id, req.body);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.get("/collections", (req, res) => {
  const result = processCollectionsQuery(req.query);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.get("/settings", (_req, res) => {
  const result = processSettingsGet();
  res.status(200).json(result);
});

app.put("/settings", (req, res) => {
  const result = processSettingsUpdate(req.body);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.get("/menu/items", (_req, res) => {
  res.json(getMenuItemsResponse());
});

app.post("/menu/items", (req, res) => {
  const result = createMenuItemResponse(req.body);
  const status = result.success ? 201 : 400;
  res.status(status).json(result);
});

app.put("/menu/items/:id", (req, res) => {
  const result = updateMenuItemResponse(req.params.id, req.body);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

app.delete("/menu/items/:id", (req, res) => {
  const result = deleteMenuItemResponse(req.params.id);
  const status = result.success ? 200 : 404;
  res.status(status).json(result);
});

app.patch("/menu/items/:id/toggle", (req, res) => {
  const result = toggleAvailabilityResponse(req.params.id);
  const status = result.success ? 200 : 404;
  res.status(status).json(result);
});

app.post("/menu/publish", (_req, res) => {
  res.json(publishMenuResponse());
});

app.listen(port, () => {
  console.log(`[admin-backend] listening on http://localhost:${port}`);
});
