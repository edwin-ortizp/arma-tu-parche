import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDates } from '@/hooks/useDates'
import { useConnections } from '@/hooks/useConnections'

export function useHomePage() {
  const [selected, setSelected] = useState<string>('')
  const [likingDateId, setLikingDateId] = useState<string | null>(null)
  
  const { user } = useAuth()
  const isLogged = !!user
  const { dates, loading: datesLoading, likeDate, dislikeDate, refreshDates } = useDates(isLogged)
  const { connections, loading: connectionsLoading } = useConnections()

  const handleLikeDate = async (dateId: string) => {
    if (!selected) return { hasMatch: false, isNewMatch: false }
    
    try {
      setLikingDateId(dateId)
      
      // Si es "solo", usar el ID del usuario como compañero
      const companionId = selected === 'solo' ? user?.uid || 'solo' : selected
      const result = await likeDate(dateId, companionId)
      
      // Solo mostrar feedback visual sutil, sin alerts molestos
      console.log(result.hasMatch ? 'Match creado! 🎉' : 'Plan guardado! ✨')
      
      // Refrescar la lista de dates para evitar duplicados
      if (result.hasMatch) {
        setTimeout(() => refreshDates(), 1000) // Pequeño delay para que se procese el match
      }
      
      return result
    } catch (error) {
      console.error('Error al procesar el like:', error)
      // Solo mostrar error si es crítico
      throw error
    } finally {
      setLikingDateId(null)
    }
  }

  const handlePassDate = async (dateId: string) => {
    try {
      await dislikeDate(dateId)
      console.log('Plan marcado como no interesante')
    } catch (error) {
      console.error('Error al marcar como no interesante:', error)
    }
  }

  return {
    // State
    selected,
    setSelected,
    likingDateId,
    
    // Data
    user,
    isLogged,
    dates,
    connections,
    
    // Loading states
    loading: datesLoading || connectionsLoading,
    
    // Actions
    handleLikeDate,
    handlePassDate,
  }
}