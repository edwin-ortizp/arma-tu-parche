import { useEffect, useState } from 'react'
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { DatePlan } from '@/types'

export function useDates(isLogged: boolean = false, selectedCompanion: string = '') {
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

      // Si el usuario está logueado y hay compañero seleccionado, filtrar planes ya interactuados con ese compañero específico
      if (isLogged && auth.currentUser && selectedCompanion) {
        const userId = auth.currentUser.uid
        const companionId = selectedCompanion === 'solo' ? userId : selectedCompanion
        
        // Obtener likes/dislikes específicos para esta combinación usuario-compañero
        const likesSnap = await getDocs(collection(db, 'likes'))
        const userCompanionLikes = likesSnap.docs
          .map(d => d.data())
          .filter(like => {
            // Verificar interacciones para esta combinación específica
            const isUserLike = like.userId === userId
            const isCompanionContext = like.companionId === companionId || 
                                     (!like.companionId && selectedCompanion === 'solo') // Backward compatibility
            return isUserLike && isCompanionContext
          })
          .map(like => like.dateId)

        // Obtener matches específicos para esta combinación usuario-compañero
        const matchesSnap = await getDocs(collection(db, 'matches'))
        const userCompanionMatches = matchesSnap.docs
          .map(d => d.data())
          .filter(match => {
            const hasUser = match.users.includes(userId)
            const hasCompanion = match.users.includes(companionId)
            return hasUser && hasCompanion
          })
          .map(match => match.dateId)

        // Filtrar solo planes que ya fueron interactuados con este compañero específico
        const interactedWithCompanionIds = [...new Set([...userCompanionLikes, ...userCompanionMatches])]
        filteredDates = filteredDates.filter(d => !interactedWithCompanionIds.includes(d.id))
      }
      
      // Aleatorizar el orden de los planes
      const shuffledDates = filteredDates.sort(() => Math.random() - 0.5)
      
      setDates(shuffledDates)
    } catch (err) {
      console.error('Error al cargar planes:', err)
      setError('Error al cargar planes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDates()
  }, [isLogged, selectedCompanion])

  const likeDate = async (dateId: string, selectedUserId: string) => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Usuario no autenticado')
    }
    
    try {
      // Crear el like del usuario actual con contexto de compañero
      const companionId = selectedUserId === 'solo' ? user.uid : selectedUserId
      const userLikeId = `${user.uid}_${companionId}_${dateId}`
      const userLikeRef = doc(db, 'likes', userLikeId)
      
      await setDoc(userLikeRef, {
        userId: user.uid,
        dateId,
        companionId,
        liked: true,
        createdAt: Date.now(),
      }, { merge: true }) // Usar merge para evitar conflictos

      // Si es "solo", no hay match posible
      if (selectedUserId === 'solo' || selectedUserId === user.uid) {
        return { hasMatch: false, isNewMatch: false }
      }

      // Intentar verificar si el otro usuario ya dio like para este mismo contexto
      try {
        const otherLikeId = `${selectedUserId}_${user.uid}_${dateId}`
        const otherLikeRef = doc(db, 'likes', otherLikeId)
        const otherLikeSnap = await getDoc(otherLikeRef)
        
        if (otherLikeSnap.exists() && otherLikeSnap.data()?.liked === true) {
          // Hay match! Intentar crear documento de match con contexto de compañeros
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

  const dislikeDate = async (dateId: string, companionId: string = '') => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Usuario no autenticado')
    }
    
    try {
      // Crear el dislike del usuario actual con contexto de compañero
      const contextCompanionId = companionId === 'solo' ? user.uid : companionId
      const userDislikeId = `${user.uid}_${contextCompanionId}_${dateId}`
      const userDislikeRef = doc(db, 'likes', userDislikeId)
      
      await setDoc(userDislikeRef, {
        userId: user.uid,
        dateId,
        companionId: contextCompanionId,
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