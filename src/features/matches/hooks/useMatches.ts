import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { Match } from '@/types'

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = async () => {
    const uid = auth.currentUser?.uid
    if (!uid) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      // Get all matches where current user participates
      const matchesSnap = await getDocs(collection(db, 'matches'))
      const allMatches = matchesSnap.docs.map(d => ({ 
        id: d.id, 
        ...(d.data() as Omit<Match, 'id'>) 
      }))
      
      // Filter matches for current user
      const userMatches = allMatches.filter(m => m.users.includes(uid))
      
      console.log('Matches encontrados:', userMatches)
      setMatches(userMatches)
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Error al cargar matches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
    
    // Refresh matches every 30 seconds to catch new ones
    const interval = setInterval(fetchMatches, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { matches, loading, error, refetch: fetchMatches }
}