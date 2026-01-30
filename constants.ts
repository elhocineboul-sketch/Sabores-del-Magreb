import { MenuItem, Category, Order } from './types';

const MENU_ITEMS_AR: MenuItem[] = [];

const MENU_ITEMS_EN: MenuItem[] = [];

const MENU_ITEMS_ES: MenuItem[] = [];

export const MENU_ITEMS_BY_LANG = {
  ar: MENU_ITEMS_AR,
  en: MENU_ITEMS_EN,
  es: MENU_ITEMS_ES
};

// Default export
export const MENU_ITEMS = MENU_ITEMS_ES;

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'burger', label: 'برجر' },
  { id: 'tacos', label: 'تاكوس' },
  { id: 'pizza', label: 'بيتزا' },
  { id: 'drinks', label: 'مشروبات' },
  { id: 'desserts', label: 'حلويات' },
];

// Seed Data to simulate shared DB across devices
export const MOCK_DB_ORDERS: Order[] = [];

export const ADMIN_USERNAME = 'elhocine boul';
export const ADMIN_PASSWORD = 'wizardgoo10200'; 

export const DRIVER_USERNAME = 'Conductor rápido';
export const DRIVER_PASSWORD = 'elhocine1020';

export const MOCK_REGISTERED_USERS_KEY = 'food_morocco_registered_users_v2';
export const MOCK_CURRENT_USER_KEY = 'food_morocco_current_user_v2';
export const STORAGE_ORDERS_KEY = 'food_morocco_orders_db_v2';