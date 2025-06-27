import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { ConnectionCard } from '@/components/ConnectionCard'
import type { Connection } from '@/types'

interface ConnectionsListProps {
  connections: Connection[]
}

export function ConnectionsList({ connections }: ConnectionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Mis Conexiones</span>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {connections.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aún no tienes conexiones</p>
            <p className="text-sm text-gray-400 mt-1">
              Agrega amigos usando su PIN para empezar a encontrar planes juntos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map(connection => (
              <ConnectionCard key={connection.uid} connection={connection} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}