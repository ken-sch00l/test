# 🚀 Quick Start Guide

Your Event Reminder App is ready! Follow these steps to get it fully operational.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a new project**
3. Enter project name: `event-reminder-app`
4. Click **Create project** → **Continue**

## Step 2: Set Up Firebase Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get Started**
3. Click **Email/Password** provider
4. Toggle **Enable** ON
5. Click **Save**

## Step 3: Set Up Firestore Database

1. Go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose **Production mode** → **Next**
4. Select location → **Create**
5. Once ready, go to **Rules** tab, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write for now (change in production!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**

## Step 4: Get Firebase Credentials

1. In Firebase Console, click ⚙️ **Settings** → **Project settings**
2. Scroll down to **Your apps** section
3. Under "Web apps", click `</>` (if not created, create one first)
4. Copy the config object:

```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

## Step 5: Configure Environment Variables

1. In your project folder, rename `.env.local.example` to `.env.local`
2. Fill in the values from Step 4:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=your_appId
```

## Step 6: Run Locally

If dev server not already running:

```bash
npm run dev
```

Visit: **http://localhost:3000**

## Step 7: Test the App

1. **Sign Up** → Create admin account (email + password, select "Admin" role)
2. **Create Event** → Go to Admin Dashboard → Create a test event
3. **Switch User** → Logout → Sign up as Student
4. **View Events** → See events filtered by department
5. **Set Reminder** → Click "Remind Me" on an event
6. **Check Visual Highlight** → Upcoming events (within 2 days) have orange border

## Firestore Collections Structure (Auto-Create)

The app will create these collections on first use:

### `users` Collection
```
{
  email: "admin@example.com",
  role: "admin",
  createdAt: timestamp
}
```

### `events` Collection
```
{
  title: "Tech Workshop",
  description: "Learn Next.js",
  date: timestamp,
  department: "Engineering",
  createdBy: "admin@example.com",
  createdAt: timestamp
}
```

### `reminders` Collection
```
{
  userId: "firebase_user_id",
  eventId: "event_document_id",
  createdAt: timestamp
}
```

## Troubleshooting

### "Database not found" Error
- Make sure Firestore is created in production mode
- Check rules are published

### "API Key not valid" Error
- Verify `.env.local` has correct Firebase credentials
- Make sure variable names match exactly

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Can't Find Events
- Check Firestore data exists in console
- Verify user department matches event department

## Next: Deploy to Vercel

Once ready to go live:

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/event-reminder-app.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repo
4. **Environment Variables** → Add all from `.env.local`
5. Click **Deploy**

Your app is now live! 🎉

## Project Features Summary

✅ **Admin Dashboard**
- Create events with title, description, date, department
- Edit and delete events
- View all events

✅ **Student Dashboard**
- Filter events by department
- See visual highlights for upcoming events (within 2 days)
- Click "Remind Me" to save events
- Manage saved reminders

✅ **Authentication**
- Email/password signup
- Role-based access (admin/student)
- Persistent login state

✅ **Database**
- Cloud Firestore for real-time data
- Firebase Authentication for user management

## File Structure Reference

```
app/
  ├── page.js                 # Home page
  ├── layout.js               # Root layout
  ├── globals.css             # Global styles
  ├── auth/
  │   ├── login/page.js
  │   └── signup/page.js
  ├── admin/
  │   ├── page.js             # Dashboard
  │   ├── create/page.js      # Create event
  │   └── edit/[id]/page.js   # Edit event
  └── student/
      └── page.js             # View events

components/
  ├── Navbar.js
  └── EventCard.js

lib/
  ├── firebase.js             # Firebase setup
  ├── auth.js                 # Auth functions
  └── events.js               # Event/reminder functions
```

---

**Need help?** Check the [README.md](./README.md) for more details!
