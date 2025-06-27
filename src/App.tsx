import { useState } from 'react'
import './App.css'
import HomePage from './features/home'
import FriendsPage from './features/friends'
import MatchesPage from './features/matches'
import ProfilePage from './features/profile'
import ConfigPage from './features/config'
import LoginPage from './features/auth'
import BottomNav from './components/BottomNav'
import { useAuth } from './hooks/useAuth'
import { Loader2 } from 'lucide-react'

function App() {
  const [screen, setScreen] = useState('home')
  const { user, userData, loading } = useAuth()

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
    return <LoginPage />
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header/Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">CitApp</h1>
            </div>
            
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
                  onClick={() => setScreen(key)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                    screen === key 
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
        {screen === 'home' && <HomePage />}
        {screen === 'friends' && <FriendsPage />}
        {screen === 'matches' && <MatchesPage />}
        {screen === 'profile' && <ProfilePage />}
        {screen === 'config' && <ConfigPage />}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNav current={screen} onChange={setScreen} isAdmin={userData?.role === 'admin'} />
      </div>
    </div>
  )
}

export default App
