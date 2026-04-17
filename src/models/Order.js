import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true
});

export default Order;
