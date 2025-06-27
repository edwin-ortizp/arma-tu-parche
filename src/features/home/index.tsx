import { Sparkles, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { DateCard } from './components/DateCard'
import { CompanionSelector } from './components/CompanionSelector'
import { useHomePage } from './hooks/useHomePage'

export default function HomePage() {
  const {
    selected,
    setSelected,
    likingDateId,
    user,
    isLogged,
    dates,
    connections,
    loading,
    handleLikeDate,
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
            <CompanionSelector 
              connections={connections}
              selected={selected}
              onSelectionChange={setSelected}
            />
          )}

          {isLogged && connections.length > 0 && selected === '' ? (
            <EmptyState
              icon={<span className="text-2xl">👆</span>}
              title="Selecciona un compañero"
              description="Elige una conexión arriba para ver planes increíbles que pueden hacer juntos."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {dates.map(date => (
                <div key={date.id} className="max-w-sm mx-auto w-full">
                  <DateCard
                    date={date}
                    onLike={handleLikeDate}
                    showLikeButton={isLogged && !!selected}
                    isLoading={likingDateId === date.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}