import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
} from "./product.validation.js";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./product.service.js";

export async function create(req, res, next) {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const product = await createProduct(validatedData);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const query = getProductsQuerySchema.parse(req.query);

    const result = await getProducts(query);

    return res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
    }

    const product = await getProductById(productId);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
    }

    const validatedData = updateProductSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      const error = new Error("At least one field is required");
      error.statusCode = 400;
      throw error;
    }

    const product = await updateProduct(
      productId,
      validatedData
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
    }

    await deleteProduct(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}