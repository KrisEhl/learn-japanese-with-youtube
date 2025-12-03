"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type YouTubePlayerProps = {
  videoId: string;
};

export function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Load YouTube API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true);
    };
  }, []);

  // Create player when API is ready
  useEffect(() => {
    if (!apiLoaded || !containerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          console.log("Player ready");
        },
        onStateChange: (event: any) => {
          console.log("Player state:", event.data);
        },
      },
    });
  }, [apiLoaded, videoId]);

  return (
    <div className="w-full max-w-3xl aspect-video">
      <div ref={containerRef} />
    </div>
  );
}