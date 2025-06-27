import { Sparkles, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { CompanionSelector } from './components/CompanionSelector'
import { TinderStack } from './components/TinderStack'
import { useHomePage } from './hooks/useHomePage'

export default function HomePage() {
  const {
    selected,
    setSelected,
    isLogged,
    dates,
    connections,
    loading,
    handleLikeDate,
    handlePassDate,
  } = useHomePage()

  if (loading) {
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
    <div className={`pb-20 ${selected ? 'space-y-4' : 'space-y-8'}`}>
      {/* Header dinámico basado en si hay compañero seleccionado */}
      {!isLogged || connections.length === 0 || selected === '' ? (
        <PageHeader
          title="Encuentra tu Plan"
          description="Descubre actividades perfectas para compartir"
          icon={<Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />}
          badge={{
            text: `${dates.length} planes disponibles`,
            className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          }}
        />
      ) : (
        /* Header compacto cuando ya hay compañero seleccionado */
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Planes para ti</h1>
            <p className="text-sm text-muted-foreground">
              {dates.length} planes disponibles
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>¡Desliza para explorar!</span>
          </div>
        </div>
      )}

      {isLogged && connections.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
          title="¡Conecta con Amigos!"
          description="Aún no tienes conexiones. Agrega amigos con su PIN para encontrar planes increíbles juntos."
          tip="Ve a la sección Amigos para conectarte"
        />
      ) : (
        <div className={`${selected ? 'space-y-4' : 'space-y-8'}`}>
          {isLogged && connections.length > 0 && (
            <CompanionSelector 
              connections={connections}
              selected={selected}
              onSelectionChange={setSelected}
              compact={selected !== ''}
            />
          )}

          {isLogged && connections.length > 0 && selected === '' ? (
            <EmptyState
              icon={<span className="text-2xl">👆</span>}
              title="Selecciona un compañero"
              description="Elige una conexión arriba para ver planes increíbles que pueden hacer juntos."
            />
          ) : (
            <div className="flex justify-center">
              <TinderStack
                dates={dates}
                onLike={handleLikeDate}
                onPass={handlePassDate}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}