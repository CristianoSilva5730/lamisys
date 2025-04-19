
import { User, UserRole } from "@/lib/types";

export const PERMISSIONS = {
  EDIT_MATERIAL: "EDIT_MATERIAL",
  CREATE_DELETE_MATERIAL: "CREATE_DELETE_MATERIAL",
  VIEW_EDIT_USERS: "VIEW_EDIT_USERS", 
  ACCESS_SETTINGS: "ACCESS_SETTINGS",
  CREATE_ALARMS: "CREATE_ALARMS",
};

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  switch (permission) {
    case PERMISSIONS.EDIT_MATERIAL:
      return [UserRole.PLANEJADOR, UserRole.ADMIN, UserRole.DEVELOP].includes(user.role);

    case PERMISSIONS.CREATE_DELETE_MATERIAL:
      return [UserRole.PLANEJADOR, UserRole.ADMIN, UserRole.DEVELOP].includes(user.role);

    case PERMISSIONS.VIEW_EDIT_USERS:
      return [UserRole.ADMIN, UserRole.DEVELOP].includes(user.role);

    case PERMISSIONS.ACCESS_SETTINGS:
      return [UserRole.DEVELOP].includes(user.role);

    case PERMISSIONS.CREATE_ALARMS:
      return [UserRole.PLANEJADOR, UserRole.ADMIN, UserRole.DEVELOP].includes(user.role);

    default:
      return false;
  }
}
