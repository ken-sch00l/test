# ✅ Pre-Demo Testing Checklist

Use this to verify all features work before demonstrating to stakeholders.

---

## 🔧 Setup Phase

- [ ] Clone/download repository
- [ ] Run `npm install`
- [ ] Create `.env.local` with Firebase credentials
- [ ] Create Firestore collections: `events`, `users`, `reminders`
- [ ] Add test events to `events` collection with:
  - [ ] Title, description, date, time
  - [ ] Department, location
  - [ ] **fbLink** (Facebook event URL)
  - [ ] createdBy (admin email)

---

## 🔐 Authentication Testing

### Sign Up
- [ ] Open `/auth/signup`
- [ ] Enter email: `student@test.com`
- [ ] Enter password: `Test123456`
- [ ] Click "Sign Up"
- [ ] Redirected to `/student` dashboard ✓

### Login
- [ ] Log out (click account menu)
- [ ] Open `/auth/login`
- [ ] Enter same email/password
- [ ] Click "Login"
- [ ] Redirected to `/student` dashboard ✓

### Admin Access
- [ ] Create admin account (optional): `admin@test.com`
- [ ] Access `/admin` page
- [ ] Can create events ✓

---

## 📅 Event Management Testing

### View Events
- [ ] Go to `/student`
- [ ] See list of events sorted by date
- [ ] Upcoming events have **⏰ badge** ✓
- [ ] Each event shows:
  - [ ] Title, description
  - [ ] 📅 Date, 🕐 Time
  - [ ] 🏢 Department, 📍 Location

### Create Event (Admin)
- [ ] Go to `/admin/create`
- [ ] Fill in all fields including **Facebook Event Link**
- [ ] Click "Create Event"
- [ ] Event appears in student list ✓

### Edit Event (Admin)
- [ ] Go to `/admin`
- [ ] Click event card
- [ ] Click "✏️ Edit"
- [ ] Modify fields
- [ ] Save changes ✓

### Delete Event (Admin)
- [ ] Go to `/admin`
- [ ] Click "🗑️ Delete" on event
- [ ] Confirm deletion
- [ ] Event removed from list ✓

---

## 👍 Facebook Integration Testing

- [ ] On event card, look for **"👍 More Details on Facebook"** button
- [ ] Button appears only if `fbLink` is set in Firestore
- [ ] Click button → opens Facebook event in new tab ✓
- [ ] Can see event details, RSVP, comments on FB ✓

---

## 🔔 Reminder System Testing

### Set Reminder
- [ ] On student event card, click **"🔔 Remind Me"**
- [ ] Green success notification appears ✓
- [ ] Notification auto-dismisses after 5 seconds ✓

### View Reminders
- [ ] Go to `/student/reminders`
- [ ] See list of all reminders set
- [ ] Each shows: event title + reminder time
- [ ] Shows **"⚙️ Edit"** and **"🗑️ Remove"** buttons ✓

### Edit Reminder Time
- [ ] Click **"⚙️ Edit"** on a reminder
- [ ] Modal opens with time options
- [ ] Select different time (e.g., "30 minutes")
- [ ] Click "Save"
- [ ] List updates with new time ✓

### Remove Reminder
- [ ] Click **"🗑️ Remove"** on a reminder
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Reminder removed from list ✓

---

## 🔔 Notifications Testing

### In-App Notifications
1. Open DevTools (F12) → Console
2. Run test commands:
   ```javascript
   window.showDemoAlert('✅ Test success notification', 'success')
   window.showDemoAlert('ℹ️ Test info notification', 'info')
   window.showDemoAlert('⚠️ Test warning notification', 'warning')
   window.showDemoAlert('❌ Test error notification', 'error')
   ```
3. Each notification appears top-right ✓
4. Shows correct icon ✓
5. Has close (✕) button ✓
6. Auto-dismisses after 5 seconds ✓

### Push Notifications (FCM)
- [ ] If FCM is configured:
  - [ ] Send test message from Firebase Console
  - [ ] If app is **open**: in-app notification displays
  - [ ] If app is **closed**: browser push notification shows
  - [ ] Can click notification to open app ✓

---

## 📱 PWA Testing

### Install App
1. Open app on **mobile device** (Chrome/Edge)
2. Look for **"Install"** button in address bar
   - OR tap ⋮ menu → "Install Student Event Reminder"
3. Click "Install"
   - [ ] App installs ✓
   - [ ] Appears on home screen ✓
   - [ ] Opens as standalone app (no address bar) ✓

### Offline Support
1. Open app on desktop
2. Open DevTools → Network tab
3. Select **"Offline"** from dropdown
4. Try navigating:
   - [ ] Home page loads ✓
   - [ ] Student dashboard loads (cached) ✓
   - [ ] Event details load ✓
5. Set Network back to **"Online"**

### Service Worker
1. Open DevTools → Application → Service Workers
   - [ ] Service Worker is registered ✓
   - [ ] Status shows "activated and running" ✓
2. Go to Cache Storage
   - [ ] `event-reminder-v1` cache exists ✓
   - [ ] Contains cached pages/assets ✓

---

## 🎨 UI/UX Testing

### Responsive Design
- [ ] Test on desktop (1920px) — layout looks good
- [ ] Test on tablet (768px) — layout adjusted
- [ ] Test on mobile (375px) — responsive, no overflow
- [ ] Buttons are touchable (minimum 44px height) ✓

### Navigation
- [ ] Sidebar visible and functional
- [ ] Links navigate to correct pages
- [ ] Back button works
- [ ] Mobile menu collapses properly

### Forms
- [ ] All inputs validate (required fields)
- [ ] Error messages display clearly
- [ ] Success messages show after submission
- [ ] Loading states work (buttons disabled, spinners show)

---

## ⚠️ Edge Cases & Error Handling

- [ ] Try creating event without required fields → error message
- [ ] Try removing event twice → handled gracefully
- [ ] Try accessing `/admin` without auth → redirected to login
- [ ] Try accessing `/student` without auth → redirected to login
- [ ] Firebase down → appropriate error message (not crash)
- [ ] Network error during reminder save → retry or error message
- [ ] Delete Firestore document while viewing → page doesn't crash

---

## 🚀 Performance Testing

- [ ] Page load time < 3 seconds
- [ ] Button clicks respond instantly (< 200ms)
- [ ] Notifications appear smoothly (no lag)
- [ ] Scrolling smooth on mobile
- [ ] No console errors (DevTools → Console)
- [ ] No console warnings (should be clean)

---

## 📊 Data Verification

### Firestore Data
- [ ] `events` collection has test events ✓
- [ ] Each event has required fields ✓
- [ ] `fbLink` field populated with valid URLs ✓
- [ ] `reminders` collection auto-created when students set reminders ✓
- [ ] Reminder documents have: userId, eventId, reminderTime ✓

### Local Storage / IndexedDB
- [ ] Open DevTools → Application → Storage
- [ ] IndexedDB has Firestore offline data ✓
- [ ] Service Worker cache has static assets ✓

---

## 🎬 Demo Script Test

1. Run through complete **DEMO_CHECKLIST.md** once
2. Time it (should take 5-7 minutes)
3. Practice talking points:
   - [ ] PWA benefits (offline, installable)
   - [ ] Firebase integration (real-time, cloud-synced)
   - [ ] Student workflow (discover → remind → notify)
   - [ ] Admin workflow (create → manage events)
   - [ ] Facebook integration (direct engagement)

---

## ✅ Final Checks (Day Before Demo)

- [ ] Delete test data / reset Firestore
- [ ] Refresh all test accounts
- [ ] Test on fresh Chrome profile (no cache)
- [ ] Test on actual mobile device (not just DevTools mobile view)
- [ ] Check internet connection is stable
- [ ] Have backup network (hotspot) ready
- [ ] Screenshot working state (for fallback if technical issues)
- [ ] Prepare talking points & demo script
- [ ] Have admin account ready for live event creation

---

## 🆘 Backup Plan

If something breaks during demo:

1. **Events not showing?**
   - Check Firestore data exists
   - Refresh page (F5)
   - Check Firebase credentials in console

2. **Reminders not saving?**
   - Check browser console for errors
   - Verify user is authenticated
   - Check Firestore write permissions

3. **Notifications not working?**
   - Try the `window.showDemoAlert()` command instead
   - Explain FCM setup in Firebase

4. **PWA not installing?**
   - Show on desktop version instead
   - Explain manifest.json and service worker benefits

5. **Network issues?**
   - Show offline mode (already cached)
   - Use local screenshots

---

## ✨ Demo Day Checklist

**2 hours before:**
- [ ] Restart dev server: `npm run dev`
- [ ] Open app: `http://localhost:3000`
- [ ] Test login/signup
- [ ] Test reminder workflow
- [ ] Test notifications

**30 minutes before:**
- [ ] Clear browser cache
- [ ] Open on mobile device
- [ ] Verify WiFi/hotspot working
- [ ] Have backup device ready

**Start of demo:**
- [ ] Open app on screen
- [ ] Start from home page
- [ ] Follow DEMO_CHECKLIST.md script
- [ ] Take questions at the end

---

Good luck with your demo! 🚀
