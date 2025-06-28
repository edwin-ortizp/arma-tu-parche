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
  // Crear conexión especial para "Para mí"
  const soloConnection = {
    uid: 'solo',
    name: 'Para mí',
    relation: 'solo'
  } as Connection
  
  // Agregar "Para mí" a las opciones
  const allConnections = [soloConnection, ...connections]

  // Modo compacto: solo muestra el compañero seleccionado y un botón para cambiar
  if (compact && selected) {
    const selectedConnection = allConnections.find(c => c.uid === selected)
    
    if (selectedConnection) {
      return (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className={`text-white text-xs font-semibold ${
                selectedConnection.uid === 'solo' 
                  ? 'bg-gradient-to-br from-gray-400 to-slate-500'
                  : 'bg-gradient-to-br from-blue-400 to-cyan-500'
              }`}>
                {selectedConnection.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {selectedConnection.uid === 'solo' ? 'Planes para mí' : `Con ${selectedConnection.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectionChange('')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Cambiar
          </button>
        </div>
      )
    }
  }

  return (
    <Card className="bg-muted/50 w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">¿Con quién planeas?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {allConnections.map(connection => (
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
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={`text-white text-sm font-semibold ${
                    connection.uid === 'solo' 
                      ? 'bg-gradient-to-br from-gray-400 to-slate-500'
                      : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                  }`}>
                    {connection.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Nombre */}
                <div className="text-center">
                  <p className="text-xs font-medium truncate max-w-[60px]">
                    {connection.name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}