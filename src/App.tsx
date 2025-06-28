import { lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import BottomNav from './components/BottomNav'
import { useAuth } from './hooks/useAuth'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from './components/ui/button'

// Lazy load all feature components
const HomePage = lazy(() => import('./features/home'))
const FriendsPage = lazy(() => import('./features/friends'))
const MatchesPage = lazy(() => import('./features/matches'))
const ProfilePage = lazy(() => import('./features/profile'))
const ConfigPage = lazy(() => import('./features/config'))
const LoginPage = lazy(() => import('./features/auth'))

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center space-x-2">
      <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      <span className="text-muted-foreground">Cargando página...</span>
    </div>
  </div>
)

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, userData, loading } = useAuth()
  
  const handleScreenChange = (newScreen: string) => {
    navigate(`/${newScreen === 'home' ? '' : newScreen}`)
  }
  
  const currentPath = location.pathname
  const getCurrentScreen = () => {
    if (currentPath === '/') return 'home'
    return currentPath.slice(1) // Remove leading slash
  }
  
  const canGoBack = currentPath !== '/' && currentPath !== '/home'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header/Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Arma tu Parche</h1>
            </div>
            
            {/* Back button */}
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            )}
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {[
                { key: 'home', label: 'Inicio', icon: 'home' },
                { key: 'friends', label: 'Amigos', icon: 'users' },
                { key: 'matches', label: 'Matches', icon: 'heart' },
                { key: 'profile', label: 'Perfil', icon: 'user' },
                ...(userData?.role === 'admin' ? [{ key: 'config', label: 'Config', icon: 'settings' }] : [])
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleScreenChange(key)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                    getCurrentScreen() === key 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* User Avatar */}
            <div className="flex items-center space-x-3">
              <img 
                src={user.photoURL || ''} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user.displayName}
              </span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32 md:pb-8">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/config" element={<ConfigPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNav current={getCurrentScreen()} onChange={handleScreenChange} isAdmin={userData?.role === 'admin'} />
      </div>
    </div>
  )
}

export default App
