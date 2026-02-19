

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response;
};

// Types based on API documentation
export interface User {
  id: number;
  email: string;
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
  post: Post;
  payer: User;
  payee: User;
  amount: number;
  status: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface Review {
  id: number;
  taskAssignment: TaskAssignment;
  reviewer: User;
  reviewee: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  type: 'DIRECT' | 'TASK_THREAD';
  taskAssignment?: TaskAssignment;
  participants: User[];
  createdAt: string;
}

export interface Message {
  id: number;
  conversation: Conversation;
  sender: User;
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
  createdAt: string;
}

// Auth API
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message);
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
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message);
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
    console.log("API:");
    const response = await fetch(`${API_BASE_URL}/friends/list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log("apiiiii:", response);

    if (!response.ok) {
        console.log("apiiiii:", response);
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
      throw new Error('Failed to create post');
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