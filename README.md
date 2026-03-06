# Bumpn

**Find the vibe. Join the party.**

Bumpn is a real-time social map of nightlife, allowing users to discover where the best parties are happening and share the experience through a shared event camera feed.

This repository is set up as a monorepo consisting of two main parts:
- **`apps/mobile`**: The React Native (Expo) frontend for iOS and Android.
- **`apps/backend`**: The Node.js + Express + Apollo GraphQL API.

---

## 🛠 Prerequisites

Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`
- **Expo Go** app on your iOS/Android device, or an Emulator/Simulator installed locally (e.g., Android Studio).
- Access to [Clerk](https://clerk.com/) (Auth), [Mapbox](https://mapbox.com/) (Maps), [MongoDB Atlas](https://www.mongodb.com/) (Database), and [Redis](https://redis.io/) (PubSub).

---

## 🚀 Getting Started

### 1. Install Dependencies
From the root of the project, run:
```bash
npm install
```
*(This will install dependencies for both the mobile and backend workspaces.)*

---

### 2. Configure Environment Variables
You need two `.env` files. One inside `apps/mobile/` and another inside `apps/backend/`.

#### Mobile (`apps/mobile/.env`):
This contains public keys needed by the React Native app.
```env
# Clerk Authentication Public Key (Starts with pk_test_...)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Mapbox Access Token (Starts with pk....)
EXPO_PUBLIC_MAPBOX_KEY=your_mapbox_public_key

# Your Local Network IP for the GraphQL API (e.g., http://192.168.1.xxx:4000/graphql)
EXPO_PUBLIC_API_URL=http://localhost:4000/graphql
```
*Note: If testing on a physical device, `localhost` won't work in `EXPO_PUBLIC_API_URL`. You must use your computer's local Wi-Fi IP address (e.g., `192.168.x.x`).*

#### Backend (`apps/backend/.env`):
This contains secure backend secrets. **DO NOT** commit this file.
```env
# Server Port (Default is 4000)
PORT=4000

# MongoDB URI String from MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bumpn

# Clerk Secret Key (Starts with sk_test_...)
CLERK_SECRET_KEY=your_clerk_secret_key

# Redis connection string for GraphQL subscriptions
REDIS_URL=redis://localhost:6379 

# Cloudflare R2 / AWS S3 Storage Variables 
# (You can leave these blank initially if you aren't testing photo uploads yet)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=bumpn-media
```

---

## 🏃 Running the Application

Because this is a monorepo with separate front and backends, you will need **two terminal windows**.

### Step 1: Start the Backend (GraphQL API)
Open Terminal 1:
```bash
cd apps/backend
npm run dev
```
> The API will be available at `http://localhost:4000/graphql` and you can visit that URL in your browser to use the Apollo Sandbox to run queries directly against your local database.

### Step 2: Start the Mobile App (Expo)
Open Terminal 2:
```bash
cd apps/mobile
npx expo start
```
> You can now press `a` to open the app in Android Studio emulator, `i` for iOS Simulator (Mac only), or scan the QR code with your phone using the Expo Go application.

---

## 📝 Troubleshooting
- **Network Request Failed (Mobile)**: This usually means the Expo app on your phone can't reach your backend. Check that `EXPO_PUBLIC_API_URL` uses your computer's local IP address instead of `localhost`.
- **Metro Bundler Errors**: Try clearing the cache by stopping the Expo server and running `npx expo start -c`.
- **Database Connection**: Ensure your computer's current IP address is allowlisted in MongoDB Atlas Network Access.
