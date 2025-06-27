import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Search, Filter } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { connectionTypes } from '@/constants'
import type { Connection } from '@/types'

interface ConnectionsListProps {
  connections: Connection[]
}

export function ConnectionsList({ connections }: ConnectionsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [relationFilter, setRelationFilter] = useState<string>('all')

  // Filtrar conexiones
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRelation = relationFilter === 'all' || connection.relation === relationFilter
    return matchesSearch && matchesRelation
  })

  // Función para obtener colores según la relación
  const getRelationColors = (relation: string) => {
    switch (relation) {
      case 'pareja': return 'from-rose-400 to-pink-500'
      case 'amigos': return 'from-blue-400 to-cyan-500'
      case 'familia': return 'from-green-400 to-emerald-500'
      case 'solo': return 'from-gray-400 to-slate-500'
      default: return 'from-blue-400 to-cyan-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mis Conexiones
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredConnections.length}
            </Badge>
          </CardTitle>
        </div>

        {/* Filtros */}
        {connections.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar amigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={relationFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRelationFilter('all')}
                className="h-8"
              >
                Todos
              </Button>
              {connectionTypes.map(type => (
                <Button
                  key={type}
                  variant={relationFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRelationFilter(type)}
                  className="h-8 capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes conexiones</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Agrega amigos usando su PIN para empezar a encontrar planes increíbles juntos
            </p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay conexiones que coincidan con los filtros</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchTerm('')
                setRelationFilter('all')
              }}
              className="mt-3"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredConnections.map(connection => (
              <div key={connection.uid} className="flex flex-col items-center group">
                <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
                  <AvatarFallback className={`bg-gradient-to-br ${getRelationColors(connection.relation || '')} text-white font-bold text-lg`}>
                    {connection.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="font-medium text-sm text-gray-900 truncate w-20">
                    {connection.name}
                  </p>
                  {connection.relation && (
                    <Badge 
                      variant="outline" 
                      className="text-xs mt-1 px-2 py-0.5 capitalize"
                      style={{
                        backgroundColor: connection.relation === 'pareja' ? '#fee2e2' :
                                       connection.relation === 'amigos' ? '#dbeafe' :
                                       connection.relation === 'familia' ? '#dcfce7' : '#e0e7ff',
                        color: connection.relation === 'pareja' ? '#dc2626' :
                              connection.relation === 'amigos' ? '#2563eb' :
                              connection.relation === 'familia' ? '#16a34a' : '#4f46e5',
                        borderColor: connection.relation === 'pareja' ? '#fecaca' :
                                   connection.relation === 'amigos' ? '#bfdbfe' :
                                   connection.relation === 'familia' ? '#bbf7d0' : '#c7d2fe'
                      }}
                    >
                      {connection.relation}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}