import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDates } from '@/hooks/useDates'
import { useConnections } from '@/hooks/useConnections'

export function useHomePage() {
  const [selected, setSelected] = useState<string>('')
  const [likingDateId, setLikingDateId] = useState<string | null>(null)
  
  const { user } = useAuth()
  const isLogged = !!user
  const { dates, loading: datesLoading, likeDate } = useDates(isLogged)
  const { connections, loading: connectionsLoading } = useConnections()

  const handleLikeDate = async (dateId: string) => {
    if (!selected) return
    
    try {
      setLikingDateId(dateId)
      const result = await likeDate(dateId, selected)
      
      if (result.hasMatch) {
        alert('¡Match creado! 🎉')
      } else {
        alert('¡Plan guardado! ✨')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al procesar el like')
    } finally {
      setLikingDateId(null)
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
  }
}