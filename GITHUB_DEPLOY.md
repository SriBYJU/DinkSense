# Publish DinkSense with GitHub Pages

1. Extract the ZIP.
2. Create a public GitHub repository, such as `DinkSense`.
3. Upload everything **inside** the extracted project folder.
4. Confirm these files are at the repository root:
   - `index.html`
   - `app.js`
   - `vision-lab.js`
   - `vision-pro.js`
   - `styles.css`
   - `sw.js`
5. Commit the files.
6. Open **Settings → Pages**.
7. Under **Build and deployment**, select **Deploy from a branch**.
8. Choose `main` and `/ (root)`, then save.

The site will normally appear at:

```text
https://YOUR-USERNAME.github.io/DinkSense/
```

## After publishing
- Hard-refresh once after replacing an older version so the new service worker activates.
- Open **Video → Form Match & Grade** while online the first time.
- Allow camera permission.
- The MediaPipe runtime and model files load from their official/CDN locations and are cached after successful use.
- Player data remains in each visitor’s own browser.
- Camera frames are not uploaded by DinkSense.
- Skeleton replays and custom motion references stay local.

Optional Ollama requires a local Ollama installation on each user’s computer.


## Founder photo check
After deployment, open the Founder page and confirm the image loads. The repository must contain this exact path and lowercase filename:

```text
assets/shriyan-avadhanula-founder.png
```

If an older version was already published, wait for Pages deployment to finish, then hard-refresh the site. DinkSense 1.7.0 uses a new service-worker cache name so the corrected asset is fetched.

## Google Maps and AdSense
Google Maps search links work without a Maps API key. AdSense remains a placeholder until the site is approved and real IDs are entered in `adsense-config.js`; see `ADSENSE_SETUP.md`.
