// src/lib/user.ts

import { authApi } from './api';

export async function createUser(email: string, username: string, password: string, displayName: string) {
  try {
    const response = await authApi.register({
      email,
      username,
      password,
      displayName
    });
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user');
  }
}
  