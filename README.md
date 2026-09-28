# Inventory & Order API

A small Node.js + Express API for products, users, and orders.

I built this as a backend exercise, so the focus is on keeping the code easy to follow while still handling the database cases that matter: validation, authentication, stock updates, transactions, and basic concurrency.

## Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Zod
- bcrypt
- JSON Web Tokens

The project uses JavaScript.

## What it does

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Passwords are hashed with bcrypt. Login returns a JWT, and protected routes use the JWT to identify the user.

### Products

- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

The product list supports:

- name search
- category filter
- `inStock=true|false`
- page/limit pagination

Example:

```text
GET /products?category=electronics&inStock=true&page=1&limit=10
```

Product writes require authentication. Product reads are public.

### Orders

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`

An order request only contains product IDs and quantities. The server gets prices from the database and calculates the total itself.

## Database model

There are four main tables:

- `User`
- `Product`
- `Order`
- `OrderItem`

`OrderItem` connects orders and products and stores the quantity and the price at the time of purchase.

That price snapshot is intentional. If a product changes from ₹1,000 to ₹900 later, an old order should still show the price that was actually used when it was created.

## Stock and concurrency

This is the part I paid the most attention to.

A naive implementation would do:

```text
read stock
check stock
update stock
create order
```

That can fail when two requests try to buy the last item at the same time.

The order code instead performs a conditional stock update inside a database transaction:

```text
stockQuantity >= requestedQuantity
        +
stockQuantity = stockQuantity - requestedQuantity
```

The update only succeeds when enough stock is still available. The affected-row count is checked; if it is zero, the API returns `409 Conflict`.

The stock changes, order creation, and order-item creation are part of the same transaction. If something fails, the transaction rolls back instead of leaving reduced stock without a corresponding order.

Products in an order are also processed in ID order. This gives transactions a consistent locking/update order when an order contains multiple products.

## Project structure

```text
prisma/
  schema.prisma
  seed.js
  migrations/

src/
  config/
    database.js

  middleware/
    auth.middleware.js
    error.middleware.js

  modules/
    auth/
      auth.routes.js
      auth.controller.js
      auth.service.js
      auth.validation.js

    products/
      product.routes.js
      product.controller.js
      product.service.js
      product.validation.js

    orders/
      order.routes.js
      order.controller.js
      order.service.js
      order.validation.js

  app.js

server.js
.env
.env.example
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Copy `.env.example` to `.env` and add your PostgreSQL connection string and JWT secret.

Example:

```env
PORT=3000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="1d"
```

Do not commit `.env`.

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Add development products

The project has a seed file with test products covering different categories and stock states.

```bash
npx prisma db seed
```

The seed is meant for development/testing. It clears the existing products before inserting the test set, so don't use it against a production database.

### 6. Start the server

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

There is also a small browser UI for testing the API:

```text
http://localhost:3000
```

It is only a development/testing interface. The API itself still handles authentication and validation.

## API examples

### Register

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "name": "test1",
  "email": "test1@example.com",
  "password": "12345678"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "test1@example.com",
  "password": "12345678"
}
```

Use the returned token as:

```text
Authorization: Bearer <token>
```

### Create product

```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard",
  "price": 3999,
  "stockQuantity": 10,
  "category": "gaming"
}
```

### Create order

```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ]
}
```

The client does not send `userId`, `price`, or `totalAmount`. Those values are controlled by the server.

## HTTP status codes

The API uses normal HTTP status codes for the main cases:

- `200` successful reads/updates/deletes
- `201` resource created
- `400` invalid request/validation
- `401` missing or invalid authentication
- `404` resource not found
- `409` conflict, such as duplicate email or insufficient stock
- `500` unexpected server error

## Postman

A ready-to-import collection is included in:

```text
postman/Inventory-Order-API.postman_collection.json
```

Import it into Postman.

The collection stores the JWT after login and also stores the last created product/order IDs, so most requests can be run without manually copying IDs around.

## AI usage

I used AI as a development assistant while building this project.

- Mostly chatgpt for reasoning and code generation

## Notes

This is intentionally not a full production e-commerce backend.

Things such as payments, roles/admin permissions, shipping, inventory reservations, refresh tokens, rate limiting, logging infrastructure, and background jobs are outside the scope of this assignment.

The goal here is a small API with sensible database design and correct handling of the core inventory/order cases.
