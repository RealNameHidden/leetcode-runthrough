import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { useAuth } from './AuthContext'
import { db, isFirebaseConfigured } from './firebase'

const LS_KEY = 'artifact-revisions'

function encodePath(path) {
  return encodeURIComponent(path)
}

function decodePath(encoded) {
  return decodeURIComponent(encoded)
}

function parseLocalRevisions() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
    const out = {}
    for (const [path, val] of Object.entries(raw)) {
      out[path] = typeof val === 'object' && val != null && 'count' in val
        ? { count: val.count, lastDate: val.lastDate || '' }
        : { count: Number(val) || 0, lastDate: '' }
    }
    return out
  } catch { return {} }
}

export function useRevisions() {
  const { user } = useAuth()
  const [revisions, setRevisions] = useState(parseLocalRevisions)
  const revisionsRef = useRef(revisions)

  useEffect(() => { revisionsRef.current = revisions }, [revisions])

  useEffect(() => {
    if (!isFirebaseConfigured) return

    if (!user) {
      // Signed out — fall back to localStorage
      setRevisions(parseLocalRevisions())
      return
    }

    // Signed in — load from Firestore and migrate any local data
    async function load() {
      const colRef = collection(db, 'revisions', user.uid, 'problems')
      const snapshot = await getDocs(colRef)
      const remote = {}
      snapshot.forEach(snap => { remote[decodePath(snap.id)] = snap.data() })

      const local = parseLocalRevisions()
      const merged = { ...remote }
      const batch = writeBatch(db)
      let hasMigration = false

      for (const [path, localVal] of Object.entries(local)) {
        const remoteVal = remote[path]
        if (!remoteVal || localVal.count > (remoteVal.count ?? 0)) {
          merged[path] = localVal
          batch.set(doc(colRef, encodePath(path)), localVal)
          hasMigration = true
        }
      }

      if (hasMigration) {
        await batch.commit()
        localStorage.removeItem(LS_KEY)
      }

      setRevisions(merged)
    }

    load().catch(console.error)
  }, [user])

  function getRevisionCount(path) {
    const v = revisions[path]
    return typeof v === 'object' && v != null ? v.count : (Number(v) || 0)
  }

  function canLogRevisionToday(path) {
    const today = new Date().toISOString().slice(0, 10)
    const v = revisions[path]
    const lastDate = typeof v === 'object' && v != null ? v.lastDate : ''
    return lastDate !== today
  }

  const logRevision = useCallback(async (path) => {
    if (!path) return
    const today = new Date().toISOString().slice(0, 10)
    const v = revisionsRef.current[path]
    const lastDate = typeof v === 'object' && v != null ? v.lastDate : ''
    if (lastDate === today) return

    const count = (typeof v === 'object' && v != null ? v.count : Number(v) || 0) + 1
    const next = { count, lastDate: today }

    setRevisions(prev => ({ ...prev, [path]: next }))

    if (isFirebaseConfigured && user) {
      const docRef = doc(db, 'revisions', user.uid, 'problems', encodePath(path))
      await setDoc(docRef, next)
    } else {
      const updated = { ...revisionsRef.current, [path]: next }
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
    }
  }, [user])

  const resetRevisions = useCallback(async () => {
    setRevisions({})
    if (isFirebaseConfigured && user) {
      const colRef = collection(db, 'revisions', user.uid, 'problems')
      const snapshot = await getDocs(colRef)
      const batch = writeBatch(db)
      snapshot.forEach(snap => batch.delete(snap.ref))
      await batch.commit()
    } else {
      localStorage.removeItem(LS_KEY)
    }
  }, [user])

  return { revisions, getRevisionCount, canLogRevisionToday, logRevision, resetRevisions }
}
