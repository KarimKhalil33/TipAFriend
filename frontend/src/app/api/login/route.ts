import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const res = await fetch('http://localhost:4000/api/flask/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
