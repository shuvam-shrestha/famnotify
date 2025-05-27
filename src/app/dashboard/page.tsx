
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFamilyData } from '@/context/FamilyDataContext';
import type { NotificationItem, Snapshot } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Camera, ListChecks, Eye, CheckCircle2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authIsLoading, logout } = useAuth();
  const { notifications, markAsRead, isLoadingNotifications } = useFamilyData();
  const router = useRouter();

  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authIsLoading, router]);

  if (authIsLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading dashboard...</p></div>;
  }

  const handleViewNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const doorbellAlerts = notifications.filter(n => n.type === 'doorbell').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const snapshotAlerts = notifications.filter(n => n.type === 'snapshot').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const cookingLists = notifications.filter(n => n.type === 'cooking_list').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const renderNotificationContent = (notification: NotificationItem) => {
    if (!notification) return null;
    switch (notification.type) {
      case 'doorbell':
        const message = notification.payload as string;
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">A visitor rang the doorbell with the following message:</p>
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="font-medium text-foreground">{message || "No specific message provided."}</p>
            </div>
          </div>
        );
      case 'snapshot':
        const snapshot = notification.payload as Snapshot;
        return (
          <div className="space-y-2">
            <Image 
              src={snapshot.imageUrl} 
              alt={snapshot.caption || "Snapshot"} 
              width={400} 
              height={300} 
              className="rounded-md border object-cover w-full aspect-[4/3]" 
              data-ai-hint={snapshot.dataAiHint || "visitor photo"}
            />
            {snapshot.caption && <p className="text-sm text-muted-foreground"><em>{snapshot.caption}</em></p>}
          </div>
        );
      case 'cooking_list':
        const items = notification.payload as string[];
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">A visitor submitted a cooking wishlist:</p>
            <ul className="list-disc pl-5 space-y-1 bg-muted/50 p-3 rounded-md">
              {items.map((item, index) => <li key={index} className="text-foreground">{item}</li>)}
            </ul>
          </div>
        );
      default:
        return <p>Unknown notification type.</p>;
    }
  };
  
  const NotificationCard = ({ title, icon: Icon, items, isLoading }: { title: string; icon: React.ElementType; items: NotificationItem[], isLoading?: boolean }) => (
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><Icon className="mr-2 h-6 w-6 text-accent" /> {title}</CardTitle>
        <CardDescription>Latest {title.toLowerCase()} from visitors.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading {title.toLowerCase()}...</p>
          </div>
        ) :items.length === 0 ? (
          <p className="text-muted-foreground flex items-center justify-center h-full">No {title.toLowerCase()} yet.</p>
        ) : (
          <ScrollArea className="h-auto max-h-[15rem] sm:max-h-[16rem] md:max-h-[18rem] lg:max-h-[20rem]">
            <ul className="space-y-3 pr-4">
              {items.map(item => (
                <li key={item.id} className={`p-3 rounded-md border ${item.read ? 'bg-muted/30' : 'bg-card hover:bg-muted/60 transition-colors'} flex justify-between items-center`}>
                  <div>
                    <span className="font-medium block text-sm">{item.type === 'doorbell' ? 'Doorbell Ring' : item.type === 'snapshot' ? 'New Snapshot' : 'Cooking List'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!item.read && <Badge variant="default" className="bg-accent text-accent-foreground text-xs">New</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => handleViewNotification(item)} className="text-xs">
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Family Dashboard</h1>
        {/* Optional: Add a manual refresh button if needed, though Firebase is real-time */}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NotificationCard title="Doorbell Alerts" icon={Bell} items={doorbellAlerts} isLoading={isLoadingNotifications && doorbellAlerts.length === 0} />
        <NotificationCard title="Snapshots" icon={Camera} items={snapshotAlerts} isLoading={false} /> {/* Snapshots are local */}
        <NotificationCard title="Cooking Wishlists" icon={ListChecks} items={cookingLists} isLoading={isLoadingNotifications && cookingLists.length === 0} />
      </div>

      {selectedNotification && (
        <AlertDialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <AlertDialogContent className="max-w-lg w-full">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                {selectedNotification.type === 'doorbell' && <Bell className="mr-2 h-5 w-5 text-accent" />}
                {selectedNotification.type === 'snapshot' && <Camera className="mr-2 h-5 w-5 text-accent" />}
                {selectedNotification.type === 'cooking_list' && <ListChecks className="mr-2 h-5 w-5 text-accent" />}
                Notification Details
              </AlertDialogTitle>
              <AlertDialogDescription>
                Received on: {new Date(selectedNotification.timestamp).toLocaleString()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Separator className="my-4" />
            <div className="max-h-[60vh] overflow-y-auto p-1">
             {renderNotificationContent(selectedNotification)}
            </div>
            <Separator className="my-4" />
            <AlertDialogFooter>
              <Button onClick={() => setSelectedNotification(null)} variant="default" className="bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground">
                <CheckCircle2 className="mr-2 h-4 w-4"/> Got it!
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
