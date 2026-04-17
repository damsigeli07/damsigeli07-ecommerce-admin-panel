import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dataType: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    allowNull: false,
    defaultValue: 'string'
  }
}, {
  tableName: 'settings',
  underscored: true,
  timestamps: true
});

export default Setting;
