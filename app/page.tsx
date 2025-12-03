"use client";

import { useState } from "react";
import { YouTubePlayer } from "../components/YouTubePlayer";

type TranscriptItem = {
  text: string;
  start: number;
  duration: number;
};

type AlignedSubtitleLine = {
  start: number;
  jaText: string;
  enText: string | null;
};

function extractYouTubeId(input: string): string | null {
  try {
    if (!input.includes("http") && !input.includes("www.") && !input.includes("/")) {
      return input.trim();
    }

    const url = new URL(input.trim());

    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1);
    }

    if (url.searchParams.has("v")) {
      return url.searchParams.get("v");
    }

    const parts = url.pathname.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return input.trim() || null;
  }
}

function alignTranscripts(
  ja: TranscriptItem[] | null,
  en: TranscriptItem[] | null,
): AlignedSubtitleLine[] {
  if (!ja || ja.length === 0) return [];

  if (!en || en.length === 0) {
    // Only Japanese available
    return ja.map((item) => ({
      start: item.start,
      jaText: item.text,
      enText: null,
    }));
  }

  const lines: AlignedSubtitleLine[] = [];

  for (const jaItem of ja) {
    let best: TranscriptItem | null = null;
    let bestDelta = Infinity;

    for (const enItem of en) {
      const delta = Math.abs(enItem.start - jaItem.start);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = enItem;
      }
    }

    // If English line is too far in time, ignore it
    const matchedEn = bestDelta <= 2 ? best : null;

    lines.push({
      start: jaItem.start,
      jaText: jaItem.text,
      enText: matchedEn ? matchedEn.text : null,
    });
  }

  return lines;
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<AlignedSubtitleLine[]>([]);

  async function loadCaptions(id: string) {
    try {
      setLoadingSubs(true);
      setSubsError(null);
      setSubtitles([]);

      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.error ||
          "Could not load captions for this video.";
        setSubsError(msg);
        return;
      }

      const ja = (data.ja ?? null) as TranscriptItem[] | null;
      const en = (data.en ?? null) as TranscriptItem[] | null;

      const aligned = alignTranscripts(ja, en);

      if (aligned.length === 0) {
        setSubsError("No Japanese subtitles available for this video.");
      } else {
        setSubtitles(aligned);
      }
    } catch (e) {
      console.error(e);
      setSubsError("Unexpected error while loading captions.");
    } finally {
      setLoadingSubs(false);
    }
  }

  async function handleLoad() {
    const id = extractYouTubeId(input);
    if (!id) {
      setError("Could not extract a YouTube video ID from your input.");
      setVideoId(null);
      setSubtitles([]);
      setSubsError(null);
      return;
    }
    setError(null);
    setVideoId(id);
    await loadCaptions(id);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Learn Japanese with YouTube</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Paste a YouTube URL or video ID to start.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
          onClick={handleLoad}
        >
          {loadingSubs ? "Loading..." : "Load"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="mt-6">
        {videoId && (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Video ID: <code>{videoId}</code>
            </p>
            <YouTubePlayer videoId={videoId} />
          </>
        )}
      </div>

      {/* Subtitle section */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4">
        <h2 className="text-lg font-semibold mb-2">Subtitles</h2>

        {subsError && (
          <p className="text-sm text-red-500 mb-2">
            {subsError}
          </p>
        )}

        {loadingSubs && (
          <p className="text-sm text-gray-500">Loading subtitles…</p>
        )}

        {!loadingSubs && !subsError && subtitles.length === 0 && videoId && (
          <p className="text-sm text-gray-500">
            No subtitles loaded yet.
          </p>
        )}

        {!loadingSubs && subtitles.length > 0 && (
          <div className="mt-2 space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {subtitles.map((line, idx) => (
              <div
                key={`${line.start}-${idx}`}
                className="text-sm border border-gray-200 dark:border-gray-800 rounded px-3 py-2"
              >
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  {formatTime(line.start)}
                </div>
                <div className="text-base">
                  {line.jaText}
                </div>
                {line.enText && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {line.enText}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}