# Event Reminder App

A beginner-friendly event management app built with **Next.js**, **Firebase**, and **Vercel**.

## Features

- ✅ **User Authentication**: Email/password signup and login with Firebase
- ✅ **Two User Roles**: Admin (manage events) and Student (view & remind)
- ✅ **Event Management**: Admins can create, edit, and delete events
- ✅ **Event Filtering**: Students filter events by department
- ✅ **Visual Reminders**: Events within 2 days are highlighted
- ✅ **Reminder System**: Students can "Remind Me" on events
- ✅ **Department Categories**: 6 departments (Engineering, Business, Arts, Science, Medicine, Law)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Styling**: Inline CSS (simple, beginner-friendly)
- **Deployment**: Vercel

## Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── auth/
│   │   ├── login/page.js        # Login page
│   │   └── signup/page.js       # Signup page
│   ├── admin/
│   │   ├── page.js              # Admin dashboard
│   │   ├── create/page.js       # Create event form
│   │   └── edit/[id]/page.js    # Edit event form
│   ├── student/
│   │   └── page.js              # Student dashboard (view events & reminders)
│   ├── page.js                  # Home page
│   ├── layout.js                # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── Navbar.js                # Navigation component
│   └── EventCard.js             # Event card component
├── lib/
│   ├── firebase.js              # Firebase configuration
│   ├── auth.js                  # Authentication utilities
│   └── events.js                # Event & reminder utilities
├── public/                       # Static assets
├── package.json
├── jsconfig.json
├── next.config.js
└── .env.local.example           # Environment variables template
```

## Setup Instructions

### 1. Clone/Setup the Project

```bash
cd your-project-folder
npm install
```

### 2. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable these services:
   - **Authentication**: Email/Password method
   - **Firestore Database**: Create in production mode
4. Get your Firebase credentials from Project Settings

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Set Up Firestore Indexes (Optional but Recommended)

Open Firestore Console and create composite indexes:
- **Collection**: `events`, **Fields**: `department` (Ascending), `date` (Ascending)

(You can skip this initially; Firebase will suggest it when needed)

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## User Guide

### For Admins

1. **Sign Up** as Admin role
2. Go to **Admin Dashboard**
3. Click **Create New Event**
4. Fill in: Title, Description, Date, Department
5. **Edit** or **Delete** events from the list

### For Students

1. **Sign Up** as Student role
2. Go to **My Events**
3. Select your department from the dropdown
4. Click **🔔 Remind Me** on events you want to track
5. Upcoming events (within 2 days) are highlighted with 🟧 orange border

## Firestore Database Structure

### Collections

**`users`**
```
{
  email: string
  role: "admin" | "student"
  createdAt: timestamp
}
```

**`events`**
```
{
  title: string
  description: string
  date: timestamp
  department: string
  createdBy: string (admin email)
  createdAt: timestamp
}
```

**`reminders`**
```
{
  userId: string
  eventId: string
  createdAt: timestamp
}
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **New Project**
3. Import your GitHub repo
4. Add Environment Variables:
   - Copy all from `.env.local`
5. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`

## Code Style & Best Practices

- **No Complex Patterns**: Everything is straightforward
- **Inline Styles**: Easy to understand and modify
- **Comments**: Helpful explanations throughout
- **Error Handling**: Try-catch blocks for Firebase operations
- **Auth State**: Uses Firebase's `onAuthStateChanged()` for real-time updates

## Common Issues & Solutions

### Issue: "Environment variables not set"
**Solution**: Make sure `.env.local` exists with all required variables

### Issue: "Firestore quota exceeded"
**Solution**: Go to Firebase Console > Quotas, or upgrade to Blaze plan

### Issue: "Cannot read property 'toDate' of undefined"
**Solution**: Ensure dates in Firestore are stored as Timestamp objects (handled in code)

### Issue: Events not showing
**Solution**: Check Firestore indexes; Firebase will suggest them automatically

## Next Steps to Enhance

- Add profile editing for students
- Email notifications (requires Firebase Functions)
- Event search functionality
- User dashboard with statistics
- Event attendance tracking
- Dark mode toggle
- Mobile app with React Native

## Support

For Firebase issues: https://firebase.google.com/docs
For Next.js issues: https://nextjs.org/docs
For Vercel deployment: https://vercel.com/docs

---

**Happy coding! 🚀**
