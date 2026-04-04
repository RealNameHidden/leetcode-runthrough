import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = loading, null = signed out, object = signed in
  const [user, setUser] = useState(isFirebaseConfigured ? undefined : null)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(auth, setUser)
  }, [])

  function signIn() {
    if (!isFirebaseConfigured) return Promise.resolve()
    return signInWithPopup(auth, googleProvider)
  }

  function signOut() {
    if (!isFirebaseConfigured) return Promise.resolve()
    return fbSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
