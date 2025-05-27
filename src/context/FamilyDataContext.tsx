
"use client";

import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { NotificationItem, Snapshot } from '@/types';
import { db } from '@/lib/firebase';
import { ref, push, set, onValue, update, query, orderByChild, limitToLast } from 'firebase/database';

interface FamilyDataContextType {
  notifications: NotificationItem[];
  addDoorbellAlert: () => void;
  addSnapshotAlert: (snapshot: Snapshot) => void; // Snapshots remain local for now
  addCookingList: (items: string[]) => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
  isLoadingNotifications: boolean;
}

const FamilyDataContext = createContext<FamilyDataContextType | undefined>(undefined);

export const FamilyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [snapshotNotifications, setSnapshotNotifications] = useState<NotificationItem[]>([]); // Local state for snapshots
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // Effect to fetch and listen for real-time updates from Firebase
  useEffect(() => {
    setIsLoadingNotifications(true);
    const notificationsRef = ref(db, 'notifications');
    // Query to get latest 50 notifications, ordered by timestamp. Adjust limit as needed.
    const notificationsQuery = query(notificationsRef, orderByChild('timestamp'), limitToLast(50));


    const unsubscribe = onValue(notificationsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseNotifications: NotificationItem[] = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort newest first
        
        setNotifications(firebaseNotifications);
      } else {
        setNotifications([]); // No notifications found
      }
      setIsLoadingNotifications(false);
    }, (error) => {
      console.error("Firebase read failed: ", error);
      setIsLoadingNotifications(false);
      // Potentially show a toast to the user here
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const addNotificationToFirebase = useCallback(async (type: 'doorbell' | 'cooking_list', payload: string | string[]) => {
    try {
      const notificationsRef = ref(db, 'notifications');
      const newNotificationRef = push(notificationsRef); // Firebase generates a unique ID
      
      const newNotificationData = {
        type,
        payload,
        timestamp: new Date().toISOString(), // Store as ISO string
        read: false,
      };
      
      await set(newNotificationRef, newNotificationData);
      // No need to manually add to local state, Firebase listener will pick it up
      console.log("Notification added to Firebase:", newNotificationRef.key, newNotificationData);
    } catch (error) {
      console.error("Error adding notification to Firebase:", error);
      // Potentially show a toast to the user
    }
  }, []);

  const addDoorbellAlert = useCallback(() => {
    addNotificationToFirebase('doorbell', 'Someone is at the door!');
  }, [addNotificationToFirebase]);

  // Snapshots remain local for now
   const addSnapshotAlert = useCallback((snapshot: Snapshot) => {
    const newSnapshotNotification: NotificationItem = {
      id: Date.now().toString(), // Local ID for local state item
      type: 'snapshot',
      payload: snapshot,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setSnapshotNotifications(prev => [newSnapshotNotification, ...prev]);
    console.log("Adding local snapshot notification:", newSnapshotNotification);
  }, []);


  const addCookingList = useCallback((items: string[]) => {
    addNotificationToFirebase('cooking_list', items);
  }, [addNotificationToFirebase]);
  
  const markAsRead = useCallback(async (id: string) => {
    // Check if it's a snapshot notification (local) or Firebase notification
    const isSnapshot = snapshotNotifications.some(n => n.id === id);
    if (isSnapshot) {
      setSnapshotNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } else {
      try {
        const notificationRef = ref(db, `notifications/${id}`);
        await update(notificationRef, { read: true });
        // Local state will update via the onValue listener
      } catch (error) {
        console.error("Error marking notification as read in Firebase:", error);
        // Potentially show a toast to the user
      }
    }
  }, [snapshotNotifications]);

  const combinedNotifications = useCallback(() => {
    return [...notifications, ...snapshotNotifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, snapshotNotifications]);


  const getUnreadCount = useCallback(() => {
    return combinedNotifications().filter(n => !n.read).length;
  }, [combinedNotifications]);


  return (
    <FamilyDataContext.Provider value={{ 
        notifications: combinedNotifications(), 
        addDoorbellAlert, 
        addSnapshotAlert, 
        addCookingList, 
        markAsRead, 
        getUnreadCount,
        isLoadingNotifications 
      }}>
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
