import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import type { Match } from '@/types'

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="h-2 bg-gradient-to-r from-pink-500 to-red-500" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mr-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¡Match encontrado!</h3>
              <p className="text-sm text-gray-600">Plan: {match.dateId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {new Date(match.createdAt).toLocaleDateString()}
            </p>
            {match.plannedFor && (
              <p className="text-xs text-gray-500">Fecha: {match.plannedFor}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}