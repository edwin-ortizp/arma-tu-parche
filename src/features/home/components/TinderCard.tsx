import { useState } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { Heart, X, MapPin, Clock, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DatePlan } from '@/types'

interface TinderCardProps {
  date: DatePlan
  onSwipe: (direction: 'left' | 'right', dateId: string) => void
  isTop: boolean
  zIndex: number
}

export function TinderCard({ date, onSwipe, isTop, zIndex }: TinderCardProps) {
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
      <Card className="w-full h-full overflow-hidden bg-white shadow-2xl border-0">
        {/* Imagen de fondo reducida */}
        <div className="relative h-2/5 bg-gray-200 overflow-hidden">
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
              className={`w-full h-full bg-gradient-to-br ${date.bgGradient || 'from-blue-400 to-cyan-500'} flex items-center justify-center`}
            >
              <div className="text-white text-center">
                <div className="text-5xl mb-2 drop-shadow-lg filter">
                  {date.image}
                </div>
                <div className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {date.category}
                </div>
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

          {/* Badge de categoría - solo para imágenes reales */}
          {(date.image.startsWith('http') || date.image.startsWith('/')) && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-gray-800 font-medium">
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

        {/* Contenido inferior ampliado */}
        <div className="h-3/5 p-6 flex flex-col justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
              {date.title}
            </h3>
            <p className="text-gray-600 text-base line-clamp-4 mb-4 leading-relaxed">
              {date.description}
            </p>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">{date.duration}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <span className="font-medium">{date.cost}</span>
            </div>
            {date.city && (
              <div className="flex items-center text-sm text-gray-600 col-span-2">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                <span className="font-medium">{date.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción - posicionados en los lados para no tapar información */}
        {isTop && (
          <>
            {/* Botón de dislike - lado izquierdo */}
            <div className="absolute bottom-6 left-6">
              <Button
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-3 border-red-500 bg-white hover:bg-red-50 group shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleButtonClick('left')}
              >
                <X className="w-8 h-8 text-red-500 group-hover:scale-125 transition-transform" />
              </Button>
            </div>
            
            {/* Botón de like - lado derecho */}
            <div className="absolute bottom-6 right-6">
              <Button
                size="lg"
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 group shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleButtonClick('right')}
              >
                <Heart className="w-8 h-8 text-white group-hover:scale-125 transition-transform" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  )
}
