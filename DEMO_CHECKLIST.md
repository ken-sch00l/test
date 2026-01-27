# 📱 Student Event Reminder App - Demo Checklist

A step-by-step guide to showcase your app's full capabilities.

---

## 🎯 Pre-Demo Setup

### 1. **Environment Variables** (`c:\Users\Kenjie\project 1\test\.env.local`)
Make sure these are set:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. **Start Dev Server**
```bash
npm run dev
```
App runs at: `http://localhost:3000`

### 3. **Firestore Test Data**
Add sample events in Firebase Console (`events` collection):
```json
{
  "title": "Annual Tech Conference",
  "description": "Join us for talks on AI, Web3, and Modern DevOps",
  "date": "2024-02-15T10:00:00Z",
  "department": "Computer Science",
  "location": "https://tech-conference.example.com",
  "fbLink": "https://www.facebook.com/events/your-event-id",
  "createdBy": "Admin"
}
```

---

## 📋 Demo Flow (5-7 minutes)

### **Step 1: PWA Installation** (60 seconds)
**Objective:** Show the app is installable on mobile/desktop

1. Open the app in Chrome/Edge on **mobile device**
2. Tap the **address bar** → look for **"Install app"** button
   - OR tap **⋮ menu** → **"Install Student Event Reminder"**
3. Tap **"Install"** → app appears on home screen ✅
4. Launch the app from home screen → shows as **standalone app**

**Demo talking points:**
- ✅ PWA: Works offline (cached pages)
- ✅ No need for app store distribution
- ✅ One-click install experience

---

### **Step 2: Authentication** (45 seconds)
**Objective:** Show sign-up and login flow

1. Click **"Get Started"** button on home page
2. Create test account:
   - Email: `student@example.com`
   - Password: `Test123456`
3. Tap **"Sign Up"**
4. Redirected to **Student Dashboard** ✅

**Demo talking points:**
- Secure Firebase Authentication
- Role-based access (Student vs Admin)

---

### **Step 3: Browse & Filter Events** (90 seconds)
**Objective:** Show event discovery and filtering

1. On **Student Dashboard** (`/student`), scroll through upcoming events
2. Events displayed by **date** (oldest first)
3. **Upcoming events** (today/tomorrow) have **⏰ orange badge**

**Show filtering in action:**
- Each event card shows:
  - 📅 Date
  - 🕐 Time
  - 🏢 Department
  - 📍 Location

**Demo talking points:**
- Events are **sorted by date**
- Easy-to-scan cards with key info
- **Real-time** data from Firestore

---

### **Step 4: Facebook Integration** (45 seconds)
**Objective:** Show event details linking to Facebook

1. Find an event with **fbLink** in Firestore
2. On event card, click **"👍 More Details on Facebook"**
3. Opens event's **Facebook post in new tab** ✅
4. Shows event details, comments, RSVP options

**Demo talking points:**
- Seamless integration with Facebook events
- Students can engage directly on social media
- All event details centralized + linked

---

### **Step 5: Set Event Reminders** (2 minutes)
**Objective:** Show reminder management workflow

#### **Part A: Add Reminder**
1. Click **"🔔 Remind Me"** on any event card
2. Reminder is **instantly saved** to Firestore
3. Shows success notification (green ✅)

#### **Part B: View Reminders**
1. Click **"Reminders"** in sidebar → `/student/reminders`
2. See list of all reminders you've set
3. Each reminder shows:
   - Event title
   - Default reminder time: **"1 day before"**
   - ⚙️ Edit button
   - 🗑️ Remove button

#### **Part C: Customize Reminder**
1. Click **"⚙️ Edit"** on any reminder
2. Modal opens to change reminder time
3. Select different time (e.g., "30 minutes", "2 hours")
4. Click **"Save"**
5. Reminder updated ✅

**Demo talking points:**
- Students control **which events** they get reminded about
- Flexible **reminder timing** (1 day, 1 hour, 30 min before)
- All reminders **persist in Firestore** (cloud sync)

---

### **Step 6: Push Notifications** (1 minute)
**Objective:** Show Firebase Cloud Messaging

⚠️ **Note:** Requires Firebase Cloud Messaging setup. For demo, use:

#### **Option A: Manual Demo**
1. Open **DevTools** → **Console**
2. Run:
   ```javascript
   window.showDemoAlert('🔔 Reminder: Annual Tech Conference starts in 1 hour!', 'info')
   ```
3. Green notification appears top-right ✅

#### **Option B: Service Worker Notifications** (if FCM configured)
1. Send test FCM message from Firebase Console
2. If **foreground**: In-app notification displays
3. If **background**: Browser push notification shows
4. Click notification → Opens `/student` page

**Demo talking points:**
- **Service Worker** enables background notifications
- Works **offline** (cached & queued)
- **Firebase Cloud Messaging** for real push notifications

---

### **Step 7: Offline Functionality** (45 seconds)
**Objective:** Show PWA offline capabilities

1. Open **DevTools** → **Network tab**
2. Select **"Offline"** dropdown
3. Try navigating pages → **still works!** ✅
4. Cached content loads from service worker

**Demo talking points:**
- All pages are **cached**
- Works **without internet**
- Perfect for **subway commutes, flights, etc.**

---

## 🎬 Demo Script Summary

**Narrator:**
> "This is the Student Event Reminder App — a modern PWA that keeps students updated on campus events.
>
> **First**, let's install it on our phone. Just tap install... and boom, it's on our home screen as a native app.
>
> **Next**, we log in as a student and see all upcoming events from our department.
>
> **Notice** the orange badge on today's event — easy to spot what's happening now.
>
> **Each event** has a Facebook link, so students can engage directly with the event page.
>
> **Here's the magic**: Click 'Remind Me' and we're done. The app remembers we want a reminder.
>
> **Jump to Reminders** — see all events we've opted into. We can edit when we want to be reminded.
>
> **When the time comes**, we get a push notification — even if the app is closed or we're offline.
>
> This PWA is installable, works offline, and syncs everything to the cloud. Perfect for students!"

---

## ✅ Feature Checklist

- [ ] PWA installs on mobile/desktop
- [ ] Can navigate offline
- [ ] User authentication works
- [ ] Events display correctly
- [ ] Facebook links work
- [ ] Can set reminders
- [ ] Reminders list shows all saved reminders
- [ ] Can edit reminder times
- [ ] Notifications display in-app
- [ ] (Optional) FCM push notifications work

---

## 🚀 Next Steps for Production

1. **Add more events** to Firestore (currently just test data)
2. **Set up Firebase Cloud Messaging** properly with credentials
3. **Enable Admin panel** to create/manage events
4. **Add real push notifications** schedule via Cloud Functions
5. **Deploy** to Vercel, Firebase Hosting, or your server
6. **Add more departments/filtering** options
7. **User notifications preferences** (notification opt-in/out)
8. **Analytics** to track event engagement

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Events not loading | Check Firebase credentials in `.env.local` |
| Can't install PWA | Use HTTPS (localhost OK for dev), check manifest.json |
| Notifications not working | Enable notification permission, check FCM setup |
| Offline mode not working | Check service worker in DevTools → Application tab |
| Can't log in | Verify Firebase Auth enabled, check email/password |

---

## 📞 Support

For questions or issues, check:
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Web PWA Docs](https://web.dev/progressive-web-apps/)
