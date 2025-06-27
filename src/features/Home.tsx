import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Sparkles, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDates } from '@/hooks/useDates'
import { useConnections } from '@/hooks/useConnections'
import { DateCard } from '@/components/DateCard'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Home() {
  const [selected, setSelected] = useState<string>('')
  const [likingDateId, setLikingDateId] = useState<string | null>(null)
  
  const { user } = useAuth()
  const isLogged = !!user
  const { dates, loading: datesLoading, likeDate } = useDates(isLogged)
  const { connections, loading: connectionsLoading } = useConnections()

  const handleLikeDate = async (dateId: string) => {
    if (!selected) return
    
    try {
      setLikingDateId(dateId)
      const result = await likeDate(dateId, selected)
      
      if (result.hasMatch) {
        alert('¡Match creado! 🎉')
      } else {
        alert('¡Plan guardado! ✨')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al procesar el like')
    } finally {
      setLikingDateId(null)
    }
  }

  if (datesLoading || connectionsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Encuentra tu Plan"
        description="Descubre actividades perfectas para compartir"
        icon={<Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />}
        badge={{
          text: `${dates.length} planes disponibles`,
          className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
        }}
      />

      {isLogged && connections.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
          title="¡Conecta con Amigos!"
          description="Aún no tienes conexiones. Agrega amigos con su PIN para encontrar planes increíbles juntos."
          tip="Ve a la sección Amigos para conectarte"
        />
      ) : (
        <div className="space-y-8">
          {isLogged && connections.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-xl">Selecciona tu Compañero</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selected} onValueChange={setSelected}>
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
          )}

          {isLogged && connections.length > 0 && selected === '' ? (
            <EmptyState
              icon={<span className="text-2xl">👆</span>}
              title="Selecciona un compañero"
              description="Elige una conexión arriba para ver planes increíbles que pueden hacer juntos."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dates.map(date => (
                <DateCard
                  key={date.id}
                  date={date}
                  onLike={handleLikeDate}
                  showLikeButton={isLogged && !!selected}
                  isLoading={likingDateId === date.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}