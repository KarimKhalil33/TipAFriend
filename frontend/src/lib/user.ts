// src/lib/user.ts

export async function createUser(name: string, email: string, password: string) {
    const response = await fetch('http://localhost:5000/api/flask/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
  
    return await response.json();
  }
  