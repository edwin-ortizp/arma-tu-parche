import { useEffect, useState } from 'react'
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { DatePlan } from '@/types'

export function useDates(isLogged: boolean = false) {
  const [dates, setDates] = useState<DatePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const snap = await getDocs(collection(db, 'dates'))
      const now = Date.now()
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<DatePlan, 'id'>) }))
      
      let filteredDates = items.filter(d => {
        const isActive = d.active && (!d.expiresAt || new Date(d.expiresAt).getTime() > now)
        const isAllowed = !isLogged ? d.relationType === 'solo' : true
        return isActive && isAllowed
      })

      // Si el usuario está logueado, filtrar planes ya interactuados
      if (isLogged && auth.currentUser) {
        const userId = auth.currentUser.uid
        
        // Obtener todos los likes/dislikes del usuario
        const likesSnap = await getDocs(collection(db, 'likes'))
        const userLikes = likesSnap.docs
          .map(d => d.data())
          .filter(like => like.userId === userId)
          .map(like => like.dateId)

        // Obtener todos los matches del usuario
        const matchesSnap = await getDocs(collection(db, 'matches'))
        const userMatches = matchesSnap.docs
          .map(d => d.data())
          .filter(match => match.users.includes(userId))
          .map(match => match.dateId)

        // Filtrar planes que ya fueron liked/disliked o que ya tienen match
        const interactedDateIds = [...new Set([...userLikes, ...userMatches])]
        filteredDates = filteredDates.filter(d => !interactedDateIds.includes(d.id))
      }
      
      setDates(filteredDates)
    } catch (err) {
      console.error('Error al cargar planes:', err)
      setError('Error al cargar planes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDates()
  }, [isLogged])

  const likeDate = async (dateId: string, selectedUserId: string) => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Usuario no autenticado')
    }
    
    try {
      // Crear el like del usuario actual con un ID más específico
      const userLikeId = `${user.uid}_${dateId}`
      const userLikeRef = doc(db, 'likes', userLikeId)
      
      await setDoc(userLikeRef, {
        userId: user.uid,
        dateId,
        liked: true,
        createdAt: Date.now(),
      }, { merge: true }) // Usar merge para evitar conflictos

      // Intentar verificar si el otro usuario ya dio like
      try {
        const otherLikeId = `${selectedUserId}_${dateId}`
        const otherLikeRef = doc(db, 'likes', otherLikeId)
        const otherLikeSnap = await getDoc(otherLikeRef)
        
        if (otherLikeSnap.exists()) {
          // Hay match! Intentar crear documento de match
          const matchId = `${[user.uid, selectedUserId].sort().join('_')}_${dateId}`
          const matchRef = doc(db, 'matches', matchId)
          
          try {
            // Verificar si el match ya existe
            const existingMatch = await getDoc(matchRef)
            
            if (!existingMatch.exists()) {
              await setDoc(matchRef, {
                users: [user.uid, selectedUserId],
                dateId,
                createdAt: Date.now(),
                plannedFor: '',
                status: 'pending'
              }, { merge: true })
              
              return { hasMatch: true, isNewMatch: true }
            } else {
              return { hasMatch: true, isNewMatch: false }
            }
          } catch (matchError) {
            console.error('Error creando match:', matchError)
            // Si falla crear el match, al menos el like se guardó
            return { hasMatch: false, isNewMatch: false }
          }
        }
        
        return { hasMatch: false, isNewMatch: false }
      } catch (readError) {
        console.error('Error verificando likes de otros usuarios:', readError)
        // Si no podemos leer otros likes, al menos guardamos el nuestro
        return { hasMatch: false, isNewMatch: false }
      }
      
    } catch (err) {
      console.error('Error al dar like:', err)
      throw new Error(`Error al procesar el like: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  const dislikeDate = async (dateId: string) => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Usuario no autenticado')
    }
    
    try {
      // Crear el dislike del usuario actual
      const userDislikeId = `${user.uid}_${dateId}`
      const userDislikeRef = doc(db, 'likes', userDislikeId)
      
      await setDoc(userDislikeRef, {
        userId: user.uid,
        dateId,
        liked: false, // false indica dislike
        createdAt: Date.now(),
      }, { merge: true })

      return { success: true }
    } catch (err) {
      console.error('Error al dar dislike:', err)
      throw new Error(`Error al procesar el dislike: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  return { dates, loading, error, likeDate, dislikeDate, refreshDates: loadDates }
}