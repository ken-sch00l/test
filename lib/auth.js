// Authentication utility functions
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export async function signup(email, password, role = 'student') {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Store user data in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
      })
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError)
      throw new Error('Failed to save user data: ' + firestoreError.message)
    }

    return { uid: user.uid, email: user.email }
  } catch (error) {
    console.error('Signup error:', error)
    throw new Error(error.message)
  }
}

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { uid: userCredential.user.uid, email: userCredential.user.email }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function logout() {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function getUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data().role
    }
    return null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

export async function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const role = await getUserRole(user.uid)
        resolve({ uid: user.uid, email: user.email, role })
      } else {
        resolve(null)
      }
      unsubscribe()
    })
  })
}
