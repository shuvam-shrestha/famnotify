
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useFamilyData } from '@/context/FamilyDataContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Camera, Send, ListPlus, Video, VideoOff } from 'lucide-react';
import type { Snapshot } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { addDoorbellAlert, addSnapshotAlert, addCookingList } = useFamilyData();
  const { toast } = useToast();
  
  const [cookingItems, setCookingItems] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [snapshotCaption, setSnapshotCaption] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);


  const handleNotifyMembers = () => {
    addDoorbellAlert();
    // Sound player removed, no sound to play
    toast({ title: "Family Notified!", description: "Your presence has been announced." });
  };

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play failed:", e));
          };
        }
        setIsCameraOn(true);
        setHasCameraPermission(true);
        setSnapshotDataUrl(null); // Reset previous snapshot if camera is started
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({ title: "Camera Error", description: "Could not access the camera. Please check permissions.", variant: "destructive" });
        setIsCameraOn(false);
        setHasCameraPermission(false);
      }
    } else {
      toast({ title: "Camera Not Supported", description: "Your browser doesn't support camera access.", variant: "destructive" });
      setHasCameraPermission(false);
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

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const captureAndSetSnapshot = useCallback(() => {
    if (videoRef.current && canvasRef.current && isCameraOn && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const trackSettings = stream.getVideoTracks()[0]?.getSettings();
      canvas.width = trackSettings?.width || video.videoWidth || 640;
      canvas.height = trackSettings?.height || video.videoHeight || 480;

      const context = canvas.getContext('2d');
      if (context) {
        if (trackSettings?.facingMode === "user") {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (trackSettings?.facingMode === "user") {
          context.setTransform(1, 0, 0, 1, 0, 0); 
        }

        const dataUrl = canvas.toDataURL('image/png');
        setSnapshotDataUrl(dataUrl);
        toast({ title: "Snapshot Taken!", description: "Add a caption and send it." });
      }
    } else {
      const placeholderUrl = "https://placehold.co/600x400.png";
      setSnapshotDataUrl(placeholderUrl);
      toast({ title: "Using Placeholder Snapshot", description: "Camera was not active or available. A placeholder image is ready." });
    }
  }, [isCameraOn, stream, toast]);

  const handleSendSnapshot = () => {
    if (snapshotDataUrl) {
      const isPlaceholder = snapshotDataUrl.startsWith("https://placehold.co");
      const snapshot: Snapshot = { 
        imageUrl: snapshotDataUrl, 
        caption: snapshotCaption,
        dataAiHint: isPlaceholder ? "person portrait" : "visitor selfie"
      };
      addSnapshotAlert(snapshot);
      toast({ title: "Snapshot Sent!", description: "Your photo has been sent to the family." });
      setSnapshotDataUrl(null);
      setSnapshotCaption('');
      if (isCameraOn) stopCamera(); 
    } else {
      toast({ title: "No Snapshot", description: "Please take or generate a snapshot first.", variant: "destructive" });
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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);


  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 px-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Welcome to Family Hub!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your central place to connect, share, and stay in touch with your loved ones.
          Let them know you're here, leave a visual message, or share your dinner wishes.
        </p>
        <div className="flex justify-center">
          <Image 
            src="https://placehold.co/800x400.png" 
            alt="Family connection illustration" 
            width={800} 
            height={400} 
            className="rounded-lg shadow-xl border object-cover w-full max-w-3xl h-auto"
            data-ai-hint="family connection"
            priority 
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <h2 className="text-3xl font-semibold text-center text-primary px-4">What would you like to do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start px-4">
          {/* Card 1: Notify Family (Doorbell) */}
          <Card className="shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl"><Bell className="mr-3 h-7 w-7 text-accent" /> Notify Family</CardTitle>
              <CardDescription>Let your family know you've arrived.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleNotifyMembers} className="w-full bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground text-lg py-6 rounded-md">
                <Bell className="mr-2 h-5 w-5" /> Ring Doorbell
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Leave a Snapshot (Camera) */}
          <Card className="shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl"><Camera className="mr-3 h-7 w-7 text-accent" /> Leave a Snapshot</CardTitle>
              <CardDescription>Send a quick photo message.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative flex justify-center items-center rounded-md border bg-muted w-full aspect-[4/3] overflow-hidden">
                {/* Video Stream - always in DOM, conditionally visible */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "w-full h-full object-cover transform scale-x-[-1]", // Base styles for video element
                    { 'opacity-100': isCameraOn, 'opacity-0 pointer-events-none': !isCameraOn } // Visibility logic
                  )}
                />

                {/* Snapshot Image (shown if camera is off AND snapshot exists) */}
                {!isCameraOn && snapshotDataUrl && (
                  <Image
                    src={snapshotDataUrl}
                    alt="Snapshot preview"
                    layout="fill" 
                    objectFit="cover"
                    className="absolute inset-0 w-full h-full" // Overlay
                    data-ai-hint={snapshotDataUrl.startsWith("https://placehold.co") ? "person portrait" : "visitor selfie"}
                  />
                )}

                {/* Placeholder (shown if camera is off AND no snapshot exists) */}
                {!isCameraOn && !snapshotDataUrl && (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center bg-muted">
                    <Camera size={48} className="mb-2 text-gray-400" />
                    <span>
                      {hasCameraPermission === false
                        ? "Camera access denied. Check browser settings."
                        : "Camera is off. Start camera to take a snapshot."}
                    </span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {hasCameraPermission === false && (
                 <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                      Please enable camera permissions in your browser settings to use this feature.
                    </AlertDescription>
                  </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={toggleCamera} variant="outline" className="flex-1 rounded-md">
                  {isCameraOn ? <VideoOff className="mr-2" /> : <Video className="mr-2" />}
                  {isCameraOn ? "Stop Camera" : "Start Camera"}
                </Button>
                <Button onClick={captureAndSetSnapshot} className="flex-1 rounded-md">
                  <Camera className="mr-2" /> Take Snapshot
                </Button>
              </div>

              {snapshotDataUrl && (
                <div className="space-y-3 pt-2">
                  <Textarea 
                    placeholder="Add a caption (optional)" 
                    value={snapshotCaption}
                    onChange={(e) => setSnapshotCaption(e.target.value)}
                    className="bg-input rounded-md"
                  />
                  <Button onClick={handleSendSnapshot} className="w-full bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground rounded-md">
                    <Send className="mr-2" /> Send Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Cooking Requests (List) */}
          <Card className="shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl"><ListPlus className="mr-3 h-7 w-7 text-accent" /> Cooking Requests</CardTitle>
              <CardDescription>What are you in the mood for?</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitCookingList}>
              <CardContent>
                <Textarea 
                  placeholder="E.g., Spaghetti Bolognese&#10;Caesar Salad&#10;Garlic Bread" 
                  rows={5} 
                  value={cookingItems}
                  onChange={(e) => setCookingItems(e.target.value)}
                  className="bg-input rounded-md"
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground text-lg py-6 rounded-md">
                  <ListPlus className="mr-2 h-5 w-5" /> Submit Wishlist
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
