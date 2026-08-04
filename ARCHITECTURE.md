# DinkSense Architecture — 1.6.0

## Runtime
DinkSense is a static HTML/CSS/JavaScript PWA. GitHub Pages, localhost, and other HTTPS static hosts are supported.

## Core storage
- `DinkSenseDB / kv`: structured app state
- `DinkSenseDB / videos`: uploaded local video blobs
- `localStorage`: structured-state fallback mirror
- shell service-worker cache: HTML, CSS, scripts, icons, founder image
- vision service-worker cache: successful MediaPipe runtime, WASM, pose-model, and hand-model responses

## Motion intelligence files
- `vision-lab.js`: shot definitions, animated references, MediaPipe setup, live grading, custom checkpoints, reaction trainer, and Court IQ
- `vision-pro.js`: completed-rep capture, skeleton replay, Shot Passport, four-second Custom Motion Studio recording, and integration hooks

## Form Match pipeline
1. User selects shot, handedness, tolerance, and speed.
2. MediaPipe Pose Landmarker returns body landmarks from the live video frame.
3. Optional Hand Landmarker estimates dominant-hand orientation.
4. DinkSense normalizes the pose and extracts joint/stance/torso/contact/balance features.
5. The live pose is compared with each animated shot checkpoint.
6. The closest checkpoint becomes the current phase.
7. Component scores are combined into the live grade.
8. Phase progression and recovery to ready position identify a completed repetition.
9. Session and rep summaries write into the shared player state.

## Smart Replay
Camera pixels are not stored. The strongest and weakest completed reps are resampled into compact normalized skeleton sequences. Replay compares stored landmarks with the corresponding reference checkpoint.

## Shot Passport
Passport mastery combines session averages, best repetitions, graded-rep volume, and recent trend. It is a coaching index, not an official rating.

## Custom Motion Studio
A four-second sequence or manually captured poses are normalized, resampled, and stored as a custom animated shot definition. Future sessions use the same scoring pipeline.

## Adaptive training engine
Roadmap updates are deterministic and transparent:
- new evidence changes a signature
- completed weeks remain locked
- current/future weeks can change
- prior plan is kept for undo
- adaptation evidence is stored

## Network boundaries
- first MediaPipe/model load
- optional Open-Meteo weather
- optional local Ollama endpoint
- external tournament links
- no default cloud database


## v1.7 public-integration boundary
- Google Maps discovery sends only the chosen court-search phrase and optional coordinates to Google; athlete logs are not included.
- The official full Maps search uses a Maps URL with `api=1`. The embedded map is a convenience preview.
- AdSense code remains disabled until approved IDs are entered in `adsense-config.js`.
- The founder asset is a static project file at `assets/shriyan-avadhanula-founder.png`, not a user-uploaded browser value.
- Playbook advice is original DinkSense coaching content; external official resources are linked rather than copied.
