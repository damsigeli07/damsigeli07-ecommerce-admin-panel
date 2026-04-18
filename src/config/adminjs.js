import dotenv from 'dotenv';
import { ComponentLoader } from 'adminjs';
import { fileURLToPath } from 'url';
import path from 'path';

import {
  AdminDashboardNav,
  Category,
  Order,
  OrderItem,
  Product,
  Setting,
  User,
} from '../models/index.js';
import { hashPassword } from '../utils/passwordUtils.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentLoader = new ComponentLoader();

const Components = {
  Dashboard: componentLoader.add(
    'Dashboard',
    path.join(__dirname, '..', 'admin', 'components', 'Dashboard.jsx'),
  ),
};

const isAdmin = ({ currentAdmin }) => currentAdmin?.role === 'admin';
const hashPasswordHook = async (request) => {
  if (request.method !== 'post') return request;
  if (!request.payload) return request;

  const { password, ...rest } = request.payload;
  if (!password) {
    request.payload = rest;
    return request;
  }

  request.payload = {
    ...rest,
    password: await hashPassword(password),
  };
  return request;
};

const adminJsOptions = {
  rootPath: process.env.ADMIN_PANEL_ROUTE || '/admin',
  componentLoader,
  branding: {
    companyName: process.env.SITE_NAME || 'ECommerce Admin',
  },
  locale: {
    language: 'en',
    translations: {
      en: {
        resources: {
          AdminDashboardNav: {
            labels: {
              AdminDashboardNav: 'Admin Dashboard',
            },
          },
        },
      },
    },
  },
  dashboard: {
    component: Components.Dashboard,
    handler: async (request, response, context) => {
      const { currentAdmin } = context;
      if (!currentAdmin) {
        return { currentAdmin: null, stats: null, recentOrders: [] };
      }

      if (currentAdmin.role === 'admin') {
        const [users] = await Promise.all([
          User.count(),
        ]);
        const orders = await Order.count();
        const revenue = await Order.sum('totalAmount', { where: { status: 'completed' } });

        const recentOrders = await Order.findAll({
          attributes: ['id', 'status', 'totalAmount', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: 10,
          raw: true,
        });

        return {
          currentAdmin,
          stats: {
            users,
            orders,
            revenue: revenue ? String(revenue) : '0.00',
          },
          recentOrders,
        };
      }

      const recentOrders = await Order.findAll({
        where: { userId: currentAdmin.id },
        attributes: ['id', 'status', 'totalAmount', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 10,
        raw: true,
      });

      return {
        currentAdmin,
        stats: null,
        recentOrders,
      };
    },
  },
  resources: [
    {
      resource: AdminDashboardNav,
      options: {
        id: 'AdminDashboardNav',
        navigation: { name: 'Admin', icon: 'Home' },
        href: ({ h }) => h.dashboardUrl(),
        actions: {
          list: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          show: { isAccessible: () => false },
          edit: { isAccessible: () => false },
          new: { isAccessible: () => false },
          delete: { isAccessible: () => false },
          bulkDelete: { isAccessible: () => false },
        },
      },
    },
    {
      resource: User,
      options: {
        navigation: { name: 'Admin', icon: 'User' },
        properties: {
          password: {
            isVisible: { list: false, filter: false, show: false, edit: true },
          },
        },
        actions: {
          list: { isAccessible: isAdmin },
          show: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin, before: hashPasswordHook },
          new: { isAccessible: isAdmin, before: hashPasswordHook },
          delete: { isAccessible: isAdmin },
          bulkDelete: { isAccessible: isAdmin },
        },
      },
    },
    {
      resource: Category,
      options: {
        navigation: { name: 'Catalog', icon: 'Categories' },
        actions: {
          list: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          show: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          new: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin },
          bulkDelete: { isAccessible: isAdmin },
        },
      },
    },
    {
      resource: Product,
      options: {
        navigation: { name: 'Catalog', icon: 'Product' },
        actions: {
          list: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          show: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          new: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin },
          bulkDelete: { isAccessible: isAdmin },
        },
      },
    },
    {
      resource: Order,
      options: {
        navigation: { name: 'Sales', icon: 'ShoppingCart' },
        actions: {
          list: {
            isAccessible: ({ currentAdmin }) => !!currentAdmin,
            before: async (request, context) => {
              if (context.currentAdmin?.role !== 'admin') {
                request.query = {
                  ...(request.query || {}),
                  'filters.userId': context.currentAdmin?.id,
                };
              }
              return request;
            },
          },
          show: {
            isAccessible: ({ currentAdmin }) => !!currentAdmin,
            before: async (request, context) => {
              if (context.currentAdmin?.role !== 'admin') {
                const recordId = request?.params?.recordId;
                if (!recordId) throw new Error('Order not found');
                const order = await Order.findByPk(recordId, { attributes: ['id', 'userId'] });
                if (!order || String(order.userId) !== String(context.currentAdmin?.id)) {
                  throw new Error('Forbidden');
                }
              }
              return request;
            },
          },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin },
          bulkDelete: { isAccessible: isAdmin },
        },
      },
    },
    {
      resource: OrderItem,
      options: {
        navigation: { name: 'Sales', icon: 'Package' },
        actions: {
          list: { isAccessible: isAdmin },
          show: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin },
          bulkDelete: { isAccessible: isAdmin },
        },
      },
    },
    {
      resource: Setting,
      options: {
        navigation: { name: 'Admin', icon: 'Settings' },
        actions: {
          list: { isAccessible: isAdmin },
          show: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin },
          bulkDelete: { isAccessible: isAdmin },
        },
      },
    },
  ],
};

export { Components };
export default adminJsOptions;

