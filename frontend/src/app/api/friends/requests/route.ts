import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call both incoming and outgoing endpoints
    const [incomingResponse, outgoingResponse] = await Promise.all([
      fetch(`http://localhost:8080/api/friends/requests/incoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`http://localhost:8080/api/friends/requests/outgoing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    ]);

    if (!incomingResponse.ok || !outgoingResponse.ok) {
      const incomingError = !incomingResponse.ok ? await incomingResponse.text() : '';
      const outgoingError = !outgoingResponse.ok ? await outgoingResponse.text() : '';
      console.error('Backend errors:', { incoming: incomingError, outgoing: outgoingError });
      return NextResponse.json(
        { error: 'Failed to get friend requests' },
        { status: 500 }
      );
    }

    const [incoming, outgoing] = await Promise.all([
      incomingResponse.json(),
      outgoingResponse.json()
    ]);

    return NextResponse.json({ incoming, outgoing });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}