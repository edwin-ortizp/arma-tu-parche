import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Check } from 'lucide-react'
import type { Connection } from '@/types'

interface CompanionSelectorProps {
  connections: Connection[]
  selected: string
  onSelectionChange: (value: string) => void
  compact?: boolean
}

export function CompanionSelector({ connections, selected, onSelectionChange, compact = false }: CompanionSelectorProps) {
  if (connections.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-xl">Selecciona tu Compañero</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aún no tienes conexiones. ¡Agrega amigos para empezar a planificar juntos!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Modo compacto: solo muestra el compañero seleccionado y un botón para cambiar
  if (compact && selected) {
    const selectedConnection = connections.find(c => c.uid === selected)
    
    if (selectedConnection) {
      return (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 ring-2 ring-background">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm font-semibold">
                    {selectedConnection.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Planificando con {selectedConnection.name}</p>
                  {selectedConnection.relation && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedConnection.relation}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onSelectionChange('')}
                className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
              >
                Cambiar
              </button>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-xl">Selecciona tu Compañero</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {connections.map(connection => (
            <button
              key={connection.uid}
              onClick={() => onSelectionChange(connection.uid)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                ${selected === connection.uid 
                  ? 'border-brand-primary bg-brand-primary/10 shadow-lg' 
                  : 'border-border hover:border-brand-primary/50 bg-background'
                }
              `}
            >
              {/* Checkmark para seleccionado */}
              {selected === connection.uid && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-12 h-12 ring-2 ring-background">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg font-semibold">
                    {connection.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Nombre */}
                <div className="text-center">
                  <p className="text-sm font-medium truncate max-w-[80px]">
                    {connection.name}
                  </p>
                  {connection.relation && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {connection.relation}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}