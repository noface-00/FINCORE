import React from 'react';
import {
  Home,
  Users,
  CreditCard,
  DollarSign,
  Calendar,
  ArrowRightLeft,
  Building,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Search,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'Dashboard', path: '/', id: 'dashboard' },
  { icon: Users, label: 'Clientes', path: '/clientes', id: 'clientes' },
  { icon: CreditCard, label: 'Cuentas', path: '/cuentas', id: 'cuentas' },
  { icon: DollarSign, label: 'Préstamos', path: '/prestamos', id: 'prestamos' },
  { icon: Calendar, label: 'Cuotas', path: '/cuotas', id: 'cuotas' },
  { icon: ArrowRightLeft, label: 'Transacciones', path: '/transacciones', id: 'transacciones' },
  { icon: Building, label: 'Banco', path: '/banco', id: 'banco' },
  { icon: BarChart3, label: 'Reportes', path: '/reportes', id: 'reportes' },
  { icon: Settings, label: 'Configuración', path: '/config', id: 'config' },
];

export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  id: string;
}

export { SIDEBAR_ITEMS };

export {
  Home,
  Users,
  CreditCard,
  DollarSign,
  Calendar,
  ArrowRightLeft,
  Building,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Search,
};
