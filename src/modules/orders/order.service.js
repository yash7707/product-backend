import { Prisma } from "../../generated/prisma/client.ts";
import prisma from "../../config/database.js";

export async function createOrder(userId, items) {
  const sortedItems = [...items].sort(
    (a, b) => a.productId - b.productId
  );

  const order = await prisma.$transaction(async (tx) => {
    /*
     * 1. Get all requested products
     */
    const productIds = sortedItems.map(
      (item) => item.productId
    );

    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    /*
     * 2. Create a quick lookup map
     */
    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    /*
     * 3. Make sure every product exists
     */
    for (const item of sortedItems) {
      if (!productMap.has(item.productId)) {
        const error = new Error(
          `Product ${item.productId} not found`
        );

        error.statusCode = 404;

        throw error;
      }
    }

    /*
     * 4. Calculate total using database prices
     */
    let totalAmount = new Prisma.Decimal(0);

    const orderItems = sortedItems.map((item) => {
      const product = productMap.get(item.productId);

      const lineTotal = product.price.mul(
        item.quantity
      );

      totalAmount = totalAmount.plus(lineTotal);

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    /*
     * 5. Atomically reduce stock
     */
    for (const item of sortedItems) {
      const result = await tx.product.updateMany({
        where: {
          id: item.productId,
          stockQuantity: {
            gte: item.quantity,
          },
        },

        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });

      if (result.count === 0) {
        const error = new Error(
          `Insufficient stock for product ${item.productId}`
        );

        error.statusCode = 409;

        throw error;
      }
    }

    /*
     * 6. Create order + order items
     */
    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: "CONFIRMED",

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return createdOrder;
  });

  return order;
}

export async function getUserOrders(userId) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return orders;
}

export async function getOrderById(
  orderId,
  userId
) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
}