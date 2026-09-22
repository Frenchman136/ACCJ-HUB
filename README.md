# ACCJ HUB

An elegant media streaming hub for videos and music — with role-based admin access, community
engagement (likes + comments), a custom video player, a Spotify-style sticky music player, and a
delightful animated dark UI.

![Stack](https://img.shields.io/badge/MERN-MongoDB%20%C2%B7%20Express%20%C2%B7%20React%20%C2%B7%20Node-8b5cf6)

---

## Features

### Everyone (guests included)
- Browse videos and music, filter by animated category pills, search, sort (newest / most liked /
  most commented / most viewed)
- Custom video player: auto-hiding controls, ±10s skip, hover time preview on the scrubber,
  playback speed 0.5–2x, picture-in-picture, fullscreen, keyboard shortcuts
  (`Space` play/pause, `←/→` seek, `↑/↓` volume, `F` fullscreen, `M` mute), and resume-where-you-left-off
- Sticky bottom music player that **keeps playing while you navigate** — rotating artwork,
  waveform progress, shuffle, repeat (off / all / one), queue drawer, volume memory
- View counts, related media, share-link copying, optional downloads (admin-controlled)

### Signed-in users
- Like / unlike with an animated heart burst (optimistic UI, one like per user per item)
- Post, edit, and delete their own comments (avatars + relative timestamps)
- Profile page: identity card, liked media, comment history

### Admins
- Upload videos and MP3s (drag-and-drop, 500 MB max) with custom thumbnails or auto-captured
  video frames; create categories on the spot during upload
- Manage media: edit titles/descriptions/categories/thumbnails, toggle downloads, delete
- Manage categories per content type: create, rename, drag-to-reorder, delete
  (delete is blocked while media is attached)

### Super admin (you)
- Only the super admin can promote/demote admins — no one can demote you from the UI
- Locked in via `SUPER_ADMIN_USER_ID` in `server/.env` **or** `role: "super_admin"` in Clerk
  `publicMetadata` (see seed script)

---

## Tech Stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Frontend  | React 18 (Vite), TailwindCSS, Framer Motion, React Router, Axios, lucide-react |
| Backend   | Node.js, Express                                   |
| Database  | MongoDB Atlas (Mongoose)                           |
| Auth      | Clerk — sessions, social logins, role in `publicMetadata` |
| Media     | Cloudinary (CDN, transcoding, auto video thumbnails) |

---

## Project Structure

```
accj-hub/
├── package.json                 # concurrently runs client + server
├── client/                      # React SPA
│   ├── src/
│   │   ├── App.jsx              # routes + providers
│   │   ├── context/             # ToastContext, PlayerContext (audio queue)
│   │   ├── components/          # Navbar, MediaCard, CategoryPills, LikeButton,
│   │   │                        # VideoPlayer, StickyAudioPlayer, CommentSection...
│   │   ├── pages/               # Home, Videos, Music, MediaDetail, Profile
│   │   └── pages/admin/         # Upload, Manage Media, Categories, Admins
└── server/                      # Express API
    ├── config/                  # db.js, cloudinary.js
    ├── middleware/              # auth (Clerk + roles), error
    ├── models/                  # Media, Category, Comment
    ├── routes/                  # media, categories, comments, users
    └── scripts/seedSuperAdmin.js
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) application (free tier is fine)
- A [MongoDB Atlas](https://mongodb.com/atlas) cluster
- A [Cloudinary](https://cloudinary.com) account

### 2. Install
```bash
git clone <your-repo> && cd accj-hub
npm run install:all        # installs server + client deps
```

### 3. Configure the server
```bash
cp server/.env.example server/.env
```
Fill in `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_test_...           # Clerk > API Keys
SUPER_ADMIN_USER_ID=user_...           # your Clerk user id (see below)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Configure the client
```bash
cp client/.env.example client/.env
```
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000/api
```

### 5. Make yourself super admin
Sign in to the app once (so Clerk creates your user), grab your user id from
Clerk Dashboard > Users, then either:
```bash
npm run seed:superadmin you@email.com
# and copy the printed id into SUPER_ADMIN_USER_ID in server/.env
```
or simply set `SUPER_ADMIN_USER_ID` to that id — the server treats that id as super admin
permanently, regardless of metadata.

> **Roles** are read from Clerk `publicMetadata.role` (`"user" | "admin" | "super_admin"`).
> The backend verifies the role from the session token on every protected route — the client
> only hides UI.

### 6. Run
```bash
npm run dev      # server :5000 + client :5173
```

---

## API Overview

| Method | Route | Access | Purpose |
| ------ | ----- | ------ | ------- |
| GET    | `/api/media` | public | List (type, category, search, sort, paging) |
| GET    | `/api/media/:id` | public | Detail (+ view increment, `myLike`) |
| GET    | `/api/media/liked` | user | Liked media |
| POST   | `/api/media` | admin | Upload (multipart: file + optional thumbnail) |
| PATCH  | `/api/media/:id` | admin | Edit |
| DELETE | `/api/media/:id` | admin | Delete (Cloudinary + DB) |
| POST   | `/api/media/:id/like` | user | Toggle like |
| GET/POST | `/api/media/:id/comments` | public / user | Comments |
| PATCH/DELETE | `/api/comments/:id` | owner / admin | Moderate |
| GET    | `/api/categories?type=` | public | Categories + counts |
| POST/PATCH/DELETE | `/api/categories...` | admin | Manage |
| POST   | `/api/categories/reorder` | admin | Drag-drop order |
| GET    | `/api/users` | admin | List Clerk users |
| POST   | `/api/users/:id/promote` / `demote` | super_admin | Admin management |

---

## Deployment

| Piece      | Recommended host |
| ---------- | ---------------- |
| Client     | Vercel (`npm run build`, set `VITE_*` env vars, SPA fallback to `/index.html`) |
| Server     | Render / Railway (set all `server/.env` vars; keep the free tier awake with an uptime ping) |
| Database   | MongoDB Atlas (allow the host's egress IPs) |
| Media      | Cloudinary (nothing to host) |

**Production checklist**
- Set `CLIENT_URL` to your real client origin(s) on the server (CORS).
- Set `VITE_API_URL` to your deployed API URL and rebuild the client.
- Restrict Cloudinary upload presets / keep API secret server-side only.
- Enable Clerk webhook (optional) for instant user syncing — the current design reads users
  live from Clerk, so no webhook is required.

---

## Accessibility & UX notes
- Keyboard-navigable players with ARIA roles/labels, visible focus rings, `prefers-reduced-motion` support
- Mobile-first: sticky bottom nav, thumb-friendly tap targets, safe-area padding
- Lazy-loaded thumbnails with blur-up reveal, shimmer skeletons, optimistic likes, animated toasts

## Roadmap (from the spec's stretch goals)
Playlists · reaction-variations on likes · comment replies/reactions · dark/light toggle ·
PWA install · admin analytics · bulk upload · scheduled publishing · video watermark
