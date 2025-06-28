import { useState } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, X } from 'lucide-react'
import type { DatePlan } from '@/types'

interface TinderCardProps {
  date: DatePlan
  onSwipe: (direction: 'left' | 'right', dateId: string) => void
  isTop: boolean
  zIndex: number
  currentIndex?: number
  totalCount?: number
}

export function TinderCard({ date, onSwipe, isTop, zIndex, currentIndex, totalCount }: TinderCardProps) {
  const [exitX, setExitX] = useState(0)
  const [rotation, setRotation] = useState(0)
  const controls = useAnimation()

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 150
    const velocity = info.velocity.x
    const offset = info.offset.x

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= threshold) {
      const direction = offset > 0 ? 'right' : 'left'
      setExitX(direction === 'right' ? 1000 : -1000)
      onSwipe(direction, date.id)
    } else {
      // Return to center
      controls.start({ x: 0, rotate: 0 })
      setRotation(0)
    }
  }

  const handleDrag = (_event: any, info: PanInfo) => {
    const x = info.offset.x
    const newRotation = x * 0.1
    setRotation(newRotation)
  }


  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      animate={controls}
      initial={{ 
        scale: 1 - (3 - zIndex) * 0.03, 
        y: (3 - zIndex) * 5
      }}
      exit={{ x: exitX, rotate: exitX > 0 ? 30 : -30, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileDrag={{ 
        scale: 1.05,
        rotate: rotation,
      }}
    >
      <Card className="w-full h-full overflow-hidden bg-white shadow-2xl border-0 relative">
        {/* Contador en la esquina superior derecha - solo en tarjeta activa */}
        {isTop && currentIndex && totalCount && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 shadow-xl border border-white/20">
              <span className="text-xs sm:text-sm font-semibold text-white">
                {currentIndex} / {totalCount}
              </span>
            </div>
          </div>
        )}
        
        {/* Imagen de fondo - 40% de la tarjeta ocupando todo el ancho */}
        <div className="relative h-2/5 bg-gray-200 overflow-hidden rounded-t-xl">
          {/* Detectar si es una URL de imagen o un emoji */}
          {date.image.startsWith('http') || date.image.startsWith('/') ? (
            <img 
              src={date.image} 
              alt={date.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Si la imagen falla, mostrar fallback con emoji y gradiente
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.style.background = `linear-gradient(135deg, ${date.bgGradient || 'from-purple-400 to-pink-400'})`
                  const fallbackDiv = document.createElement('div')
                  fallbackDiv.className = 'absolute inset-0 flex items-center justify-center'
                  fallbackDiv.innerHTML = `
                    <div class="text-white text-center">
                      <div class="text-6xl mb-2">🎯</div>
                      <div class="text-lg font-semibold">${date.category}</div>
                    </div>
                  `
                  parent.appendChild(fallbackDiv)
                }
              }}
            />
          ) : (
            /* Si no es URL, mostrar como emoji con gradiente de fondo */
            <div 
              className={`w-full h-full bg-gradient-to-br ${date.bgGradient || 'from-blue-400 to-cyan-500'} flex flex-col items-center justify-center p-6`}
            >
              <div className="text-white text-center">
                <div className="text-6xl drop-shadow-lg filter mb-4">
                  {date.image}
                </div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  {date.title}
                </h2>
              </div>
            </div>
          )}
          
          {/* Gradiente overlay solo para imágenes reales */}
          {(date.image.startsWith('http') || date.image.startsWith('/')) && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
          )}
          
          {/* Overlay para mostrar dirección del swipe */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: Math.abs(rotation) > 5 ? 1 : 0,
            }}
          >
            {rotation > 5 && (
              <div className="bg-green-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold transform rotate-12 shadow-lg">
                ME GUSTA
              </div>
            )}
            {rotation < -5 && (
              <div className="bg-red-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold transform -rotate-12 shadow-lg">
                NO GRACIAS
              </div>
            )}
          </motion.div>

          {/* Badge de categoría - para imágenes reales */}
          {(date.image.startsWith('http') || date.image.startsWith('/')) && (
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
              <Badge className="bg-black/70 text-white font-semibold backdrop-blur-sm border-white/30 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 shadow-xl text-xs sm:text-sm">
                {date.category}
              </Badge>
            </div>
          )}

          {/* Badge "Good for today" - reposicionado para evitar overlap */}
          {date.goodForToday && (
            <div className={`absolute z-40 ${
              isTop && currentIndex && totalCount 
                ? 'top-12 sm:top-16 right-2 sm:right-4' 
                : 'top-2 sm:top-4 right-2 sm:right-4'
            }`}>
              <Badge className="bg-green-500 text-white font-semibold shadow-xl hover:bg-green-600 border border-green-400 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                ¡Perfecto para hoy!
              </Badge>
            </div>
          )}
        </div>

        {/* Contenido inferior con descripción */}
        <div className="h-3/5 bg-white flex flex-col">
          {/* Título y descripción del plan */}
          <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center line-clamp-2">
              {date.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 text-center line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {date.description}
            </p>
            {date.explanation && (
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs sm:text-sm text-blue-700 text-center line-clamp-2 leading-relaxed">
                  💡 {date.explanation}
                </p>
              </div>
            )}
            {/* Información adicional compacta */}
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                ⏱️ {date.duration}
              </span>
              <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                💰 {date.cost}
              </span>
              {date.city && (
                <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  📍 {date.city}
                </span>
              )}
            </div>
          </div>
          
          {/* Footer con botones - solo visible en la tarjeta superior */}
          {isTop && (
            <div className="border-t border-gray-200 bg-white p-4 flex justify-center rounded-b-xl shadow-sm">
              <div className="flex space-x-6">
                {/* Botón de dislike */}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full border-2 border-red-300 bg-white hover:bg-red-50 group shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  onClick={() => onSwipe('left', date.id)}
                >
                  <X className="w-7 h-7 text-red-500 group-hover:scale-110 transition-transform" />
                </Button>
                
                {/* Botón de like */}
                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 group shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  onClick={() => onSwipe('right', date.id)}
                >
                  <Heart className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </div>
          )}
        </div>

      </Card>
    </motion.div>
  )
}
