import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { initializeDatabase } from '../src/config/database.js';
import { Category, Order, OrderItem, Product, User } from '../src/models/index.js';

async function main() {
  await initializeDatabase();

  const user = await User.findOne({ where: { email: 'user@example.com' } });
  if (!user) {
    console.error('Demo user not found. Start the server once to seed defaults.');
    process.exit(1);
  }

  const [cat] = await Category.findOrCreate({
    where: { name: 'Demo Category' },
    defaults: { description: 'Seeded demo category' },
  });

  const [product] = await Product.findOrCreate({
    where: { name: 'Demo Product' },
    defaults: {
      description: 'Seeded demo product',
      price: '19.99',
      stock: 50,
      categoryId: cat.id,
      isActive: true,
    },
  });

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

  console.log('Seeded demo data: category, product, order, order item');
  console.log(`Order ID: ${order.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

