import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '@/firebase'

interface Match {
  id: string
  dateId: string
  users: string[]
  createdAt: number
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const fetchMatches = async () => {
      const uid = auth.currentUser?.uid
      if (!uid) return
      const q = query(collection(db, 'matches'), where('users', 'array-contains', uid))
      const snap = await getDocs(q)
      setMatches(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Match, 'id'>) })))
    }
    fetchMatches()
  }, [])

  return (
    <div className="p-4 space-y-4 w-full max-w-md">
      {matches.map(m => (
        <div key={m.id} className="p-4 bg-white rounded shadow">
          <div>Coincidieron en el plan {m.dateId}</div>
        </div>
      ))}
      {matches.length === 0 && <p>No hay matches aún.</p>}
    </div>
  )
}
