import prisma from "../../config/database.js";

export async function createProduct(data) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      category: data.category,
    },
  });

  return product;
}

export async function getProducts({
  search,
  category,
  inStock,
  page,
  limit,
}) {
  const where = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category) {
    where.category = category;
  }

  if (inStock !== undefined) {
    where.stockQuantity =
      inStock === "true"
        ? {
            gt: 0,
          }
        : {
            equals: 0,
          };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(productId) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
}

export async function updateProduct(productId, data) {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!existingProduct) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const product = await prisma.product.update({
    where: {
      id: productId,
    },
    data,
  });

  return product;
}

export async function deleteProduct(productId) {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!existingProduct) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });
}