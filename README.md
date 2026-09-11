# StreamGlass 📺✨

> A personal streaming platform for Live TV channels, on-demand cinema, and M3U playlists, designed with Apple Liquid Glass aesthetic and powered by modern HLS streaming technology.

[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 Highlights

- **Apple Liquid Glass Aesthetic**: Multi-layer frosted glass morphism (`backdrop-blur`), subtle specular lighting, refined typography, and 5 accent illumination palettes (*Electric Azure, Emerald Cyan, Sunset Amber, Crimson Glow, Royal Amethyst*).
- **M3U / M3U8 Master Hub**:
  - **Drag & Drop File Upload**: Instantly parses local `.m3u`, `.m3u8`, or `.txt` playlist files.
  - **Direct URL Import**: Ingest remote IPTV feeds with automated live stream validation.
  - **Raw Text Paste**: Paste M3U code directly with live syntax checks.
  - **Extended M3U Metadata**: Extracts `tvg-name`, `tvg-logo`, `group-title`, `tvg-id`, `tvg-country`, and `tvg-language`.
  - **Auto Categorization**: Distinguishes between Live TV broadcasts and on-demand feature movies.
- **Cinematic Discovery & Navigation**:
  - **Netflix-Style Premiere Showcase**: Hero banners with high-definition backdrop artwork and quick-watch actions.
  - **Continue Watching Shelf**: Resumes playback with stored timestamp progress bars.
  - **IPTV Channel Deck**: Filter channels by category, search by query, and toggle between grid and compact list layouts.
  - **EPG Program Guide**: Real-time Electronic Program Guide timeline display for scheduled broadcasts.
  - **VOD Cinema Library**: Filter movies by genre, sort by rating, year, or duration, and view comprehensive synopses in glass drawers.
  - **Global Spotlight Search (`⌘K` or `/`)**: Command-palette search across channels, movies, genres, and playlists with arrow-key navigation.
- **High-Performance HLS Playback Engine**:
  - Powered by `Hls.js` with automated native HLS fallback for Apple Safari and iOS devices.
  - **Low-Latency HLS (LL-HLS)** mode and selectable buffer strategies (*Fast Start*, *Balanced*, *Smooth Network*).
  - **Floating Picture-in-Picture (PiP)** mini-player when browsing other tabs.
  - **Quick Channel Switcher Drawer**: Zap channels directly from inside the active player without closing your stream.
  - **Diagnostics HUD**: Real-time bitrate, resolution, buffer length, and dropped frames monitor.
- **Local-First & Private**:
  - 100% client-side architecture. Your playlists, bookmarks, and watch history never leave your browser.
  - Export and restore configuration backups as JSON anytime.
- **TV & Remote Optimization**:
  - Dedicated **TV Interface Mode** with enhanced focus rings, larger typography, and keyboard/D-pad navigation.

---

## 🚀 Quick Start (Local Development)

Ensure you have **Node.js 18+** installed.

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/streamglass.git
cd streamglass

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Hosting on GitHub Pages

StreamGlass is pre-configured with a relative asset base (`./`) and an automated **GitHub Actions** deployment pipeline.

### Option 1: Automated Deployment via GitHub Actions (Recommended)

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of StreamGlass"
   git branch -M main
   git remote add origin https://github.com/<your-username>/streamglass.git
   git push -u origin main
   ```
2. In your GitHub repository, navigate to:
   **Settings** ➔ **Pages** (under the "Code and automation" section).
3. Under **Build and deployment**:
   - Set **Source** to **GitHub Actions**.
4. That's it! GitHub will automatically trigger the included workflow (`.github/workflows/deploy.yml`) on every push to `main`, compiling the Vite bundle and publishing it to:
   ```
   https://<your-username>.github.io/streamglass/
   ```

### Option 2: Manual Deployment via `gh-pages`

```bash
# 1. Install gh-pages
npm install -D gh-pages

# 2. Build the project
npm run build

# 3. Deploy the dist folder
npx gh-pages -d dist
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> / <kbd>K</kbd> | Play / Pause |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>M</kbd> | Toggle Mute |
| <kbd>←</kbd> / <kbd>→</kbd> | Seek Backward / Forward 10 seconds |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume Up / Down (10%) |
| <kbd>N</kbd> / <kbd>P</kbd> | Zap to Next / Previous Channel |
| <kbd>⌘</kbd> + <kbd>K</kbd> or <kbd>/</kbd> | Open Spotlight Global Search |
| <kbd>Esc</kbd> | Close Modal / Exit Player / Spotlight |

---

## 📋 Supported Playlist Syntax

StreamGlass supports standard and extended `#EXTM3U` playlists:

```m3u
#EXTM3U x-tvg-url="https://example.com/epg.xml"

#EXTINF:-1 tvg-id="nasa.us" tvg-name="NASA TV" tvg-logo="https://example.com/nasa.png" group-title="Science & Space",NASA TV Ultra HD
https://example.com/nasa_hls/index.m3u8

#EXTINF:-1 tvg-name="Tears of Steel" group-title="Sci-Fi" tvg-logo="https://example.com/poster.jpg",Tears of Steel (2012)
https://example.com/vod/tears_of_steel.mp4
```

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Video Engine**: [Hls.js](https://github.com/video-dev/hls.js)
- **Deployment**: [GitHub Actions](https://github.com/features/actions)

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
