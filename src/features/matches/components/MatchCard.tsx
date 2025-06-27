import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Calendar, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { db } from '@/firebase'
import type { Match, DatePlan } from '@/types'

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  const [dateInfo, setDateInfo] = useState<DatePlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDateInfo = async () => {
      try {
        const dateDoc = await getDoc(doc(db, 'dates', match.dateId))
        if (dateDoc.exists()) {
          setDateInfo({ id: dateDoc.id, ...dateDoc.data() } as DatePlan)
        }
      } catch (error) {
        console.error('Error fetching date info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDateInfo()
  }, [match.dateId])

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-pink-500 to-red-500" />
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="h-2 bg-gradient-to-r from-pink-500 to-red-500" />
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header con emoji del plan */}
          <div className="flex items-center space-x-3">
            {dateInfo ? (
              <div className="text-3xl">{dateInfo.image}</div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                ¡Match! 
                <Heart className="w-4 h-4 text-red-500" />
              </h3>
              <p className="text-lg font-medium text-gray-800">
                {dateInfo?.title || 'Plan desconocido'}
              </p>
            </div>
          </div>

          {/* Información del plan */}
          {dateInfo && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 line-clamp-2">{dateInfo.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {dateInfo.category}
                </Badge>
                {dateInfo.duration && (
                  <Badge variant="outline" className="text-xs">
                    {dateInfo.duration}
                  </Badge>
                )}
                {dateInfo.cost && (
                  <Badge variant="outline" className="text-xs">
                    {dateInfo.cost}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Footer con información del match */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center text-xs text-gray-500">
              <Users className="w-3 h-3 mr-1" />
              {match.users.length} personas
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(match.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Estado del match */}
          <div className="flex items-center justify-between">
            <Badge variant={match.status === 'pending' ? 'secondary' : 'default'}>
              {match.status === 'pending' ? 'Pendiente' : match.status}
            </Badge>
            {match.plannedFor && (
              <p className="text-xs text-gray-500">📅 {match.plannedFor}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}