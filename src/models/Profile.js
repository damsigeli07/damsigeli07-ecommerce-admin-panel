import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Profile model for AdminJS navigation.
 * This is a virtual model used only for navigation purposes.
 * Actual profile data is stored in the User model.
 */
const Profile = sequelize.define(
  'Profile',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: 'profile_nav',
    timestamps: false,
  },
);

export default Profile;
