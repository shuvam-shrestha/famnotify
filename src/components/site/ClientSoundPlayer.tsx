"use client";

import { useEffect, useRef } from 'react';

interface ClientSoundPlayerProps {
  playSound: boolean;
  onSoundPlayed: () => void;
  soundSrc?: string; // Optional: allows specifying a sound file, defaults to a placeholder
}

// IMPORTANT: User needs to place an actual sound file (e.g., alert.mp3) in the /public folder
// and potentially update the defaultSoundSrc if they name it differently.
const defaultSoundSrc = "/sounds/alert.mp3"; 

export function ClientSoundPlayer({ playSound, onSoundPlayed, soundSrc = defaultSoundSrc }: ClientSoundPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
        audioRef.current = new Audio(soundSrc);
    }
  }, [soundSrc]);

  useEffect(() => {
    if (playSound && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          // console.log("Sound played");
        })
        .catch(error => console.error("Error playing sound:", error))
        .finally(() => {
          onSoundPlayed(); // Notify parent that sound has attempted to play
        });
    }
  }, [playSound, onSoundPlayed]);

  return null; // This component does not render anything
}

// Create a placeholder sound file if it doesn't exist, so the build doesn't break.
// This is a developer note: actual sound file needs to be added by the user.
// To create a dummy file for development, you can run:
// mkdir -p public/sounds && touch public/sounds/alert.mp3
