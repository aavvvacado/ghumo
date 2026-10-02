---
layout: docs
title: "YouTube Vlog & Social Media Mining"
nav_order: 5
description: "Engineering deep-dive into YouTube vlog transcript extraction, timestamp POI matching, Instagram Reels mining, and Reddit sentiment analysis."
---

# YouTube Vlog & Social Media Mining

This document details the multi-modal video and social crawling subsystem (`app/services/youtube_service.py`, `app/services/social_mining.py`, and `app/services/reddit_service.py`), explaining how Ghumo converts uncurated video links and social discussions into structured, geocoded itineraries.

---

## 1. The Multi-Modal Video Ingestion Pipeline

Travel vlogging has replaced traditional guidebooks as the primary discovery medium for millennial and Gen-Z travelers. However, video content is inherently **linear and unstructured**: a viewer must scrub through a 30-minute vlog to discover place names, locations, and recommendations.

Ghumo ingests video URLs and executes automated transcript mining and entity geocoding:

```mermaid
flowchart TD
 URL["Travel Video URL\n(YouTube / Shorts / Instagram Reels / TikTok)"] --> Parser{"URL Demuxer & Metadata Parser"}
 
 Parser -- YouTube / Shorts --> YT["YouTube Service\n(Extract Video ID & Metadata)"]
 Parser -- Reels / TikTok --> SOC["Social Mining Service\nyt-dlp Metadata Extraction"]
 
 YT --> TCheck{Tier 1: Valkey Cache\nKey: 'yt_transcript:{video_id}'}
 TCheck -- Cache Hit (24h TTL) --> LLM
 TCheck -- Cache Miss --> PrimaryAPI["Primary: transcriptapi.com API\n(Timecoded Transcript Segments)"]
 
 PrimaryAPI -- Success --> CACHE["Cache Transcript in Valkey"] --> LLM
 PrimaryAPI -- Fail / No Captions --> SecondaryLib["Secondary: youtube_transcript_api\n(Proxy Rotated Extraction)"]
 SecondaryLib -- Success --> CACHE
 SecondaryLib -- No Captions --> DESC["Tertiary: Video Description &\nTitle NLP Entity Extraction"] --> LLM
 
 SOC --> DUCK["DuckDuckGo Fallback Context Search\n(When Social Platform Blocks API)"] --> LLM
 
 subgraph EntityMapping ["Landmark Resolution & Synthesis"]
 LLM["Google Gemini / Groq LLM\n- Extract Spoken Landmark Mentions\n- Map to Video Timestamps\n- Deduplicate Chronological Waypoints"]
 LLM --> GEO["Nominatim & OSM Overpass\nPhysical Coordinate Verification"]
 GEO --> ITIN["Structured Day-Wise Video Itinerary\n(Rendered on Dark Map with Timestamps)"]
 end
```

---

## 2. YouTube Transcript Mining Implementation (`youtube_service.py`)

### Video ID Regex Normalization
The service normalizes various YouTube link permutations into a clean 11-character video identifier:

```python
YOUTUBE_PATTERNS = [
 r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
 r"(?:youtu\.be\/)([0-9A-Za-z_-]{11})",
 r"(?:shorts\/)([0-9A-Za-z_-]{11})"
]

def extract_video_id(url: str) -> Optional[str]:
 for pattern in YOUTUBE_PATTERNS:
 match = re.search(pattern, url)
 if match:
 return match.group(1)
 return None
```

### Transcript Extraction Cascade
1. **Primary Provider (`transcriptapi.com`)**:
 - Transmits HTTP GET request with authorization token:
 `https://transcriptapi.com/api/v1/transcript?video_id={video_id}`
 - Returns structured timecoded segments:
 ```json
 [
 {"start": 12.4, "duration": 3.8, "text": "We just arrived at Chandni Chowk, heading straight to Paranthe Wali Gali."},
 {"start": 125.1, "duration": 4.2, "text": "Now look at this 200-year-old shop serving rabri paranthas..."}
 ]
 ```
2. **Secondary Provider (`youtube_transcript_api`)**:
 - Python library querying YouTube's internal caption tracks with language fallbacks (`en`, `hi`, `en-IN`, `auto`).
3. **24-Hour Valkey Caching**:
 - Extracted transcript payloads are stored with key `yt_transcript:{video_id}` and TTL of 86,400 seconds, eliminating redundant external API consumption.

---

## 3. Spoken Landmark Matching & Timestamp Alignment

Raw transcripts contain conversational filler, brand sponsorships, and casual chatter. Ghumo uses an extraction prompt to isolate physical landmarks, linking them to exact video timestamps:

```python
EXTRACTION_PROMPT = """
Analyze the following travel vlog transcript and extract all physical landmarks, 
restaurants, viewpoints, and street food stalls visited by the traveler.

Format your response as a JSON array of objects:
[
 {
 "landmark_name": "string",
 "timestamp_seconds": int,
 "timestamp_display": "MM:SS",
 "spoken_context": "string (what the vlogger said about it)",
 "category": "food | attraction | market | stay",
 "vlogger_verdict": "string (recommendation or warning)"
 }
]
"""
```

### Physical Coordinate Cross-Referencing
Once place names are extracted, the service passes them to `osm_service.py` to resolve GPS latitude and longitude. Landmarks that match real spatial entities are linked to interactive pins on the map.

When a user taps a waypoint in the itinerary:
- The map pans to the exact coordinate (`flyTo`).
- The UI displays the vlogger's review and offers a direct **"Watch on YouTube at MM:SS"** deep link (`https://youtu.be/{video_id}?t={timestamp_seconds}`).

---

## 4. Short-Form Social Video Mining (`social_mining.py`)

For non-YouTube platforms (Instagram Reels, TikTok, Facebook Watch):
1. **Metadata Scraping via `yt-dlp`**:
 - Extracts video captions, user tags, hashtag clusters (e.g. `#delhifoodguide`, `#hiddenwaterfall`), and video descriptions without downloading full video streams.
2. **DuckDuckGo Context Expansion**:
 - If a video caption is brief (e.g. *"Best rooftop cafe in Majnu Ka Tila! Tag your friends"*), the service runs an automated DuckDuckGo search:
 `"{caption_keywords}" Majnu Ka Tila cafe menu address`
 - Scrapes snippet results to verify the exact name, address, and coordinates of the cafe before itinerary compilation.

---

## 5. Reddit & Travel Blog Crawlers (`reddit_service.py`)

### Unfiltered Local Sentiment via Reddit
Mainstream review platforms are heavily gamified with fake 5-star reviews. Ghumo taps regional subreddit communities (`r/delhi`, `r/india`, `r/bangalore`, `r/mumbai`) to harvest authentic traveler sentiment:

- Queries Reddit JSON endpoints:
 `https://www.reddit.com/r/{subreddit}/search.json?q={location}+food+recommendations&restrict_sr=1&sort=top`
- Extracts high-upvoted comments containing phrases like:
 - *"Don't go to [Tourist Trap], walk 200m down the alley to [Authentic Dhaba]."*
 - *"Best sunset point that locals keep secret is..."*
- Feeds verified recommendations into the `TravelTip` and `HiddenGem` database tables.

### Blog Crawler with Cloudflare Bypass (`cloudflare_service.py`)
To index detailed Indian heritage travel blogs (e.g. Tripoto, IndiTales, native travelogues) protected by Cloudflare Bot Management:
- Sets realistic modern browser headers (`User-Agent`, `Accept-Language`, `Sec-Ch-Ua`, `Sec-Fetch-Dest`).
- Implements exponential backoff with randomized delay jitter (2s to 5s) between requests.
- Caches raw scrape HTML in the `raw_scrapes` database table to prevent repeat outbound hits.
