import dotenv from 'dotenv';

const { parsed } = dotenv.config({ path: '.env' });

const required = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'SESSION_SECRET',
  'ADMIN_COOKIE_SECRET',
];

const missing = required.filter((k) => !process.env[k]);

console.log(`Loaded ${Object.keys(parsed || {}).length} values from .env`);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Env looks good.');

