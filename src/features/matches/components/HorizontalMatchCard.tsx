import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Calendar, Users, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { db } from '@/firebase'
import type { DatePlan } from '@/types'

interface MatchWithFriend {
  id: string
  dateId: string
  users: string[]
  createdAt: number
  plannedFor?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  friendInfo?: {
    uid: string
    name: string
    relation?: string
  }
  friendName?: string
}

interface HorizontalMatchCardProps {
  match: MatchWithFriend
}

export function HorizontalMatchCard({ match }: HorizontalMatchCardProps) {
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
        <div className="h-1 bg-gradient-to-r from-pink-500 to-red-500" />
        <CardContent className="p-4">
          <div className="flex gap-4 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'confirmed': return '✅ Confirmado'
      case 'completed': return '🎉 Completado'
      case 'cancelled': return '❌ Cancelado'
      default: return '⏳ Pendiente'
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
      <div className="h-1 bg-gradient-to-r from-pink-500 to-red-500" />
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Plan Image/Icon */}
          <div className="flex-shrink-0">
            {dateInfo ? (
              <div className="w-16 h-16 text-4xl flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 rounded-lg border border-pink-100">
                {dateInfo.image}
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-600">¡Match!</span>
                </div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {dateInfo?.title || 'Plan desconocido'}
                </h3>
                {dateInfo?.description && (
                  <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                    {dateInfo.description}
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              <Badge className={`ml-2 flex-shrink-0 text-xs ${getStatusColor(match.status)}`}>
                {getStatusText(match.status)}
              </Badge>
            </div>

            {/* Friend and Details */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {match.friendName?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="font-medium">Con {match.friendName || 'Amigo'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(match.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{match.users.length} personas</span>
              </div>
            </div>

            {/* Plan Details Tags */}
            {dateInfo && (
              <div className="flex flex-wrap gap-2">
                {dateInfo.category && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {dateInfo.category}
                  </Badge>
                )}
                {dateInfo.duration && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {dateInfo.duration}
                  </Badge>
                )}
                {dateInfo.cost && (
                  <Badge variant="outline" className="text-xs">
                    💰 {dateInfo.cost}
                  </Badge>
                )}
              </div>
            )}

            {/* Planned Date */}
            {match.plannedFor && (
              <div className="mt-3 p-2 bg-gradient-to-r from-pink-50 to-red-50 rounded border border-pink-100">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-pink-600" />
                  <span className="font-medium text-pink-800">
                    Planificado para: {match.plannedFor}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
