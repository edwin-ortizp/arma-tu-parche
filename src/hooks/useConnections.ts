import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, arrayUnion, query, collection, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { Connection } from '@/types'

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [pin, setPin] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadConnections = async () => {
      const user = auth.currentUser
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (!snap.exists()) return
        
        const data = snap.data()
        setPin(data?.pin)
        
        const ids: string[] = data?.connections || []
        const rels: Record<string, string> = data?.relationships || {}
        
        if (ids.length === 0) {
          setConnections([])
          return
        }
        
        const users = await Promise.all(
          ids.map(async id => {
            try {
              const u = await getDoc(doc(db, 'users', id))
              return {
                uid: id,
                name: u.data()?.displayName || 'Anon',
                relation: rels[id],
              }
            } catch (err) {
              console.error('Error al cargar conexión:', id, err)
              return { uid: id, name: 'Error' }
            }
          })
        )
        
        setConnections(users)
      } catch (err) {
        console.error('Error al cargar conexiones:', err)
        setError('Error al cargar conexiones')
      } finally {
        setLoading(false)
      }
    }

    loadConnections()
  }, [])

  const addConnection = async (pinInput: string, relationChoice: string) => {
    const user = auth.currentUser
    if (!user || !pinInput.trim()) {
      throw new Error('Usuario no autenticado o PIN vacío')
    }

    try {
      const q = query(collection(db, 'users'), where('pin', '==', pinInput))
      const qs = await getDocs(q)
      
      if (qs.empty) {
        throw new Error('PIN no encontrado')
      }
      
      const other = qs.docs[0]
      
      if (other.id === user.uid) {
        throw new Error('No puedes conectarte contigo mismo')
      }
      
      // Check if already connected
      if (connections.some(c => c.uid === other.id)) {
        throw new Error('Ya tienes esta conexión')
      }

      // Update current user's connections
      await updateDoc(doc(db, 'users', user.uid), {
        connections: arrayUnion(other.id),
        [`relationships.${other.id}`]: relationChoice,
      })

      // Update other user's connections
      await updateDoc(doc(db, 'users', other.id), {
        connections: arrayUnion(user.uid),
        [`relationships.${user.uid}`]: relationChoice,
      })

      // Update local state
      setConnections(prev => [...prev, { 
        uid: other.id, 
        name: other.data().displayName || 'Anon', 
        relation: relationChoice 
      }])
      
      return { success: true }
    } catch (err) {
      console.error('Error al agregar conexión:', err)
      throw err
    }
  }

  const copyPin = async () => {
    if (pin) {
      try {
        await navigator.clipboard.writeText(pin)
        return true
      } catch (err) {
        console.error('Error al copiar PIN:', err)
        return false
      }
    }
    return false
  }

  return { connections, pin, loading, error, addConnection, copyPin }
}