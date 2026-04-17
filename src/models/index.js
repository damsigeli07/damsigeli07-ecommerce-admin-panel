import { sequelize } from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Setting from './Setting.js';

// Define model relationships with proper foreign keys and cascade deletes

// User and Order relationships
User.hasMany(Order, { 
  foreignKey: 'userId', 
  as: 'orders',
  onDelete: 'CASCADE' 
});
Order.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Order and OrderItem relationships
Order.hasMany(OrderItem, { 
  foreignKey: 'orderId', 
  as: 'orderItems',
  onDelete: 'CASCADE' 
});
OrderItem.belongsTo(Order, { 
  foreignKey: 'orderId', 
  as: 'order' 
});

// Product and OrderItem relationships
Product.hasMany(OrderItem, { 
  foreignKey: 'productId', 
  as: 'orderItems' 
});
OrderItem.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'product' 
});

// Category and Product relationships
Category.hasMany(Product, { 
  foreignKey: 'categoryId', 
  as: 'products',
  onDelete: 'CASCADE' 
});
Product.belongsTo(Category, { 
  foreignKey: 'categoryId', 
  as: 'category' 
});

// Export all models and sequelize instance
export {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Setting
};

// Default export with all models
export default {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Setting
};
