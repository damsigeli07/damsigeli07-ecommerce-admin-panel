import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { initializeDatabase } from '../src/config/database.js';
import { Category, Order, OrderItem, Product, User } from '../src/models/index.js';

const demoCategories = [
  { name: 'Electronics', description: 'Devices, accessories, and gadgets' },
  { name: 'Apparel', description: 'Clothing and wearable accessories' },
  { name: 'Home & Kitchen', description: 'Household and kitchen items' },
];

const demoProducts = [
  {
    name: 'Wireless Mouse',
    description: 'Compact wireless mouse with long battery life',
    price: '24.99',
    stock: 120,
    categoryName: 'Electronics',
  },
  {
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and card reader',
    price: '49.50',
    stock: 45,
    categoryName: 'Electronics',
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Unisex crew neck tee',
    price: '18.00',
    stock: 200,
    categoryName: 'Apparel',
  },
  {
    name: 'Ceramic Mug Set',
    description: 'Set of 4 stackable mugs',
    price: '32.00',
    stock: 60,
    categoryName: 'Home & Kitchen',
  },
];

async function main() {
  await initializeDatabase();

  for (const c of demoCategories) {
    await Category.findOrCreate({
      where: { name: c.name },
      defaults: { description: c.description },
    });
  }

  for (const p of demoProducts) {
    const category = await Category.findOne({ where: { name: p.categoryName } });
    if (!category) continue;
    const { categoryName, ...rest } = p;
    await Product.findOrCreate({
      where: { name: p.name },
      defaults: {
        ...rest,
        categoryId: category.id,
        isActive: true,
      },
    });
  }

  console.log('Seeded demo catalog: categories and products');

  const user = await User.findOne({ where: { email: 'user@example.com' } });
  if (!user) {
    console.log('Demo user not found; skipped order + order items (start server once to create users).');
    return;
  }

  const product = await Product.findOne({ where: { name: 'Wireless Mouse' } });
  if (!product) {
    console.log('No demo product found; skipped order item');
    return;
  }

  const order = await Order.create({
    userId: user.id,
    totalAmount: '39.98',
    status: 'pending',
  });

  await OrderItem.create({
    orderId: order.id,
    productId: product.id,
    quantity: 2,
    unitPrice: product.price,
  });

  console.log('Seeded demo order + order item');
  console.log(`Order ID: ${order.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
