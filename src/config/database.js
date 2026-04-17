import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env file in project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Database configuration with connection pooling
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_admin_db',
  process.env.DB_USER || 'admin_user',
  process.env.DB_PASSWORD || 'damsi2020',
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    
    // Connection pooling configuration
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: 30000, // Maximum time (ms) to acquire a connection
      idle: 60000,    // Maximum time (ms) that a connection can be idle
    },
    
    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Database configuration
    define: {
      underscored: true,        // Use snake_case for column names
      freezeTableName: true,   // Don't pluralize table names
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
    },
    
    // Timeouts
    dialectOptions: {
      connectTimeout: 10000,
      acquireTimeout: 30000,
    },
    
    // Sync options (will be used when calling sync)
    sync: {
      alter: process.env.NODE_ENV === 'development',
      force: false,
    }
  }
);

// Test database connection with retry logic
const testConnection = async (retries = 5, delay = 2000) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${delay / 1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return testConnection(retries - 1, delay * 1.5); // Exponential backoff
    } else {
      console.error('❌ Max retries reached. Unable to connect to database.');
      throw error;
    }
  }
};

// Initialize database connection
const initializeDatabase = async () => {
  try {
    // Test connection first
    await testConnection();
    
    // Sync database (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully (development mode).');
    } else {
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized successfully (production mode).');
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Graceful shutdown handler
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Handle process termination
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);

export { sequelize, initializeDatabase, closeConnection };
