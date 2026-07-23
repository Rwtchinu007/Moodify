# Moodify Player

Moodify Player is a mood-based music player with a React frontend and an Express backend.
The backend handles authentication, song upload, playlist fetching, MongoDB storage, Redis token blacklisting, and ImageKit uploads.

## Project Structure

- `Frontend/` - Vite + React app
- `Backend/` - Express API and static asset server

## Features

- User registration and login with cookie-based JWT auth
- Protected home route for authenticated users
- Mood-based playlist fetching
- Song upload with poster extraction from ID3 metadata when available
- MongoDB persistence for users and songs
- Redis-backed token blacklist for logout
- ImageKit-based media storage

## Prerequisites

- Node.js 18 or newer
- MongoDB database
- Redis instance
- ImageKit account and private key

## Environment Variables

Create `Backend/.env` with the values used by the server:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NODE_ENV=development
```

## Installation

Install dependencies in both folders:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

## Run Locally

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend:

```bash
cd Frontend
npm run dev
```

The frontend runs on the Vite dev server, and the backend listens on port `3000`.

## Build For Production

Build the frontend:

```bash
cd Frontend
npm run build
```

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/get-me`
- `GET /api/auth/logout`

### Songs

- `POST /api/songs` - upload a song with `multipart/form-data`
- `GET /api/songs?mood=happy` - fetch a playlist for a mood

## Upload Format

Song uploads expect:

- `song` - file input containing the audio file
- `mood` - string label used for playlist grouping

If the track has embedded album art, Moodify uses it as the poster image.
Otherwise, it falls back to the default cover stored in `Backend/public/cover for song.jpg`.

## Notes

- The backend serves static files from `Backend/public`.
- Logout invalidates the current JWT by adding it to the Redis blacklist.
- Uploaded songs are sampled into playlists, with up to 10 random tracks returned for a mood.
