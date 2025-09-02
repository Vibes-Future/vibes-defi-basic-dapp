'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Notification types and interfaces
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Component
const NotificationItem = ({ 
  notification, 
  onRemove 
}: { 
  notification: Notification;
  onRemove: (id: string) => void;
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    const baseStyles = 'notification-item';
    
    switch (type) {
      case 'success':
        return `${baseStyles} notification-success`;
      case 'error':
        return `${baseStyles} notification-error`;
      case 'warning':
        return `${baseStyles} notification-warning`;
      case 'info':
        return `${baseStyles} notification-info`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className={getNotificationStyles(notification.type)}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification-title">
            {notification.title}
          </div>
          <button 
            className="notification-close"
            onClick={() => onRemove(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <div className="notification-message">
          {notification.message}
        </div>
        <div className="notification-timestamp">
          {notification.timestamp.toLocaleTimeString()}
        </div>
      </div>
      <div className="notification-progress"></div>
    </div>
  );
};

// Notification Container
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>,
    document.body
  );
};

// Provider Component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date();
    const duration = notificationData.duration || 5000;

    const notification: Notification = {
      ...notificationData,
      id,
      timestamp,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Utility function for easy notification creation
export const showNotification = {
  success: (title: string, message: string, duration?: number) => ({
    type: 'success' as const,
    title,
    message,
    duration,
  }),
  error: (title: string, message: string, duration?: number) => ({
    type: 'error' as const,
    title,
    message,
    duration,
  }),
  warning: (title: string, message: string, duration?: number) => ({
    type: 'warning' as const,
    title,
    message,
    duration,
  }),
  info: (title: string, message: string, duration?: number) => ({
    type: 'info' as const,
    title,
    message,
    duration,
  }),
};
