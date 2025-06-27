import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { Match } from '@/types'

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      const uid = auth.currentUser?.uid
      if (!uid) {
        setLoading(false)
        return
      }

      try {
        setError(null)
        
        // Get user connections
        const userSnap = await getDoc(doc(db, 'users', uid))
        const connections: string[] = userSnap.data()?.connections || []
        
        // Get all matches
        const matchesSnap = await getDocs(collection(db, 'matches'))
        const allMatches = matchesSnap.docs.map(d => ({ 
          id: d.id, 
          ...(d.data() as Omit<Match, 'id'>) 
        }))
        
        // Filter matches for current user with their connections
        const userMatches = allMatches.filter(m => {
          const other = m.users.find(u => u !== uid)
          return other && connections.includes(other)
        })
        
        setMatches(userMatches)
      } catch (err) {
        console.error('Error loading matches:', err)
        setError('Error al cargar matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  return { matches, loading, error }
}