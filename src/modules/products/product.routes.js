import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./product.controller.js";

const router = Router();

router.post("/", authenticate, create);

router.get("/", getAll);

router.get("/:id", getOne);

router.patch("/:id", authenticate, update);

router.delete("/:id", authenticate, remove);

export default router;