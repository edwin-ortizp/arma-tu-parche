import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { Button } from '@/components/ui/button'

interface DatePlan {
  id: string
  title: string
  description: string
  category: string
  duration: string
  cost: string
  image: string
  active: boolean
  bgGradient: string
  goodForToday: boolean
  city?: string
}

export default function Home() {
  const [dates, setDates] = useState<DatePlan[]>([])
  const [connections, setConnections] = useState<{ uid: string; name: string }[]>([])
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'dates'))
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<DatePlan, 'id'>) }))
      setDates(items.filter(d => d.active))

      const uid = auth.currentUser?.uid
      if (!uid) return
      const userSnap = await getDoc(doc(db, 'users', uid))
      const ids: string[] = userSnap.data()?.connections || []
      const users = await Promise.all(
        ids.map(async id => {
          const u = await getDoc(doc(db, 'users', id))
          return { uid: id, name: u.data()?.displayName || 'Anon' }
        })
      )
      setConnections(users)
    }
    load()
  }, [])

  const likeDate = async (dateId: string) => {
    const user = auth.currentUser
    if (!user || !selected) return
    try {
      await setDoc(doc(db, 'likes', `${user.uid}_${dateId}`), {
        userId: user.uid,
        dateId,
        liked: true,
        createdAt: Date.now(),
      })

      const likeRef = doc(db, 'likes', `${selected}_${dateId}`)
      const otherLike = await getDoc(likeRef)
      if (otherLike.exists()) {
        const matchRef = doc(db, 'matches', `${[user.uid, selected].sort().join('_')}_${dateId}`)
        const mSnap = await getDoc(matchRef)
        if (!mSnap.exists()) {
          await setDoc(matchRef, {
            users: [user.uid, selected],
            dateId,
            createdAt: Date.now(),
          })
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-4 space-y-4 w-full max-w-md">
      {connections.length === 0 ? (
        <p className="text-center">
          Aún no tienes conexiones. Agrega amigos con su PIN desde tu perfil.
        </p>
      ) : (
        <>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="border rounded p-2 w-full mb-2"
          >
            <option value="">Selecciona un amigo</option>
            {connections.map(c => (
              <option key={c.uid} value={c.uid}>
                {c.name}
              </option>
            ))}
          </select>
          {selected === '' && (
            <p className="text-center">Elige una conexión para ver planes.</p>
          )}
          {selected !== '' &&
            dates.map(date => (
              <div key={date.id} className="p-4 bg-white rounded shadow">
                <div className="text-2xl mb-1">{date.image}</div>
                <h2 className="font-bold">{date.title}</h2>
                <p className="text-sm mb-2">{date.description}</p>
                {date.city && <p className="text-xs text-gray-500">{date.city}</p>}
                <Button onClick={() => likeDate(date.id)} className="mt-2">
                  Me gusta
                </Button>
              </div>
            ))}
        </>
      )}
    </div>
  )
}
