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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className={`h-2 bg-gradient-to-r ${date.bgGradient || 'from-blue-500 to-purple-500'}`} />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{date.image}</div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-foreground mb-2">{date.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed">{date.description}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Details */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {date.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{date.duration}</span>
              </div>
            )}
            {date.cost && (
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>{date.cost}</span>
              </div>
            )}
            {date.city && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{date.city}</span>
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{date.category}</Badge>
            {date.relationType && (
              <Badge variant="outline">{date.relationType}</Badge>
            )}
            {date.experienceType && (
              <Badge variant="outline">{date.experienceType}</Badge>
            )}
            {date.goodForToday && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Perfecto para hoy</Badge>
            )}
          </div>
          
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