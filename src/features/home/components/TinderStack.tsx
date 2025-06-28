import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TinderCard } from './TinderCard'
import { EmptyState } from '@/components/EmptyState'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DatePlan } from '@/types'

interface TinderStackProps {
  dates: DatePlan[]
  onLike: (dateId: string) => Promise<{ hasMatch: boolean; isNewMatch: boolean }>
  onPass: (dateId: string) => Promise<void>
  currentIndex?: number
  totalCount?: number
}

export function TinderStack({ dates, onLike, onPass, totalCount }: TinderStackProps) {
  const [currentDates, setCurrentDates] = useState(dates)
  const [isLiking, setIsLiking] = useState(false)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)

  // Actualizar currentDates cuando cambien las dates prop
  useEffect(() => {
    setCurrentDates(dates)
  }, [dates])

  const handleSwipe = async (direction: 'left' | 'right', dateId: string) => {
    setIsLiking(true)
    
    try {
      if (direction === 'right') {
        const result = await onLike(dateId)
        
        // Si hay match, mostrar animación
        if (result && result.hasMatch && result.isNewMatch) {
          setShowMatchAnimation(true)
          setTimeout(() => setShowMatchAnimation(false), 3000) // 3 segundos
        }
      } else {
        await onPass(dateId)
      }
      
      // Remove the card from the stack
      setCurrentDates(prev => prev.filter(d => d.id !== dateId))
    } catch (error) {
      console.error('Error handling swipe:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const resetStack = () => {
    setCurrentDates(dates)
  }

  if (currentDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] max-h-[600px] min-h-[400px] space-y-6">
        <EmptyState
          icon={<span className="text-4xl">💕</span>}
          title="¡Has visto todos los planes!"
          description="No hay más planes disponibles por ahora. Vuelve más tarde para descubrir nuevas actividades."
        />
        <Button
          onClick={resetStack}
          variant="outline"
          className="mt-4"
          disabled={dates.length === 0}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Ver de nuevo
        </Button>
      </div>
    )
  }

  // Only show up to 3 cards in the stack for performance
  const visibleCards = currentDates.slice(0, 3)

  return (
    <div className="relative mx-auto w-full flex flex-col items-center">
      {/* Card Stack Container */}
      <div className="relative w-full h-[80vh] max-h-[600px] min-h-[400px] flex items-center justify-center mb-6">
      <AnimatePresence>
        {visibleCards.map((date, index) => (
          <TinderCard
            key={date.id}
            date={date}
            onSwipe={handleSwipe}
            isTop={index === 0}
            zIndex={visibleCards.length - index}
            currentIndex={dates.length - currentDates.length + 1}
            totalCount={totalCount || dates.length}
          />
        ))}
      </AnimatePresence>
      
      {/* Loading overlay */}
      {isLiking && (
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-50">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
          </div>
        </div>
      )}
      
      {/* Match Animation */}
      {showMatchAnimation && (
        <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">¡MATCH!</h2>
            <p className="text-white text-lg">¡A ambos les gusta este plan!</p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-200"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-400"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      
    </div>
  )
}
