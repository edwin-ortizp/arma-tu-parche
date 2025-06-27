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
            /* Layout dividido 50/50 en desktop */
            <div className="flex flex-col lg:flex-row lg:h-[700px] gap-6">
              {/* Panel izquierdo - Cartas Tinder (50% en desktop) */}
              <div className="flex-1 lg:w-1/2 flex justify-center items-center">
                <Suspense fallback={<TinderStackLoader />}>
                  <TinderStack
                    dates={dates}
                    onLike={handleLikeDate}
                    onPass={handlePassDate}
                  />
                </Suspense>
              </div>
              
              {/* Panel derecho - Información y herramientas (50% en desktop) */}
              {selected && (
                <div className="flex-1 lg:w-1/2 space-y-6 lg:space-y-6">
                  {/* Información del plan actual */}
                  {dates.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-lg border">
                      <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-gray-900 dark:text-white">
                        Plan Actual
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-base lg:text-lg text-gray-800 dark:text-gray-200">
                            {dates[0]?.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {dates[0]?.description}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Duración</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">{dates[0]?.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Costo</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">{dates[0]?.cost}</p>
                          </div>
                        </div>
                        
                        {dates[0]?.city && (
                          <div className="pt-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Ubicación</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">{dates[0]?.city}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Contenido colapsable en móvil */}
                  <div className="lg:space-y-6">
                    {/* Estadísticas y progreso */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 lg:p-6 border">
                      <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-gray-900 dark:text-white">
                        Tu Progreso
                      </h3>
                      <div className="space-y-3 lg:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Planes disponibles</span>
                          <span className="font-bold text-xl lg:text-2xl text-purple-600 dark:text-purple-400">
                            {dates.length}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Compañero</span>
                          <span className="text-green-600 dark:text-green-400 font-semibold text-sm lg:text-base">
                            ✓ Seleccionado
                          </span>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Listo para explorar planes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Instrucciones - solo visible en desktop */}
                    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border">
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        💡 Cómo Funciona
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 text-sm font-bold">→</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Me Gusta</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Desliza derecha o usa el botón ❤️</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <span className="text-red-600 dark:text-red-400 text-sm font-bold">←</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Pasar</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Desliza izquierda o usa el botón ✗</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">🎯</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Match</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Si ambos dan me gusta, ¡crean un plan!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tips y motivación - solo visible en desktop */}
                    <div className="hidden lg:block bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                        ✨ Consejo del Día
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        ¡Sé aventurero! A veces los mejores recuerdos vienen de planes que no esperabas que te gustaran.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}