/**
 * Permission constants and types for the application
 */

// Action types for resources
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Resources in the system that can have permissions
export enum RESOURCES {
  COURSES = 'courses',
  LESSONS = 'lessons',
  USERS = 'users',
  SETTINGS = 'settings',
  REPORTS = 'reports',
  PAYMENTS = 'payments',
  ENROLLMENTS = 'enrollments',
}

// User roles in the system
export enum USER_ROLES {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',    // Changed from INSTRUCTOR to match actual role name in system
  STUDENT = 'student',
  GUEST = 'guest',        // Keep for potential future use
}

// All available permissions
export const PERMISSIONS = {
  // Course permissions
  CREATE_COURSE: `create:${RESOURCES.COURSES}`,
  READ_COURSE: `read:${RESOURCES.COURSES}`,
  UPDATE_COURSE: `update:${RESOURCES.COURSES}`,
  DELETE_COURSE: `delete:${RESOURCES.COURSES}`,
  MANAGE_COURSES: `manage:${RESOURCES.COURSES}`,
} as const;

// Permission sets by role
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [USER_ROLES.ADMIN]: [
    // All course and lesson permissions
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.READ_COURSE,
    PERMISSIONS.UPDATE_COURSE,
    PERMISSIONS.DELETE_COURSE,
    PERMISSIONS.MANAGE_COURSES,
    
    
  ],
  
  [USER_ROLES.TEACHER]: [
    // Course permissions (limited to own courses)
    PERMISSIONS.READ_COURSE,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.UPDATE_COURSE,
    
  ],
  
  [USER_ROLES.STUDENT]: [
    // Can read courses and lessons they're enrolled in
    PERMISSIONS.READ_COURSE,
  ],
  
  [USER_ROLES.GUEST]: [
    // Can only read published courses (filtered server-side)
    PERMISSIONS.READ_COURSE,
  ],
};
