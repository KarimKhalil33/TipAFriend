# TipAFriend API Reference (MVP)

Base URL (local): `http://localhost:8080`

## Auth
All endpoints except `/api/auth/*`, `/api/health`, `/actuator/*` require a Bearer token.

**Auth header**
```
Authorization: Bearer <jwt>
```

---

## Error Response
Common error payload (from `GlobalExceptionHandler`):

```json
{
  "message": "...",
  "code": "BAD_REQUEST|NOT_FOUND|FORBIDDEN|VALIDATION_ERROR|INTERNAL_ERROR",
  "timestamp": "2026-02-17T12:00:00"
}
```

---

## Health

### GET /api/health
Returns service status.

---

## Authentication

### POST /api/auth/register
Create a user and return a JWT.

**Request**
```json
{
  "email": "user@example.com",
  "username": "user1",
  "password": "password123",
  "displayName": "User One"
}
```

**Response**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user1",
    "displayName": "User One",
    "photoUrl": null,
    "bio": null
  }
}
```

### POST /api/auth/login
Login by username or email.

**Request**
```json
{
  "username": "user1",
  "password": "password123"
}
```

**Response**
Same as register.

### GET /api/auth/me
Returns the authenticated user.

---

## Users

### GET /api/users/me
Returns the authenticated user (same as `/api/auth/me`).

### GET /api/users/{id}
Returns user profile by id.

### GET /api/users/search?q={query}
Search users by username or display name (case-insensitive).

**Example**
```
GET /api/users/search?q=karim
```

**Response**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "username": "karim",
    "displayName": "Karim Khalil",
    "photoUrl": null,
    "bio": null
  }
]
```

---

## Friends

### POST /api/friends/requests
Send a friend request.

**Request**
```json
{ "toUserId": 2 }
```

### PUT /api/friends/requests/{id}/accept
Accept a friend request.

### PUT /api/friends/requests/{id}/decline
Decline a friend request.

### GET /api/friends/requests/incoming
List incoming friend requests.

### GET /api/friends/requests/outgoing
List outgoing friend requests.

### GET /api/friends
List friend IDs for the authenticated user.

### DELETE /api/friends/{friendId}
Remove a friend.

---

## Posts

### POST /api/posts
Create a post (Request or Offer).

**Request**
```json
{
  "type": "REQUEST",
  "title": "Help move a couch",
  "description": "Need help this weekend",
  "category": "MOVING",
  "locationName": "Downtown",
  "latitude": 37.77,
  "longitude": -122.42,
  "scheduledTime": "2026-02-20T10:00:00",
  "durationMinutes": 120,
  "paymentType": "FIXED",
  "price": 50.00
}
```

### GET /api/posts/{id}
Get post by id.

### PUT /api/posts/{id}
Update a post (only if status is OPEN).

### GET /api/posts/feed
Friends-only feed (OPEN posts).

**Query params**
- `type` (optional): `REQUEST|OFFER`
- `category` (optional): `CLEANING|MOVING|...`
- pagination: `page`, `size`, `sort`

Example:
`/api/posts/feed?type=REQUEST&category=MOVING&page=0&size=20`

### GET /api/posts/my-posts
Returns posts created by the authenticated user.

### GET /api/posts/user/{userId}
Returns posts created by the specified user (friends-only unless same user).

### GET /api/posts/accepted
Returns posts accepted by the authenticated user.

---

## Tasks

### POST /api/tasks/posts/{postId}/accept
Accept a post. (Only friends can accept.)

### PUT /api/tasks/{taskId}/in-progress
Mark task as in progress (accepter only).

### PUT /api/tasks/{taskId}/complete
Mark task completed (accepter only).

---

## Payments

### POST /api/payments
Creates a payment record and optionally a Stripe PaymentIntent.

**Request**
```json
{
  "postId": 10,
  "payeeId": 2,
  "amount": 50.00,
  "stripePaymentIntentId": null
}
```

**Notes**
- If `STRIPE_SECRET_KEY` is set, the server will create a PaymentIntent.
- Otherwise it will store the provided `stripePaymentIntentId`.

### PUT /api/payments/{paymentId}/status
Update payment status.

**Request**
```json
{
  "status": "SUCCEEDED",
  "errorMessage": null
}
```

---

## Reviews

### POST /api/reviews
Create a review for a completed task.

**Request**
```json
{
  "taskAssignmentId": 55,
  "rating": 5,
  "comment": "Great help!"
}
```

---

## Messaging

### POST /api/conversations
Create a conversation.

**Request**
```json
{
  "type": "DIRECT",
  "taskAssignmentId": null,
  "participantIds": [1, 2]
}
```

For task threads:
```json
{
  "type": "TASK_THREAD",
  "taskAssignmentId": 55,
  "participantIds": [1, 2]
}
```

### GET /api/conversations/{conversationId}/messages
List messages in a conversation.

### POST /api/conversations/messages
Send a message.

**Request**
```json
{
  "conversationId": 99,
  "body": "Hey, are you free tomorrow?"
}
```

---

## Notifications

### GET /api/notifications
List notifications for the authenticated user.

### PUT /api/notifications/{id}/read
Mark notification as read.

---

## Stripe Webhooks

### POST /api/webhooks/stripe
Stripe calls this endpoint for PaymentIntent updates.

**Headers**
```
Stripe-Signature: <stripe-signature>
```

**Notes**
- Requires `STRIPE_WEBHOOK_SECRET` to be set on the backend.
- Updates payment status based on `payment_intent.succeeded`, `payment_intent.processing`, and `payment_intent.payment_failed`.

---

## Stripe Setup (Backend)

Set the following environment variables (do not commit them):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Frontend Integration Checklist

1. Register/login and store JWT.
2. Send `Authorization: Bearer <jwt>` for all protected endpoints.
3. Use `/api/posts/feed` for friends-only feed.
4. Use task acceptance endpoints to drive lifecycle.
5. Use payments endpoints to track Stripe status.
6. Use messaging/notifications endpoints for basic UX.

---

## TODO (Next Iterations)
- Stripe webhooks for payment confirmation.
- Authorization checks for post updates (owner only).
- Pagination on messages/notifications.
- Push notifications (FCM/APNs).
