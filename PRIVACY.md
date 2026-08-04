# Privacy Notes

- DinkSense does not create an account or upload player records by default.
- Match logs, profiles, plans, health check-ins, form grades, custom shots, replays, and settings remain in browser storage.
- Uploaded match videos remain local IndexedDB blobs.
- Live camera frames are processed in memory and are not saved by Form Match & Grade.
- Smart Replay stores normalized skeleton landmarks, phase labels, component scores, and feedback—not raw camera video.
- Custom Motion Studio stores normalized skeleton checkpoints—not recorded camera video.
- The first motion-model use downloads MediaPipe runtime/model files from jsDelivr and Google-hosted model storage.
- When HTTPS or localhost enables the service worker, successful runtime/model responses may be cached in the browser for later offline reuse.
- MediaPipe processes input on-device; the MediaPipe project may collect product performance/usage metrics as described by its own privacy notice.
- Live weather sends the coordinates required for the Open-Meteo request.
- Optional Ollama sends the coaching prompt to the locally configured Ollama endpoint.
- External tournament links are governed by the destination site.
- Clearing browser storage can erase local data. Export a JSON backup regularly.


## Google Maps and external learning links
Google Maps discovery is optional and online. Searching by city/ZIP or geolocation sends that court-search query to Google. DinkSense does not attach match history, health logs, training plans, videos, or AI-coach conversations to the Maps query. Official learning links open external USA Pickleball or PPA Tour pages under those sites' own privacy policies.

## Advertising
The build includes inactive AdSense-ready placeholders. No Google advertising script is loaded while `enabled` remains `false` in `adsense-config.js`. If the owner enables ads after approval, Google advertising services will operate under the owner's disclosures, consent requirements, and applicable policies.
