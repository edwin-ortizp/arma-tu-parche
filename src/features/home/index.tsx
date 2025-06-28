import { Sparkles, Users, Clock, DollarSign, MapPin } from 'lucide-react'
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
          {/* Selector de compañero arriba - siempre visible cuando logueado */}
          {isLogged && (
            <div className="flex-shrink-0 px-4 mb-4">
              <CompanionSelector 
                connections={connections}
                selected={selected}
                onSelectionChange={setSelected}
                compact={selected !== ''}
              />
            </div>
          )}

          {isLogged && selected === '' ? (
            <div className="px-4">
              <EmptyState
                icon={<span className="text-2xl">👆</span>}
                title="¿Con quién planeas?"
                description="Elige un compañero o selecciona 'Solo' para planes individuales."
              />
            </div>
          ) : (
            /* Layout responsivo - móvil: columna, desktop: 2 columnas */
            <div className="flex flex-col lg:flex-row lg:gap-8 h-full">
              {/* Columna izquierda - Tarjeta principal */}
              <div className="flex-1 flex justify-center items-center px-2 lg:px-0">
                <div className="w-[95vw] lg:w-full lg:max-w-[500px] space-y-4">
                  {/* Tarjeta principal con contador integrado */}
                  <div className="h-[calc(100vh-300px)] lg:h-[600px] relative">
                    <Suspense fallback={<TinderStackLoader />}>
                      <TinderStack
                        dates={dates}
                        onLike={handleLikeDate}
                        onPass={handlePassDate}
                      />
                    </Suspense>
                  </div>
                  
                  {/* Tags en móvil */}
                  <div className="lg:hidden">
                    {selected && dates.length > 0 && (
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {dates[0]?.category}
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {dates[0]?.duration}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {dates[0]?.cost}
                          </span>
                          {dates[0]?.city && (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {dates[0]?.city}
                            </span>
                          )}
                          {dates[0]?.experienceType && (
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                              {dates[0]?.experienceType}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Columna derecha - Solo visible en desktop */}
              <div className="hidden lg:block lg:w-80 lg:flex-shrink-0 space-y-6">
                {selected && dates.length > 0 && (
                  <>
                    {/* Información del plan actual */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                      <h3 className="text-xl font-bold mb-4 text-gray-900">
                        Detalles del Plan
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">
                            {dates[0]?.title}
                          </h4>
                          <p className="text-gray-600 leading-relaxed">
                            {dates[0]?.description}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {dates[0]?.category}
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {dates[0]?.duration}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {dates[0]?.cost}
                          </span>
                          {dates[0]?.city && (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {dates[0]?.city}
                            </span>
                          )}
                          {dates[0]?.experienceType && (
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                              {dates[0]?.experienceType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Instrucciones */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h3 className="text-lg font-bold mb-4 text-gray-900">
                        💡 Cómo usar
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold">→</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Me Gusta</p>
                            <p className="text-gray-600">Desliza derecha o usa el botón ❤️</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-bold">←</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Pasar</p>
                            <p className="text-gray-600">Desliza izquierda o usa el botón ✗</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Instrucciones al final - solo móvil */}
      {isLogged && selected && (
        <div className="lg:hidden mt-8 px-6 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-center text-sm text-gray-600">
              💡 <strong>Tip:</strong> Desliza → para me gusta, ← para pasar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}