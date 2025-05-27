"use client";

import type React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { NotificationItem, Snapshot } from '@/types';

interface FamilyDataContextType {
  notifications: NotificationItem[];
  addDoorbellAlert: () => void;
  addSnapshotAlert: (snapshot: Snapshot) => void;
  addCookingList: (items: string[]) => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
}

const FamilyDataContext = createContext<FamilyDataContextType | undefined>(undefined);

export const FamilyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((type: NotificationItem['type'], payload: NotificationItem['payload']) => {
    setNotifications(prev => [
      { id: Date.now().toString(), type, payload, timestamp: new Date(), read: false },
      ...prev,
    ]);
  }, []);

  const addDoorbellAlert = useCallback(() => {
    addNotification('doorbell', 'Someone is at the door!');
  }, [addNotification]);

  const addSnapshotAlert = useCallback((snapshot: Snapshot) => {
    addNotification('snapshot', snapshot);
  }, [addNotification]);

  const addCookingList = useCallback((items: string[]) => {
    addNotification('cooking_list', items);
  }, [addNotification]);
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);


  return (
    <FamilyDataContext.Provider value={{ notifications, addDoorbellAlert, addSnapshotAlert, addCookingList, markAsRead, getUnreadCount }}>
      {children}
    </FamilyDataContext.Provider>
  );
};

export const useFamilyData = (): FamilyDataContextType => {
  const context = useContext(FamilyDataContext);
  if (context === undefined) {
    throw new Error('useFamilyData must be used within a FamilyDataProvider');
  }
  return context;
};
