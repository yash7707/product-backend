import { createOrderSchema } from "./order.validation.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
} from "./order.service.js";

export async function create(req, res, next) {
  try {
    const validatedData = createOrderSchema.parse(req.body);

    const order = await createOrder(
      req.user.userId,
      validatedData.items
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const orders = await getUserOrders(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      const error = new Error("Invalid order ID");
      error.statusCode = 400;
      throw error;
    }

    const order = await getOrderById(
      orderId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}