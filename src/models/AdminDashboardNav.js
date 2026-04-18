import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Placeholder model so AdminJS can show a sidebar entry that links to the
 * main dashboard (see resource `href` in adminjs config). No application
 * data is stored here; the table may stay empty.
 */
const AdminDashboardNav = sequelize.define(
  'AdminDashboardNav',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: 'admin_dashboard_nav',
    timestamps: false,
  },
);

export default AdminDashboardNav;
