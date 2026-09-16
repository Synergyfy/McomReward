export interface Notification {
  id: string;
  title?: string;
  message: string;
  type?: 'approval' | 'announcement' | 'flag' | 'new_user' | 'info' | string;
  isRead: boolean;
  is_read?: boolean;
  createdAt: string;
  created_at?: string;
}

export interface GetNotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
}
