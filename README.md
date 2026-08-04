# DinkSense — Local-First Pickleball Athlete Intelligence

DinkSense is a mobile-first progressive web app built from Shriyan Avadhanula’s product roadmap. It runs from static hosting or localhost, keeps athlete data in the browser, and connects match tracking, training, health, competition, video, equipment, and coaching through one shared player profile.

## Launch

- macOS: double-click `start.command`
- Windows: double-click `start.bat`
- Linux: run `./start.sh`
- Any platform with Python: run `python3 run.py`

Opening `index.html` directly works for many features, but localhost or HTTPS is required for dependable camera permissions, PWA installation, and service-worker caching.

## New in 1.7.0 — Discovery, Playbook & Match Day

### Google Maps court discovery
- Search real nearby pickleball courts from a city/ZIP or browser geolocation
- Filters for all, indoor, outdoor, public, and open-play searches
- Embedded Google Maps preview plus official full Maps search for current ratings, hours, photos, traffic, and directions
- Manual court saving is now optional and used only for private favorites, surface notes, and crowd memory

### Founder photo reliability fix
- The About the Founder page always uses the exact bundled asset `assets/shriyan-avadhanula-founder.png`
- Old browser-uploaded founder-photo settings are ignored
- The image is preloaded and included in the versioned offline app-shell cache
- A clear diagnostic appears if the asset is missing after a GitHub upload

### Pro-Level Playbook
- Personalized cue deck based on tracked weaknesses, level, style, and focus
- Technique, strategy, doubles, singles, mental, and tournament categories
- Dedicated cues for rolls, flicks, resets, counters, dinks, serves, transition play, pressure, and recovery
- Save favorites, copy cues, launch the matching drill, and rotate the daily recommendation
- Official USA Pickleball learning links and PPA Tour professional match-study links

### Match Day Command Center
- Event, venue, time, format, and arrival-buffer planning
- Automatic arrival and warm-up timeline
- Readiness-linked tactical cue
- Equipment, hydration, scouting, warm-up, and recovery checklist
- Integration with saved scouting reports
- Exportable plain-text match plan

### Google AdSense preparation
- Responsive, labeled ad placeholders on lower-priority screens
- Separate `adsense-config.js` for approved publisher and slot IDs
- No ad placement inside match logging, coach chat, live form grading, or health guidance
- `ADSENSE_SETUP.md` and an `ads.txt.example` template are included

## New in 1.6.0 — Motion Intelligence Suite

### 1. Form Match & Grade
- Animated moving clip-art/skeletal references
- Live MediaPipe Pose Landmarker tracking of 33 body landmarks
- Optional MediaPipe hand tracking for better forearm/hand-path feedback
- Practice and performance scoring tolerances
- Right- and left-handed mirroring
- Adjustable animation speed
- Automatic repetition detection
- Per-repetition score, average, best score, streak, tracking confidence, and spoken coaching
- Joint-angle, stance, knee bend, torso, contact-window, balance, recovery, and hand-path feedback

Included mechanics:
- serve
- return of serve
- forehand and backhand drive
- third-shot drop
- forehand and backhand dink
- forehand and backhand roll
- forehand and backhand flick
- forehand and backhand reset
- counter volley
- overhead
- transition split step

### 2. Smart Replay Coach
After a graded session, DinkSense automatically saves the strongest and weakest completed repetitions as compact skeleton data. Players can:
- replay at 0.25×, 0.5×, or 1×
- scrub frame by frame
- compare their skeleton with the reference
- toggle landmark difference lines
- review the weakest component and exact correction

Raw camera video is not saved by this feature.

### 3. Shot Progress Passport
Every mechanic receives its own local development record:
- mastery score
- average and personal-best grade
- total graded repetitions
- recent trend
- achievement stamps
- next training target
- exportable standalone HTML passport

### 4. Custom Motion Studio
Players can:
- record a four-second movement sequence
- capture individual key checkpoints
- turn the sequence into a moving animated reference
- save it locally as a custom shot
- practice and grade future repetitions against that custom sequence

### Bonus tools
- Reaction & Split-Step Trainer
- Court IQ Decision Arena

## How the pose system works

The first time Form Match & Grade is opened, the browser downloads the MediaPipe runtime, WASM files, pose model, and hand model. Camera frames are then processed on the device. When DinkSense is served through HTTPS or localhost, the service worker caches successful MediaPipe/model requests so later sessions can reuse them offline on that browser.

The grading system compares normalized body geometry against shot-specific animated checkpoints. It is a practical single-camera coaching tool, not laboratory motion capture. It cannot perfectly measure paddle-face angle, ball spin, or ball flight unless a future specialized object-tracking model is added.

## Existing functional systems

- local match and stat tracking
- adaptive coach and automatically rewriting roadmap
- training plans, drills, challenges, experiments, and daily prescription
- analytics, Game DNA, Training Pulse, Point Pattern Studio, and Milestone Lab
- local video library, timestamp tags, search, and comparison
- readiness, load, soreness, recovery, and movement self-screen
- court discovery and optional weather
- paddle finder, gear lifecycle, and services directory
- tournament prep, scouting reports, club tools, sponsorship pitch generator, portfolio, and Pickleball Wrapped
- About the Founder page with Shriyan’s bundled photo
- JSON backup/import and PWA installation

## Network boundaries

Core tracking, analytics, deterministic coaching, plans, and stored data work locally.

An internet connection is needed for:
- the first MediaPipe model/runtime load
- optional live weather
- external tournament links
- optional Ollama setup downloads
- future DUPR, cloud sync, shared leaderboards, retailer feeds, or tournament-feed integrations

## Local storage and privacy

Structured state is stored in IndexedDB and mirrored to localStorage. Uploaded videos remain local IndexedDB blobs. Camera frames are analyzed in memory. Smart Replay stores skeleton coordinates and scores, not raw video. Each browser/device has separate data. Use **Settings → Export backup** regularly.

## GitHub Pages

See `GITHUB_DEPLOY.md`. Upload the extracted project contents and keep `index.html` at the repository root.

## Founder credit

DinkSense is credited to Shriyan Avadhanula. The founder photo is bundled at `assets/shriyan-avadhanula-founder.png` and appears automatically.

## Safety

DinkSense offers training and general wellness guidance, not medical advice or a clinically validated biomechanical assessment.

## Version

DinkSense 1.6.0 — Motion Intelligence Suite.
