from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)

app = FastAPI()

# Allow your Next.js dev server to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/captions/{video_id}")
def get_captions(video_id: str):
    """
    Returns JA and EN transcripts if available.

    Response shape:
    {
      "ja": [ { "text": "...", "start": 1.23, "duration": 2.0 }, ... ] | null,
      "en": [ ... ] | null
    }
    """
    langs = ["ja", "en"]
    result: dict[str, list[dict] | None] = {"ja": None, "en": None}

    for lang in langs:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
            result[lang] = transcript
        except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
            result[lang] = None
        except Exception as e:
            print(f"Error fetching transcript for {video_id} lang={lang}: {e}")
            result[lang] = None

    if result["ja"] is None and result["en"] is None:
        raise HTTPException(
            status_code=404,
            detail="No JA or EN transcripts available for this video",
        )

    return result
