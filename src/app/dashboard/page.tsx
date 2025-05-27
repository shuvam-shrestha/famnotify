
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFamilyData } from '@/context/FamilyDataContext';
import type { NotificationItem, Snapshot } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Camera, ListChecks, Eye, CheckCircle2 } from 'lucide-react';
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
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { notifications, markAsRead } = useFamilyData();
  const router = useRouter();

  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading dashboard...</p></div>;
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
        return <p>{notification.payload as string}</p>;
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
              data-ai-hint={snapshot.dataAiHint || "visitor photo"} // Updated hint
            />
            {snapshot.caption && <p className="text-sm text-muted-foreground"><em>{snapshot.caption}</em></p>}
          </div>
        );
      case 'cooking_list':
        const items = notification.payload as string[];
        return (
          <ul className="list-disc pl-5 space-y-1">
            {items.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        );
      default:
        return <p>Unknown notification type.</p>;
    }
  };
  
  const NotificationCard = ({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: NotificationItem[] }) => (
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><Icon className="mr-2 h-6 w-6 text-accent" /> {title}</CardTitle>
        <CardDescription>Latest {title.toLowerCase()} from visitors.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {items.length === 0 ? (
          <p className="text-muted-foreground flex items-center justify-center h-full">No {title.toLowerCase()} yet.</p>
        ) : (
          <ScrollArea className="h-64">
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
      <h1 className="text-3xl font-bold text-primary">Family Dashboard</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NotificationCard title="Doorbell Alerts" icon={Bell} items={doorbellAlerts} />
        <NotificationCard title="Snapshots" icon={Camera} items={snapshotAlerts} />
        <NotificationCard title="Cooking Wishlists" icon={ListChecks} items={cookingLists} />
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
            <div className="max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
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

