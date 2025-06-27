import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Connection } from '@/types'

interface CompanionSelectorProps {
  connections: Connection[]
  selected: string
  onSelectionChange: (value: string) => void
}

export function CompanionSelector({ connections, selected, onSelectionChange }: CompanionSelectorProps) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-xl">Selecciona tu Compañero</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selected} onValueChange={onSelectionChange}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Elige un amigo para planificar juntos" />
          </SelectTrigger>
          <SelectContent>
            {connections.map(c => (
              <SelectItem key={c.uid} value={c.uid}>
                <div className="flex items-center py-1">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm font-semibold">
                      {c.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base">{c.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}