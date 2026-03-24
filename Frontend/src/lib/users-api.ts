import { apiFetch } from './api';
import { User } from '@/types/models';

export interface CreateUserRequest {
  fullName: string;
  email: string;
  authUserId: string; // Supabase user ID
  roleId: string;
  departmentId?: string | null;
  managerId?: string | null;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  roleId?: string;
  departmentId?: string | null;
  managerId?: string | null;
}

export async function getUsers(getAccessToken?: () => string | null): Promise<User[]> {
  const response = await apiFetch('/users', { getAccessToken });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function createUser(userData: CreateUserRequest, getAccessToken?: () => string | null): Promise<User> {
  const response = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
    getAccessToken,
  });
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
}

export async function updateUser(id: string, updates: UpdateUserRequest, getAccessToken?: () => string | null): Promise<User> {
  const response = await apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    getAccessToken,
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
}

export async function deleteUser(id: string, getAccessToken?: () => string | null): Promise<void> {
  const response = await apiFetch(`/users/${id}`, {
    method: 'DELETE',
    getAccessToken,
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}
