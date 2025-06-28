import { useState } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

  const handleButtonClick = (direction: 'left' | 'right') => {
    setExitX(direction === 'right' ? 1000 : -1000)
    onSwipe(direction, date.id)
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
      initial={{ scale: 1 - (3 - zIndex) * 0.05, y: (3 - zIndex) * 10 }}
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
          <div className="absolute top-4 right-4 z-50">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
              <span className="text-xs font-semibold text-white">
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
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/70 text-white font-medium backdrop-blur-sm">
                {date.category}
              </Badge>
            </div>
          )}

          {/* Badge "Good for today" */}
          {date.goodForToday && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white font-medium shadow-lg">
                ¡Perfecto para hoy!
              </Badge>
            </div>
          )}
        </div>

        {/* Contenido inferior con descripción */}
        <div className="h-3/5 bg-white flex flex-col">
          {/* Descripción del plan */}
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-lg text-gray-700 text-center line-clamp-4 leading-relaxed">
              {date.description}
            </p>
          </div>
          
          {/* Footer con botones integrados - solo visible en la carta superior */}
          {isTop && (
            <div className="border-t border-gray-100 p-4 bg-gray-50/50">
              <div className="flex justify-center space-x-8">
                {/* Botón de dislike */}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-20 h-20 rounded-full border-4 border-red-300 bg-white hover:bg-red-50 group shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  onClick={() => handleButtonClick('left')}
                >
                  <X className="w-12 h-12 text-red-500 group-hover:scale-110 transition-transform" />
                </Button>
                
                {/* Botón de like */}
                <Button
                  size="lg"
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 group shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  onClick={() => handleButtonClick('right')}
                >
                  <Heart className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </div>
          )}
        </div>

      </Card>
    </motion.div>
  )
}
