import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import {
  create,
  getAll,
  getOne,
} from "./order.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", create);

router.get("/", getAll);

router.get("/:id", getOne);

export default router;