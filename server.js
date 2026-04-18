import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import app from './src/app-adminjs.js';
import { initializeDatabase } from './src/config/database.js';
import { User, Setting, Category, Product } from './src/models/index.js';
import { hashPassword } from './src/utils/passwordUtils.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Starting ECommerce Admin Panel Server...');
    console.log('Initializing database connection...');
    await initializeDatabase();

    // Seed default admin user
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin123');
      await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'admin',
        isActive: true,
      });
    }

    // Seed default regular user
    const existingUser = await User.findOne({ where: { email: 'user@example.com' } });
    if (!existingUser) {
      const hashedPassword = await hashPassword('user123');
      await User.create({
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Demo User',
        role: 'user',
        isActive: true,
      });
    }

    // Seed basic settings
    const defaultSettings = [
      { key: 'site_name', value: 'ECommerce Store', dataType: 'string' },
      { key: 'max_products_per_page', value: '20', dataType: 'number' },
      { key: 'maintenance_mode', value: 'false', dataType: 'boolean' },
      { key: 'currency', value: 'USD', dataType: 'string' },
      { key: 'tax_rate', value: '0.08', dataType: 'number' },
    ];

    for (const setting of defaultSettings) {
      await Setting.findOrCreate({ where: { key: setting.key }, defaults: setting });
    }

    const demoCategories = [
      { name: 'Electronics', description: 'Devices, accessories, and gadgets' },
      { name: 'Apparel', description: 'Clothing and wearable accessories' },
      { name: 'Home & Kitchen', description: 'Household and kitchen items' },
    ];
    for (const c of demoCategories) {
      await Category.findOrCreate({ where: { name: c.name }, defaults: { description: c.description } });
    }

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
    for (const p of demoProducts) {
      const category = await Category.findOne({ where: { name: p.categoryName } });
      if (!category) continue;
      const { categoryName, ...defaults } = p;
      await Product.findOrCreate({
        where: { name: p.name },
        defaults: {
          ...defaults,
          categoryId: category.id,
          isActive: true,
        },
      });
    }

    app.listen(PORT, () => {
      console.log('\n=== Server Started Successfully ===');
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`API Health Check: http://localhost:${PORT}/health`);
      console.log(`Login API: http://localhost:${PORT}/api/login`);
      console.log('\n=== Default Login Credentials ===');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Email: user@example.com');
      console.log('Password: user123');
      console.log('=====================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

