
import { User, UserRole } from "@/lib/types";

export const PERMISSIONS = {
  EDIT_MATERIAL: 'EDIT_MATERIAL',
  CREATE_DELETE_MATERIAL: 'CREATE_DELETE_MATERIAL',
  VIEW_EDIT_USERS: 'VIEW_EDIT_USERS',
  ACCESS_SETTINGS: 'ACCESS_SETTINGS',
  CREATE_ALARMS: 'CREATE_ALARMS',
  MANAGE_USERS: 'MANAGE_USERS'
} as const;

export const hasPermission = (user: User | null, permission: keyof typeof PERMISSIONS): boolean => {
  if (!user) return false;

  switch (permission) {
    case 'EDIT_MATERIAL':
    case 'CREATE_DELETE_MATERIAL':
      return user.role === UserRole.ADMIN || user.role === UserRole.PLANEJADOR;
    case 'VIEW_EDIT_USERS':
    case 'ACCESS_SETTINGS':
    case 'CREATE_ALARMS':
    case 'MANAGE_USERS':
      return user.role === UserRole.ADMIN || user.role === UserRole.DEVELOP;
    default:
      return false;
  }
};
