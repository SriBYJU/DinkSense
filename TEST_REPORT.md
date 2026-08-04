# DinkSense 1.7.0 Test Report

Build date: August 4, 2026

## Automated syntax and asset checks
- `node --check app.js`: passed
- `node --check vision-lab.js`: passed
- `node --check vision-pro.js`: passed
- `node --check enhancements-v1.7.js`: passed
- `node --check adsense-config.js`: passed
- founder PNG decoded successfully at 853 × 1844 pixels
- exact bundled filename verified: `assets/shriyan-avadhanula-founder.png`

## Headless Chromium interface checks
The project scripts and styles were loaded inline in Chromium to exercise the application without relying on a networked test server.

Passed with no page or console errors:
- dashboard render and v1.7 next-action cards
- 13 navigation entries including Playbook
- founder page render and founder image decode
- Google Maps court finder render
- official Maps Search URL generation with `api=1`
- city search (`Richmond, VA`) and indoor filter rewrite
- Pro-Level Playbook with eight personalized cards
- saving and removing coaching cues
- Match Day modal, form submission, timeline, and checklist render
- AdSense settings/status panel
- four Motion Intelligence feature cards
- mobile layouts for dashboard, discovery, playbook, founder, and video with no horizontal overflow

## Network-dependent boundaries
- The full Google Maps result, embedded map, weather, AdSense, and the first MediaPipe model download require internet access.
- The test environment validated generated URLs and UI behavior but did not substitute for Google account/API approval or AdSense approval.
- Real-person camera accuracy still requires physical testing after deployment.


---

# DinkSense 1.6.0 Test Report

Build date: August 4, 2026

## Automated syntax checks
- `node --check app.js`: passed
- `node --check vision-lab.js`: passed
- `node --check vision-pro.js`: passed
- `node --check sw.js`: passed

## Headless Chromium interface checks
A test build with the project scripts and styles loaded inline was exercised in Chromium.

Passed with no page or console errors:
- initial dashboard render
- Video & Vision Lab render
- all four Motion Intelligence feature cards
- Form Match & Grade modal
- complete 16-shot selector
- forehand-flick selection
- animated-reference canvas creation
- Smart Replay Coach with realistic demo skeleton frames
- replay speed, scrub, overlay, and component-map interface
- Shot Progress Passport populated from demo form sessions
- Custom Motion Studio controls
- Reaction and Court IQ tool entry points
- demo-data integration

## Static/data checks
- 16 built-in shot templates present
- forehand/backhand rolls and flicks present
- custom-shot storage arrays merge with existing saved data
- form sessions, skeleton replays, reaction results, and decision results persist in local state
- founder photo remains bundled
- GitHub Pages paths are relative
- service worker includes app shell plus runtime caching for MediaPipe/model hosts

## Camera/model boundary
The UI and grading logic were tested. A real-person camera session cannot be physically performed inside the automated environment. The implementation uses the documented MediaPipe Pose Landmarker and Hand Landmarker browser APIs, `detectForVideo`, 33 body landmarks, and optional hand landmarks.

The first successful model load requires an internet connection; successful model/runtime requests are then cached by the service worker on HTTPS or localhost.

## Known measurement limitations
- no laboratory-grade biomechanics
- no exact paddle-face, ball-spin, or ball-flight measurement
- no clinical injury diagnosis
