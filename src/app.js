import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";

import { authenticate } from "./middleware/auth.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/auth", authRoutes);

app.get("/auth/me", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    userId: req.user.userId,
  });
});

app.use("/products", productRoutes);

app.use("/orders", orderRoutes);

app.use(errorHandler);

export default app;