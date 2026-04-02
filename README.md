# AI ProfilePicture

Expo app for local-first AI profile picture generation.

## App

Create a local env file from the example:

```bash
cp .env.example .env
```

Set your backend URL in `.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

Then run the Expo app:

```bash
npm start
```

## Backend

A small Fastify proxy is included in `backend/`.

### Run locally

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Default behavior

- `MOCK_GENERATION=true` returns the normalized input image back to the app
- this lets you test the full mobile → backend → mobile flow before wiring Nano Banana

### Real provider modes

The backend supports:

- `NANO_BANANA_PROVIDER=mock`
- `NANO_BANANA_PROVIDER=gemini`
- `NANO_BANANA_PROVIDER=custom`

For Gemini-style image generation, set:

```bash
MOCK_GENERATION=false
NANO_BANANA_PROVIDER=gemini
NANO_BANANA_API_KEY=your_google_ai_key
NANO_BANANA_GEMINI_MODEL=gemini-2.5-flash-image-preview
```

For a custom provider endpoint, set:

```bash
MOCK_GENERATION=false
NANO_BANANA_PROVIDER=custom
NANO_BANANA_API_KEY=...
NANO_BANANA_API_URL=https://your-provider-endpoint
```

### Health check

```bash
curl http://localhost:3000/health
```

### Generate endpoint

```bash
curl -X POST http://localhost:3000/generate \
  -H 'Content-Type: application/json' \
  -d '{"style":"Professional","imageBase64":"data:image/jpeg;base64,..."}'
```

## Coolify deploy

For Coolify, point the service at the `backend/` directory.

### Recommended Coolify settings

- **Base directory:** `backend`
- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start`
- **Port:** `3000`

### Coolify environment variables

Mock mode:

```bash
PORT=3000
HOST=0.0.0.0
MOCK_GENERATION=true
NANO_BANANA_PROVIDER=mock
```

Gemini mode:

```bash
PORT=3000
HOST=0.0.0.0
MOCK_GENERATION=false
NANO_BANANA_PROVIDER=gemini
NANO_BANANA_API_KEY=your_google_ai_key
NANO_BANANA_GEMINI_MODEL=gemini-2.5-flash-image-preview
```

Custom provider mode:

```bash
PORT=3000
HOST=0.0.0.0
MOCK_GENERATION=false
NANO_BANANA_PROVIDER=custom
NANO_BANANA_API_KEY=...
NANO_BANANA_API_URL=https://your-provider-endpoint
```

### Expo app environment

For local app development, set:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

If your provider uses a different request or response shape, update `backend/src/lib/nano-banana.ts`.
