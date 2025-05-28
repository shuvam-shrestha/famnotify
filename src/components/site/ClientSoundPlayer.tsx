
"use client";

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ClientSoundPlayerProps {
  playSound: boolean;
  onSoundPlayed: () => void;
  soundSrc?: string;
}

const defaultSoundSrc = "/sounds/Sound Effect - Doorbell.mp3";

export function ClientSoundPlayer({
  playSound,
  onSoundPlayed,
  soundSrc = defaultSoundSrc,
}: ClientSoundPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const hasAttemptedPlayRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const canPlayHandler = () => {
      if (audioRef.current && playSound && hasAttemptedPlayRef.current) {
        audioRef.current.play()
          .then(() => {
            // console.log("Sound played successfully");
          })
          .catch(playError => {
            console.error("Error playing sound:", playError);
            toast({
              title: "Sound Playback Error",
              description: `Could not play sound: ${playError.message}`,
              variant: "destructive",
            });
          })
          .finally(() => {
            onSoundPlayed(); // Reset trigger in parent
            hasAttemptedPlayRef.current = false; // Reset attempt flag
          });
      }
    };

    const errorHandler = (event: Event) => {
      const mediaError = (event.currentTarget as HTMLAudioElement)?.error;
      const errorMessage = mediaError ? `Code ${mediaError.code}: ${mediaError.message}` : "Unknown audio error.";
      console.error("Error loading sound:", errorMessage, event);
      toast({
        title: "Sound Loading Error",
        description: `Could not load sound file from ${soundSrc}. ${errorMessage}`,
        variant: "destructive",
      });
      onSoundPlayed(); // Reset trigger if loading fails
      hasAttemptedPlayRef.current = false; // Reset attempt flag
    };

    if (playSound && !hasAttemptedPlayRef.current && audio) {
      hasAttemptedPlayRef.current = true; // Mark that we are attempting to play for this trigger
      if (!soundSrc) {
        console.error("ClientSoundPlayer: soundSrc is missing.");
        toast({ title: "Sound Error", description: "Sound file path is not configured.", variant: "destructive" });
        onSoundPlayed();
        hasAttemptedPlayRef.current = false;
        return;
      }

      // Ensure src is set and load is called if src changes or is not set
      const fullSoundSrc = new URL(soundSrc, window.location.origin).toString();
      if (audio.src !== fullSoundSrc) {
        audio.src = soundSrc; // Relative path is fine here
        audio.load();
      } else if (audio.readyState === 0 && soundSrc) { // If src is same but not loaded
        audio.load();
      }


      audio.addEventListener('canplaythrough', canPlayHandler, { once: true });
      audio.addEventListener('error', errorHandler, { once: true });
      
      // If audio is already loaded enough, try to play directly
      if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
         // Wrap in a microtask to ensure event listeners are attached
        Promise.resolve().then(canPlayHandler);
      }

    } else if (!playSound && hasAttemptedPlayRef.current) {
      // If playSound becomes false while we were attempting, reset the flag.
      // This could happen if onSoundPlayed is called by an error handler before canPlayHandler.
      hasAttemptedPlayRef.current = false;
    }

    return () => {
      if (audio) {
        audio.removeEventListener('canplaythrough', canPlayHandler);
        audio.removeEventListener('error', errorHandler);
        // No need to pause or reset src if we intend to reuse the Audio object.
        // The onSoundPlayed callback handles resetting the trigger.
      }
    };
  }, [playSound, soundSrc, onSoundPlayed, toast]);

  return null;
}
