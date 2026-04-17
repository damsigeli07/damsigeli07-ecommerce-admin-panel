import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/sequelize';
import path from 'path';
import adminJsOptions from './config/adminjs.js';
import authRoutes from './routes/auth.js';
import { User } from './models/index.js';
import { comparePassword } from './utils/passwordUtils.js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Initialize Express app
const app = express();

app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Minimal UI pages (assignment "UI")
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>ECommerce Admin Panel</title>
        <style>
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:0;background:#0b1220;color:#e5e7eb}
          .wrap{max-width:920px;margin:0 auto;padding:48px 20px}
          .card{background:#111a2e;border:1px solid #24324f;border-radius:16px;padding:20px;margin-top:16px}
          a{color:#93c5fd;text-decoration:none}
          .btn{display:inline-block;background:#2563eb;color:white;padding:10px 14px;border-radius:10px}
          .muted{color:#9ca3af}
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>ECommerce Admin Panel</h1>
          <p class="muted">AdminJS + Sequelize + PostgreSQL + JWT auth</p>
          <div class="card">
            <p><a class="btn" href="${adminJsOptions.rootPath}">Open Admin Dashboard</a></p>
            <p class="muted">Use AdminJS login to access the dashboard.</p>
          </div>
          <div class="card">
            <h3>API Login (JWT)</h3>
            <p>POST <code>/api/login</code> with JSON: <code>{"email":"admin@example.com","password":"admin123"}</code></p>
            <p class="muted">This is for API usage, separate from the AdminJS session.</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Register AdminJS
AdminJS.registerAdapter({ Database, Resource });

// Initialize AdminJS
const admin = new AdminJS(adminJsOptions);

// AdminJS routes
const authenticate = async (email, password) => {
  const user = await User.findOne({
    where: { email },
    attributes: ['id', 'email', 'password', 'role', 'name', 'isActive'],
  });
  if (!user || !user.isActive) return null;
  const ok = await comparePassword(password, user.password);
  if (!ok) return null;
  return { id: user.id, email: user.email, role: user.role, name: user.name };
};

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || (process.env.SESSION_SECRET || 'change-me-in-env'),
  },
  null,
  {
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
);
app.use(adminJsOptions.rootPath, adminRouter);

// API routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
  });
});
app.use(
  '/api',
  bodyParser.json({ limit: '10mb' }),
  bodyParser.urlencoded({ extended: true, limit: '10mb' }),
  authRoutes,
);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

export default app;
