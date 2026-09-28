import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const products = [
  {
    name: "iPhone 17",
    description: "Apple smartphone",
    price: 79999,
    stockQuantity: 10,
    category: "electronics",
  },
  {
    name: "Samsung Galaxy S25",
    description: "Samsung flagship smartphone",
    price: 74999,
    stockQuantity: 8,
    category: "electronics",
  },
  {
    name: "iPhone 16 Case",
    description: "Protective silicone case for iPhone",
    price: 1499,
    stockQuantity: 25,
    category: "accessories",
  },
  {
    name: "Wireless Bluetooth Headphones",
    description: "Noise cancelling wireless headphones",
    price: 4999,
    stockQuantity: 0,
    category: "electronics",
  },
  {
    name: "USB-C Fast Charger",
    description: "65W USB-C fast charging adapter",
    price: 2499,
    stockQuantity: 30,
    category: "accessories",
  },
  {
    name: "MacBook Air M4",
    description: "Apple laptop with M4 chip",
    price: 114999,
    stockQuantity: 5,
    category: "electronics",
  },
  {
    name: "Dell Inspiron 15",
    description: "15-inch productivity laptop",
    price: 65999,
    stockQuantity: 7,
    category: "electronics",
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB mechanical keyboard",
    price: 3999,
    stockQuantity: 12,
    category: "gaming",
  },
  {
    name: "Wireless Gaming Mouse",
    description: "Low latency wireless gaming mouse",
    price: 2999,
    stockQuantity: 0,
    category: "gaming",
  },
  {
    name: "Gaming Monitor 27 Inch",
    description: "144Hz Full HD gaming monitor",
    price: 18999,
    stockQuantity: 6,
    category: "gaming",
  },
  {
    name: "Nike Running Shoes",
    description: "Lightweight running shoes",
    price: 5999,
    stockQuantity: 15,
    category: "fashion",
  },
  {
    name: "Adidas Sports T-Shirt",
    description: "Breathable sports t-shirt",
    price: 1999,
    stockQuantity: 0,
    category: "fashion",
  },
  {
    name: "Levi's Slim Fit Jeans",
    description: "Classic slim fit denim jeans",
    price: 3499,
    stockQuantity: 9,
    category: "fashion",
  },
  {
    name: "The Psychology of Money",
    description: "Book about personal finance and investing",
    price: 499,
    stockQuantity: 20,
    category: "books",
  },
  {
    name: "Clean Code",
    description: "A handbook of agile software craftsmanship",
    price: 899,
    stockQuantity: 0,
    category: "books",
  },
];

async function main() {
  await prisma.product.createMany({
    data: products,
  });

  console.log(`${products.length} products inserted successfully.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });