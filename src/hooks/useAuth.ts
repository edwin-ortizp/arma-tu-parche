import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { UserData } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [userData, setUserData] = useState<UserData | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      
      if (u) {
        try {
          const ref = doc(db, 'users', u.uid)
          let snap = await getDoc(ref)
          
          if (!snap.exists()) {
            // Generar PIN único
            let pin = ''
            for (let i = 0; i < 5; i++) {
              pin = Math.floor(1000 + Math.random() * 9000).toString()
              const q = query(collection(db, 'users'), where('pin', '==', pin))
              const qs = await getDocs(q)
              if (qs.empty) break
            }
            
            const newUserData = {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              pin,
              role: 'user',
              connections: [],
            }
            
            await setDoc(ref, newUserData)
            snap = await getDoc(ref)
          }
          
          setUserData(snap.data() as UserData)
        } catch (error) {
          console.error('Error en la gestión del usuario:', error)
        }
      } else {
        setUserData(undefined)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, userData, loading }
}