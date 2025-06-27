import { useEffect, useState } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { Match, Connection } from '@/types'

interface MatchWithFriend extends Match {
  friendInfo?: Connection
  friendName?: string
}

export function useMatches() {
  const [matches, setMatches] = useState<MatchWithFriend[]>([])
  const [friends, setFriends] = useState<Connection[]>([])
  const [selectedFriend, setSelectedFriend] = useState<string>('all')
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
      
      // Get friends info for each match
      const matchesWithFriends: MatchWithFriend[] = await Promise.all(
        userMatches.map(async (match): Promise<MatchWithFriend> => {
          const friendId = match.users.find(id => id !== uid)
          if (friendId) {
            try {
              const friendDoc = await getDoc(doc(db, 'users', friendId))
              if (friendDoc.exists()) {
                const friendData = friendDoc.data()
                return {
                  ...match,
                  friendInfo: {
                    uid: friendId,
                    name: friendData.displayName || friendData.email || 'Usuario',
                    relation: friendData.relation || 'Amigo'
                  },
                  friendName: friendData.displayName || friendData.email || 'Usuario'
                }
              }
            } catch (error) {
              console.error('Error fetching friend info:', error)
            }
          }
          return {
            ...match,
            friendName: 'Usuario desconocido'
          }
        })
      )
      
      // Extract unique friends for filter
      const uniqueFriends = matchesWithFriends
        .map(m => m.friendInfo)
        .filter((friendInfo): friendInfo is Connection => friendInfo !== undefined)
        .reduce((acc, friendInfo) => {
          if (!acc.find(f => f.uid === friendInfo.uid)) {
            acc.push(friendInfo)
          }
          return acc
        }, [] as Connection[])
      
      console.log('Matches encontrados:', matchesWithFriends)
      setMatches(matchesWithFriends)
      setFriends(uniqueFriends)
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Error al cargar matches')
    } finally {
      setLoading(false)
    }
  }

  // Filter matches based on selected friend
  const filteredMatches = selectedFriend === 'all' 
    ? matches 
    : matches.filter(m => m.friendInfo?.uid === selectedFriend)

  useEffect(() => {
    fetchMatches()
    
    // Refresh matches every 30 seconds to catch new ones
    const interval = setInterval(fetchMatches, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { 
    matches: filteredMatches, 
    allMatches: matches,
    friends, 
    selectedFriend, 
    setSelectedFriend,
    loading, 
    error, 
    refetch: fetchMatches 
  }
}