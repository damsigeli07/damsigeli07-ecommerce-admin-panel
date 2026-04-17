## Assignment mapping

### Core setup

- Node.js + Express: `server.js`, `src/app-adminjs.js`
- Sequelize ORM + PostgreSQL: `src/config/database.js`, `src/models/*`
- AdminJS integration: `src/config/adminjs.js`, `src/admin/components/*`
- bcrypt hashing: `src/utils/passwordUtils.js` (+ AdminJS password hook)
- JWT auth: `src/utils/tokenUtils.js`, `src/routes/auth.js`, `src/middleware/auth.js`

### Models

- User, Category, Product, Order, OrderItem, Setting: `src/models/*`
- Associations: `src/models/index.js`

### Authentication + RBAC

- JWT login: `POST /api/login`
- AdminJS session login: `/admin/login`
- RBAC: `src/config/adminjs.js` (`isAccessible`, filters, and action guards)

### Dashboard & Settings pages

- Dashboard: `src/admin/components/Dashboard.jsx` + AdminJS dashboard handler
- Settings page: `src/admin/components/Settings.jsx` + AdminJS custom page config

