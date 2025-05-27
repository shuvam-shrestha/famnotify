"use client";

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useFamilyData } from '@/context/FamilyDataContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Camera, Send, ListPlus, Video, VideoOff } from 'lucide-react';
import { ClientSoundPlayer } from '@/components/site/ClientSoundPlayer';
import type { Snapshot } from '@/types';

export default function VisitorPage() {
  const { addDoorbellAlert, addSnapshotAlert, addCookingList } = useFamilyData();
  const { toast } = useToast();
  const [playDoorbellSound, setPlayDoorbellSound] = useState(false);
  
  const [cookingItems, setCookingItems] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [snapshotCaption, setSnapshotCaption] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleNotifyMembers = () => {
    addDoorbellAlert();
    setPlayDoorbellSound(true);
    toast({ title: "Family Notified!", description: "Your presence has been announced." });
  };

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setIsCameraOn(true);
          setSnapshotDataUrl(null); // Reset previous snapshot
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({ title: "Camera Error", description: "Could not access the camera.", variant: "destructive" });
        setIsCameraOn(false);
      }
    } else {
      toast({ title: "Camera Not Supported", description: "Your browser doesn't support camera access.", variant: "destructive" });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, [stream]);

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraOn) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setSnapshotDataUrl(dataUrl);
        stopCamera(); // Turn off camera after taking photo
        toast({ title: "Snapshot Taken!", description: "You can add a caption and send it." });
      }
    } else {
       // Fallback if camera didn't work or not on: use a placeholder
      setSnapshotDataUrl("https://placehold.co/300x200.png");
      toast({ title: "Using Placeholder", description: "Camera not active, using a placeholder image." });
    }
  };

  const handleSendSnapshot = () => {
    if (snapshotDataUrl) {
      const snapshot: Snapshot = { 
        imageUrl: snapshotDataUrl, 
        caption: snapshotCaption,
        dataAiHint: "person portrait" // AI hint for placeholder if needed
      };
      addSnapshotAlert(snapshot);
      toast({ title: "Snapshot Sent!", description: "Your photo has been sent to the family." });
      setSnapshotDataUrl(null);
      setSnapshotCaption('');
    } else {
      toast({ title: "No Snapshot", description: "Please take a photo first.", variant: "destructive" });
    }
  };

  const handleSubmitCookingList = (e: React.FormEvent) => {
    e.preventDefault();
    if (cookingItems.trim() === '') {
      toast({ title: "Empty List", description: "Please enter some items.", variant: "destructive" });
      return;
    }
    const itemsArray = cookingItems.split('\n').map(item => item.trim()).filter(item => item !== '');
    addCookingList(itemsArray);
    toast({ title: "Cooking List Submitted!", description: "Your requests have been noted." });
    setCookingItems('');
  };

  return (
    <div className="space-y-8">
      <ClientSoundPlayer playSound={playDoorbellSound} onSoundPlayed={() => setPlayDoorbellSound(false)} />
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 text-accent" /> Notify Family</CardTitle>
          <CardDescription>Let your family know you're here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleNotifyMembers} className="w-full bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground">
            <Bell className="mr-2" /> Notify Members
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Camera className="mr-2 text-accent" /> Leave a Snapshot</CardTitle>
          <CardDescription>Take a photo to send to the family.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            {isCameraOn ? (
              <video ref={videoRef} autoPlay playsInline className="rounded-md border bg-muted w-full max-w-sm h-auto aspect-video object-cover" />
            ) : snapshotDataUrl ? (
              <Image src={snapshotDataUrl} alt="Snapshot preview" width={300} height={200} className="rounded-md border" data-ai-hint="person portrait" />
            ) : (
              <div className="w-full max-w-sm h-48 bg-muted rounded-md flex items-center justify-center text-muted-foreground border">
                Camera is off or no snapshot taken.
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="flex gap-2 justify-center">
            {!isCameraOn ? (
              <Button onClick={startCamera} variant="outline">
                <Video className="mr-2" /> Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline">
                <VideoOff className="mr-2" /> Stop Camera
              </Button>
            )}
            <Button onClick={handleTakePhoto} disabled={!isCameraOn && !snapshotDataUrl && !process.env.NODE_ENV}> {/* Allow placeholder in dev */}
              <Camera className="mr-2" /> {snapshotDataUrl ? "Retake Photo" : "Take Photo"}
            </Button>
          </div>

          {snapshotDataUrl && (
            <div className="space-y-2">
              <Textarea 
                placeholder="Add a caption (optional)" 
                value={snapshotCaption}
                onChange={(e) => setSnapshotCaption(e.target.value)}
                className="bg-input"
              />
              <Button onClick={handleSendSnapshot} className="w-full bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground">
                <Send className="mr-2" /> Send Photo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ListPlus className="mr-2 text-accent" /> Cooking Requests</CardTitle>
          <CardDescription>Let the family know what you'd like for dinner.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitCookingList}>
          <CardContent>
            <Textarea 
              placeholder="Enter items to cook, one per line... (e.g., Pasta, Salad, Garlic Bread)" 
              rows={4} 
              value={cookingItems}
              onChange={(e) => setCookingItems(e.target.value)}
              className="bg-input"
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground">
              <ListPlus className="mr-2" /> Submit List
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
