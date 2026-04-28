

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Refuse to talk to the backend over plain HTTP from a secure (HTTPS) page,
// or in production builds. Mixed content is the #1 source of credential and
// session-token leakage. Localhost is permitted because Next.js dev server
// is HTTP by default.
const isHttpsApi = API_BASE_URL.startsWith('https://');
const isLocalhostApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(API_BASE_URL);
const isProduction = process.env.NODE_ENV === 'production';

if (typeof window !== 'undefined') {
  const pageIsHttps = window.location.protocol === 'https:';
  if (!isHttpsApi && !isLocalhostApi) {
    // Hard fail in prod; loud warning in dev.
    const msg = `Refusing to use insecure API URL ${API_BASE_URL}. Set NEXT_PUBLIC_API_URL to an https:// origin.`;
    if (isProduction || pageIsHttps) {
      throw new Error(msg);
    }
    // eslint-disable-next-line no-console
    console.warn('[security] ' + msg);
  }
}

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;

  constructor(message: string, options?: { code?: string; details?: unknown; status?: number }) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.details = options?.details;
    this.status = options?.status;
  }
}

const toApiError = async (response: Response, fallbackMessage: string): Promise<ApiError> => {
  const payload = await response.json().catch(() => null);
  const message =
    payload?.message ||
    payload?.error ||
    fallbackMessage ||
    `HTTP error! status: ${response.status}`;

  return new ApiError(message, {
    code: payload?.errorCode || payload?.code,
    details: payload?.details,
    status: response.status,
  });
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make authenticated requests directly to backend
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Use backend API_BASE_URL for all requests
  const apiUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;

  const response = await fetch(apiUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw await toApiError(response, 'An error occurred');
  }

  return response;
};

// Types based on API documentation
export interface User {
  id: number;
  email?: string;
  username: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface Post {
  id: number;
  author: User;
  authorId?: number;
  taskAssignmentId?: number;
  accepterId?: number;
  type: 'REQUEST' | 'OFFER';
  title: string;
  description?: string;
  category?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  scheduledTime?: string;
  durationMinutes?: number;
  paymentType?: 'FIXED' | 'HOURLY' | 'NEGOTIABLE';
  price?: number;
  status: 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  type: 'REQUEST' | 'OFFER';
  title: string;
  description?: string;
  category?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  scheduledTime?: string;
  durationMinutes?: number;
  paymentType?: 'FIXED' | 'HOURLY' | 'NEGOTIABLE';
  price?: number;
}

export interface FriendRequest {
  id: number;
  fromUser: User;
  toUser: User;
  status: string;
  createdAt: string;
}

export interface TaskAssignment {
  id: number;
  post: Post;
  accepter: User;
  acceptedAt: string;
  status: string;
  completedAt?: string;
}

export interface Payment {
  id: number;
  post?: Post;
  postId?: number;
  payer?: User;
  payerId?: number;
  payee?: User;
  payeeId?: number;
  amount: number;
  status: string;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  errorMessage?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export interface Review {
  id: number;
  taskAssignment?: TaskAssignment;
  taskAssignmentId?: number;
  reviewer?: User;
  reviewerId?: number;
  reviewee?: User;
  revieweeId?: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  type: 'DIRECT' | 'TASK_THREAD';
  taskAssignment?: TaskAssignment;
  taskAssignmentId?: number | null;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
  updatedAt?: string;
  createdAt: string;
}

export interface Message {
  id: number;
  conversation?: Conversation;
  conversationId?: number;
  sender?: User;
  senderId?: number;
  body: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  user: User;
  type: string;
  title: string;
  message: string;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  postId?: number;
  conversationId?: number;
  taskAssignmentId?: number;
  paymentId?: number;
  actorUserId?: number;
}

// Auth API
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await toApiError(response, 'Registration failed');
    }

    return response.json();
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await toApiError(response, 'Login failed');
    }

    return response.json();
  },

  me: async (): Promise<User> => {
    const response = await fetchWithAuth('/auth/me');
    return response.json();
  },
};

// Users API
export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await fetchWithAuth('/users/me');
    return response.json();
  },

  getUser: async (id: number): Promise<User> => {
    const response = await fetchWithAuth(`/users/${id}`);
    return response.json();
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search users');
    }

    return response.json();
  },
};

// Friends API
export const friendsApi = {
  getFriendsList: async (): Promise<User[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/friends/list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get friends list');
    }

    return response.json();
  },

  sendFriendRequest: async (toUserId: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const payload = { toUserId: toUserId };
    const stringifiedPayload = JSON.stringify(payload);

    const response = await fetch(`${API_BASE_URL}/friends/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: stringifiedPayload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Friend request failed:', errorText);
      throw new Error('Failed to send friend request');
    }
  },

  acceptFriendRequest: async (requestId: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/friends/requests/${requestId}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to accept friend request');
    }
  },

  declineFriendRequest: async (requestId: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/friends/requests/${requestId}/decline`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to decline friend request');
    }
  },

  getIncomingRequests: async (): Promise<FriendRequest[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/friends/requests/incoming`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get friend requests');
    }

    return await response.json();
  },

  getOutgoingRequests: async (): Promise<FriendRequest[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/friends/requests/outgoing`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get friend requests');
    }

    return await response.json();
  },

  getFriends: async (): Promise<number[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/friends`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get friends');
    }

    return response.json();
  },

  removeFriend: async (friendId: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove friend');
    }
  },
};

// Posts API
export const postsApi = {
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message ||
        errorData?.error ||
        `Failed to create post (HTTP ${response.status})`;
      throw new Error(message);
    }

    return response.json();
  },

  getPost: async (id: number): Promise<Post> => {
    const response = await fetchWithAuth(`/posts/${id}`);
    return response.json();
  },

  updatePost: async (id: number, data: Partial<CreatePostRequest>): Promise<Post> => {
    const response = await fetchWithAuth(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getFeed: async (params?: {
    type?: 'REQUEST' | 'OFFER';
    category?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ content: Post[]; totalElements: number; totalPages: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const url = `/posts/feed${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetchWithAuth(url);
    return response.json();
  },

  getUserPosts: async (userId?: number): Promise<Post[]> => {
    if (userId) {
      const response = await fetchWithAuth(`/posts/user/${userId}`);
      return response.json();
    } else {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/posts/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user posts');
      }

      return response.json();
    }
  },

  getAcceptedPosts: async (): Promise<Post[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/posts/accepted`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get accepted posts');
    }

    return response.json();
  },
};

// Tasks API
export const tasksApi = {
  acceptPost: async (postId: number): Promise<TaskAssignment> => {
    const response = await fetchWithAuth(`/tasks/posts/${postId}/accept`, {
      method: 'POST',
    });
    return response.json();
  },

  markInProgress: async (taskId: number): Promise<TaskAssignment> => {
    const response = await fetchWithAuth(`/tasks/${taskId}/in-progress`, {
      method: 'PUT',
    });
    return response.json();
  },

  markComplete: async (taskId: number): Promise<TaskAssignment> => {
    const response = await fetchWithAuth(`/tasks/${taskId}/complete`, {
      method: 'PUT',
    });
    return response.json();
  },
};

// Payments API
export const paymentsApi = {
  createPayment: async (data: {
    postId: number;
    payeeId: number;
    amount: number;
    stripePaymentIntentId?: string;
  }): Promise<Payment> => {
    const response = await fetchWithAuth('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updatePaymentStatus: async (paymentId: number, data: {
    status: string;
    errorMessage?: string;
  }): Promise<Payment> => {
    const response = await fetchWithAuth(`/payments/${paymentId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getPaymentByTask: async (taskAssignmentId: number): Promise<Payment> => {
    const response = await fetchWithAuth(`/payments/by-task/${taskAssignmentId}`);
    return response.json();
  },
};

// Stripe Connect (payouts) API — for users to onboard so they can receive money.
export interface PayoutStatus {
  hasAccount: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue?: string[];
  disabledReason?: string | null;
}

export const stripeConnectApi = {
  // Returns a one-time Stripe-hosted onboarding URL. Backend creates the
  // Express account on first call and reuses it after.
  createOnboardingLink: async (): Promise<{ url: string }> => {
    const response = await fetchWithAuth('/payouts/onboarding-link', {
      method: 'POST',
    });
    return response.json();
  },

  // Returns the current user's payout status. Frontend polls this after
  // the user comes back from Stripe to know when payouts are enabled.
  getStatus: async (): Promise<PayoutStatus> => {
    const response = await fetchWithAuth('/payouts/status');
    return response.json();
  },

  // Returns a one-time login link to the Express dashboard so users can
  // see their payout history, update their bank, etc.
  createDashboardLink: async (): Promise<{ url: string }> => {
    const response = await fetchWithAuth('/payouts/dashboard-link', {
      method: 'POST',
    });
    return response.json();
  },
};

// Reviews API
export const reviewsApi = {
  createReview: async (data: {
    taskAssignmentId: number;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await fetchWithAuth('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getReviewByTask: async (taskAssignmentId: number): Promise<Review> => {
    const response = await fetchWithAuth(`/reviews/by-task/${taskAssignmentId}`);
    return response.json();
  },
};

// Messaging API
export const messagingApi = {
  createConversation: async (data: {
    type: 'DIRECT' | 'TASK_THREAD';
    taskAssignmentId?: number;
    participantIds: number[];
  }): Promise<Conversation> => {
    const response = await fetchWithAuth('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getOrCreateConversation: async (data: {
    type: 'DIRECT' | 'TASK_THREAD';
    taskAssignmentId?: number;
    participantIds: number[];
  }): Promise<Conversation> => {
    const response = await fetchWithAuth('/conversations/get-or-create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await fetchWithAuth('/conversations');
    return response.json();
  },

  getMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await fetchWithAuth(`/conversations/${conversationId}/messages`);
    return response.json();
  },

  sendMessage: async (data: {
    conversationId: number;
    body: string;
  }): Promise<Message> => {
    const response = await fetchWithAuth('/conversations/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await fetchWithAuth('/notifications');
    return response.json();
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await fetchWithAuth(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },
};

// Health API
export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};