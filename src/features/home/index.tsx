import { Sparkles, Users } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { CompanionSelector } from './components/CompanionSelector'
import { useHomePage } from './hooks/useHomePage'

// Lazy load heavy TinderStack component with Framer Motion
const TinderStack = lazy(() => import('./components/TinderStack').then(module => ({ default: module.TinderStack })))

// Loading component for TinderStack
const TinderStackLoader = () => (
  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-xl">
    <div className="flex flex-col items-center space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      <span className="text-sm text-muted-foreground">Cargando planes...</span>
    </div>
  </div>
)

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
    <div className={`pb-20 ${selected ? 'space-y-2' : 'space-y-6'}`}>
      {/* Header dinámico basado en si hay compañero seleccionado */}
      {!isLogged || connections.length === 0 || selected === '' ? (
        <PageHeader
          title="Encuentra tu Plan"
          description="Descubre actividades perfectas para compartir"
          icon={<Sparkles className="w-5 h-5 text-white" />}
          badge={{
            text: `${dates.length} planes disponibles`,
            className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          }}
        />
      ) : null}

      {isLogged && connections.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
          title="¡Conecta con Amigos!"
          description="Aún no tienes conexiones. Agrega amigos con su PIN para encontrar planes increíbles juntos."
          tip="Ve a la sección Amigos para conectarte"
        />
      ) : (
        <div className="flex flex-col h-[calc(100vh-120px)]">
          {isLogged && connections.length > 0 && selected === '' ? (
            <EmptyState
              icon={<span className="text-2xl">👆</span>}
              title="¿Con quién planeas?"
              description="Elige un compañero o selecciona 'Solo' para planes individuales."
            />
          ) : (
            /* Layout optimizado con tarjeta protagonista */
            <>
              {/* Contador en la esquina superior derecha */}
              {selected && (
                <div className="absolute top-4 right-4 z-50">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border">
                    <span className="text-xs font-medium text-gray-700">{dates.length} planes</span>
                  </div>
                </div>
              )}
              
              {/* Cartas Tinder ocupando la mayoría de la pantalla */}
              <div className="flex-1 flex justify-center items-center px-2">
                <div className="w-full max-w-[95vw] sm:max-w-sm h-full max-h-[calc(100vh-200px)]">
                  <Suspense fallback={<TinderStackLoader />}>
                    <TinderStack
                      dates={dates}
                      onLike={handleLikeDate}
                      onPass={handlePassDate}
                    />
                  </Suspense>
                </div>
              </div>
              
              {/* Selector de compañero abajo */}
              {isLogged && connections.length > 0 && (
                <div className="flex-shrink-0 px-4 pb-2">
                  <CompanionSelector 
                    connections={connections}
                    selected={selected}
                    onSelectionChange={setSelected}
                    compact={selected !== ''}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}