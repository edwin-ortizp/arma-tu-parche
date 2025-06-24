import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Sparkles } from 'lucide-react'

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
    <div className="px-6 py-4 space-y-8 w-full max-w-sm mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mb-6 shadow-lg">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Matches</h1>
        <p className="text-gray-600 text-lg">Planes en los que coincidieron</p>
      </div>

      {matches.length === 0 ? (
        <Card className="bg-gradient-to-br from-pink-50 to-red-50 border-pink-200">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {connCount === 0 ? '¡Conecta con Amigos!' : '¡Aún no hay matches!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {connCount === 0 
                ? 'Agrega conexiones con su PIN para ver coincidencias.' 
                : 'Cuando tú y un amigo den "me gusta" al mismo plan, aparecerá aquí.'}
            </p>
            <div className="inline-flex items-center text-sm text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
              💡 {connCount === 0 ? 'Ve a "Amigos" para conectarte' : 'Sigue explorando planes en "Inicio"'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Tus Matches</h2>
            <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </Badge>
          </div>
          
          {matches.map(m => (
            <Card key={m.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="h-2 bg-gradient-to-r from-pink-500 to-red-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mr-3">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">¡Match encontrado!</h3>
                      <p className="text-sm text-gray-600">Plan: {m.dateId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
