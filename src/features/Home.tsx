import { useEffect, useState } from 'react'
import { collection, getDocs, setDoc, doc, query, where, getDoc } from 'firebase/firestore'
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

  useEffect(() => {
    const fetchDates = async () => {
      const snap = await getDocs(collection(db, 'dates'))
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<DatePlan, 'id'>) }))
      setDates(items.filter(d => d.active))
    }
    fetchDates()
  }, [])

  const likeDate = async (dateId: string) => {
    const user = auth.currentUser
    if (!user) return
    try {
      await setDoc(doc(db, 'likes', `${user.uid}_${dateId}`), {
        userId: user.uid,
        dateId,
        liked: true,
        createdAt: Date.now(),
      })
      const q = query(collection(db, 'likes'), where('dateId', '==', dateId), where('liked', '==', true))
      const snap = await getDocs(q)
      const userIds = snap.docs.map(d => d.data().userId)
      const other = userIds.find(id => id !== user.uid)
      if (other) {
        const matchRef = doc(db, 'matches', `${[user.uid, other].sort().join('_')}_${dateId}`)
        const mSnap = await getDoc(matchRef)
        if (!mSnap.exists()) {
          await setDoc(matchRef, {
            users: [user.uid, other],
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
      {dates.map(date => (
        <div key={date.id} className="p-4 bg-white rounded shadow">
          <div className="text-2xl mb-1">{date.image}</div>
          <h2 className="font-bold">{date.title}</h2>
          <p className="text-sm mb-2">{date.description}</p>
          {date.city && <p className="text-xs text-gray-500">{date.city}</p>}
          <Button onClick={() => likeDate(date.id)} className="mt-2">Me gusta</Button>
        </div>
      ))}
    </div>
  )
}
