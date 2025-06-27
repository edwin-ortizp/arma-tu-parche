import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Clock, DollarSign } from 'lucide-react'
import type { DatePlan } from '@/types'

interface DateCardProps {
  date: DatePlan
  onLike?: (dateId: string) => void
  showLikeButton?: boolean
  isLoading?: boolean
}

export function DateCard({ date, onLike, showLikeButton = false, isLoading = false }: DateCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 animate-fade-in">
      <div className={`h-32 md:h-36 bg-gradient-to-r ${date.bgGradient || 'from-blue-500 to-purple-500'} flex items-center justify-center relative`}>
        <div className="text-center">
          <div className="text-5xl md:text-6xl mb-2 drop-shadow-lg">
            {date.image}
          </div>
          <span className="text-xs md:text-sm font-medium bg-white bg-opacity-30 backdrop-blur-sm px-3 py-1 rounded-full text-white">
            {date.category}
          </span>
        </div>
        {date.goodForToday && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            PERFECTO PARA HOY
          </div>
        )}
      </div>
      
      <CardContent className="p-4 md:p-5">
        <div className="mb-4">
          <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">{date.title}</h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">{date.description}</p>
        </div>
        
        <div className="space-y-3">
          {/* Details */}
          <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-4">
            {date.duration && (
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{date.duration}</span>
              </div>
            )}
            {date.cost && (
              <div className="flex items-center space-x-1">
                <DollarSign size={14} />
                <span>{date.cost}</span>
              </div>
            )}
            {date.city && (
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>{date.city}</span>
              </div>
            )}
          </div>
          
          {/* Badges - Only show non-category badges since category is now in header */}
          {(date.relationType || date.experienceType) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {date.relationType && (
                <Badge variant="outline">{date.relationType}</Badge>
              )}
              {date.experienceType && (
                <Badge variant="outline">{date.experienceType}</Badge>
              )}
            </div>
          )}
          
          {/* Like Button */}
          {showLikeButton && onLike && (
            <div className="pt-2">
              <Button 
                onClick={() => onLike(date.id)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Heart className="w-4 h-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Me gusta este plan'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}