# Boli Poster — automated posting (design)

Status: idea / design. Nothing here is built yet except the dashboard **Share kit**
(`merchant-dashboard/src/pages/ShareKit/`), which this would extend.

**Current scope: Viber only.** Facebook, Instagram, TikTok and YouTube are out of
scope for now; notes on them are kept at the end for later.

## The idea

One installable program for Windows and Mac. Inside it runs a small Linux system
(a container) with **Viber Desktop for Linux** installed and logged in. The merchant
writes a post once, picks groups, and a robot posts it into each Viber group.

```
┌──────────── Boli Poster (Windows / Mac) ─────────────┐
│  Post editor + group picker   │  Linux container     │
│  (Electron UI)                │  Viber for Linux     │
│                               │  + posting robot     │
└───────────────┬───────────────┴──────────────────────┘
                │ fetches jobs / reports results
        ┌───────▼────────┐
        │  Boli backend  │
        │  (post queue)  │
        └────────────────┘
```

## Parts

### 1. Desktop app (Electron)
- Left panel: post text, image/video, channel and group picker, schedule.
- Right panel: the live screen of the Linux container (noVNC), so the user can
  watch the robot and step in.
- Starts and stops the container; keeps Viber's login data in a persistent volume
  so the phone QR scan is needed only once.
- Talks to the Boli backend: pulls scheduled Viber jobs, reports each result.

### 2. Linux container
- Ubuntu image with: `Xvfb` (virtual screen), a small window manager, Viber for
  Linux (`viber.deb`), `x11vnc` + noVNC (screen shown in the app), `xdotool`
  (keyboard/mouse), `xclip` (clipboard for text and images), Tesseract/OpenCV
  (reading the screen).
- Volume for `~/.ViberPC` so the login persists across restarts.
- Host requirements: Docker Desktop or WSL2 on Windows; Docker/Colima on Intel Mac.
  **Apple Silicon Macs:** Viber for Linux is x86-only, so it runs under emulation
  (slow; must be tested before promising Mac support).

### 3. Posting robot (Python, inside the container)
For each group in a job:
1. Focus Viber, open the search box, type the group name.
2. Open the matching chat.
3. **Verify** it is the right chat: screenshot the chat header and OCR it. If the
   name does not match exactly, stop. Posting to the wrong chat is the worst failure.
4. Put the text on the clipboard (`xclip`) and paste it; put the image on the
   clipboard as `image/png` and paste it.
5. Send:
   - **Confirm mode (default):** highlight Send and wait for the user to click it.
   - **Auto mode:** press Enter.
6. Screenshot the result, OCR the last message to confirm it was sent, report back.
7. Wait before the next group.

Guard rails (built in, not optional):
- Pauses of 30–120 s between groups, a daily cap per account, and only groups the
  merchant has explicitly ticked.
- Stop the whole job and alert the user if: Viber is logged out, a check in step 3
  or 6 fails, or the screen does not look as expected (for example after a Viber
  update moved things).

### 4. Boli backend
- New `ScheduledPost` and `PostTarget` tables: post content (text + image), target
  Viber group name, schedule time, status, result.
- The desktop app fetches due jobs, runs them, and reports each group's result.
- Results go into the existing message log, and each post's link carries
  `?src=viber` (already done by the Share kit) so sign-ups and visits from Viber can
  be counted.

## Risks to accept before building
- Automating a personal Viber account is against Viber's terms. The risk is the
  merchant's number being restricted or banned, so confirm mode is the default
  and auto mode needs an explicit opt-in.
- Viber updates can break the robot; the screen checks make it stop safely, not
  post wrongly, but someone has to fix it after each breaking update.
- Viber limits linked desktops per account; the container uses one.

## Build order
1. Container image (Viber + Xvfb + noVNC) running on one Windows PC; manual login.
2. Robot in confirm mode for one group, with the chat-name check.
3. Electron app wrapping the container screen and the post editor; Windows
   installer, first-launch Linux setup, auto-update.
4. Backend post queue, scheduling from the dashboard, job fetching and result
   reporting.
5. Auto mode (opt-in), multi-group runs with pauses and daily cap.

## Later (out of scope for now)
Other channels would be posted from the Boli backend through official APIs, with no
container:

| Channel | How it posts | Setup needed |
|---|---|---|
| Viber Channel | Official Viber Channels post API (no robot) | Channel token |
| Facebook Page | Meta Graph API | Meta app review + business verification |
| Instagram | Meta Graph API (Business/Creator account) | Same Meta app |
| TikTok | Content Posting API | TikTok audit (posts are private until approved) |
| YouTube | YouTube Data API upload | Google OAuth verification; daily upload quota |
