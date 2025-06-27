import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Connection } from '@/types'

interface ConnectionCardProps {
  connection: Connection
  className?: string
}

export function ConnectionCard({ connection, className = '' }: ConnectionCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-semibold">
              {connection.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{connection.name}</h3>
            {connection.relation && (
              <Badge variant="outline" className="mt-1">
                {connection.relation}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}