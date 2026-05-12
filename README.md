# FindMySpace

A student housing app for finding rental properties near National Dong Hwa University (NDHU) in Hualien, Taiwan. Built with React and Firebase, and available as both a web app and an Android app via Capacitor.

---

## Features

- **Search & Filter** — search by name, filter by bedroom count, amenities, bathroom type, and monthly rent range
- **Property Listings** — browse approved rentals with photos, pricing, location map, and landlord contact info
- **Favorites** — save properties and get AI-powered recommendations based on your saved listings
- **Reviews** — leave star ratings and written reviews; AI summarizes review sentiment using Gemini
- **Landlord Portal** — landlords can submit new listings (pending admin approval) and manage their properties
- **Admin Panel** — admins can approve or reject pending listings
- **Google Sign-In** — authentication via Firebase (Google OAuth + email/password)
- **Android Support** — runs as a native Android app via Capacitor

---

## Tech Stack

- Frontend: React 18, Vite, MUI (Material UI)
- Backend/Database: Firebase Firestore, Firebase Auth, Firebase Storage
- Hosting: Firebase Hosting
- AI: Google Gemini (via Cloudflare Worker proxy)
- Image Uploads: Cloudinary
- Mobile: Capacitor (Android)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase](https://console.firebase.google.com/) project with Firestore, Auth (Google provider), and Hosting enabled
- A [Cloudinary](https://cloudinary.com/) account for image uploads
- A Cloudflare Worker (or similar proxy) to forward requests to the Gemini API

### 1. Clone and install

```bash
git clone https://github.com/your-username/findmyspace.git
cd findmyspace
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Gemini (via Worker proxy)
VITE_GEMINI_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

### 3. Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

### 4. Run locally

```bash
npm run dev
```

### 5. Build and deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## Seeding Sample Data

A seed script is included for development:

```bash
node seed.mjs
```

This populates Firestore with sample properties from `src/seed.json`. Only run this against a development Firebase project.

---

## Android Build

The app uses [Capacitor](https://capacitorjs.com/) to run as a native Android app.

```bash
npm run build
npx cap sync android
npx cap open android   # opens Android Studio
```

Build and run from Android Studio, or use `npx cap run android` with a connected device.

---

## Project Structure

```
src/
├── App.jsx                  # Root component, routing, auth state
├── firebase.mjs             # Firebase initialisation
├── gemini.js                # Gemini AI helpers (review summary, recommendations)
├── SearchBar.jsx            # Search and filter UI
├── PropertyDetails.jsx      # Individual property page with reviews
├── NewBuilding.jsx          # Landlord listing submission form
├── MyProperties.jsx         # Landlord's own listings management
├── AdminPanel.jsx           # Admin approval queue
├── ProfilePage.jsx          # User profile and account settings
├── FavoritesComponent.jsx   # Saved properties + AI recommendations
└── ...                      # Supporting components and CSS
```

---

## User Roles

| Role | Permissions |
|---|---|
| Guest | Browse and view approved listings |
| Tenant | Browse, favorite, and review listings |
| Landlord | Submit new listings, manage own properties |
| Admin | Approve / reject pending listings |

Roles are assigned at sign-up and stored in Firestore. Admin status is set manually in the database and cannot be self-assigned.

---

## Environment Notes

- All sensitive keys are loaded via Vite's `import.meta.env` and must be prefixed with `VITE_`
- The Gemini API key is never exposed to the client — all AI calls go through a server-side proxy (Cloudflare Worker)
- Firestore security rules enforce role-based access server-side regardless of client state