import { useEffect, useState } from 'react'
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { DatePlan } from '@/types'

export function useDates(isLogged: boolean = false) {
  const [dates, setDates] = useState<DatePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const snap = await getDocs(collection(db, 'dates'))
        const now = Date.now()
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<DatePlan, 'id'>) }))
        
        const filteredDates = items.filter(d => {
          const isActive = d.active && (!d.expiresAt || new Date(d.expiresAt).getTime() > now)
          const isAllowed = !isLogged ? d.relationType === 'solo' : true
          return isActive && isAllowed
        })
        
        setDates(filteredDates)
      } catch (err) {
        console.error('Error al cargar planes:', err)
        setError('Error al cargar planes')
      } finally {
        setLoading(false)
      }
    }

    loadDates()
  }, [isLogged])

  const likeDate = async (dateId: string, selectedUserId: string) => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Usuario no autenticado')
    }
    
    try {
      await setDoc(doc(db, 'likes', `${user.uid}_${dateId}`), {
        userId: user.uid,
        dateId,
        liked: true,
        createdAt: Date.now(),
      })

      // Verificar si hay match
      const likeRef = doc(db, 'likes', `${selectedUserId}_${dateId}`)
      const otherLike = await getDoc(likeRef)
      
      if (otherLike.exists()) {
        const matchRef = doc(db, 'matches', `${[user.uid, selectedUserId].sort().join('_')}_${dateId}`)
        const mSnap = await getDoc(matchRef)
        
        if (!mSnap.exists()) {
          const plannedFor = prompt(
            '¿Cuándo te gustaría realizar este plan? (Ej: 2025-07-02 o "próximo fin de semana")'
          ) || ''
          
          await setDoc(matchRef, {
            users: [user.uid, selectedUserId],
            dateId,
            createdAt: Date.now(),
            plannedFor,
          })
          
          return { hasMatch: true }
        }
      }
      
      return { hasMatch: false }
    } catch (err) {
      console.error('Error al dar like:', err)
      throw new Error('Error al procesar el like')
    }
  }

  return { dates, loading, error, likeDate }
}