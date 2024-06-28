import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    const res = await fetch('http://localhost:4000/api/flask/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      return NextResponse.json({ message: 'User created successfully' });
    } else {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || 'Failed to create user' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
