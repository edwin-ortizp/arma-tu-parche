import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

interface Match {
  id: string
  dateId: string
  users: string[]
  createdAt: number
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [connCount, setConnCount] = useState(0)

  useEffect(() => {
    const fetchMatches = async () => {
      const uid = auth.currentUser?.uid
      if (!uid) return
      const userSnap = await getDoc(doc(db, 'users', uid))
      const connections: string[] = userSnap.data()?.connections || []
      setConnCount(connections.length)
      const q = query(collection(db, 'matches'), where('users', 'array-contains', uid))
      const snap = await getDocs(q)
      const list = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }))
        .filter(m => {
          const other = m.users.find(u => u !== uid)
          return other && connections.includes(other)
        })
      setMatches(list)
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
      {matches.length === 0 && (
        <p className="text-center">
          {connCount === 0
            ? 'Agrega conexiones con su PIN para ver coincidencias.'
            : 'No hay matches aún.'}
        </p>
      )}
    </div>
  )
}
