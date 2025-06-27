import { useState } from 'react'
import './App.css'
import Home from './features/Home'
import Friends from './features/Friends'
import Matches from './features/Matches'
import Profile from './features/Profile'
import Config from './features/Config'
import Login from './features/Login'
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
    return <Login />
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation Bar */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">CitApp</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
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
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    screen === key 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:block text-sm text-muted-foreground">
                {user.displayName}
              </span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {screen === 'home' && <Home />}
        {screen === 'friends' && <Friends />}
        {screen === 'matches' && <Matches />}
        {screen === 'profile' && <Profile />}
        {screen === 'config' && <Config />}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNav current={screen} onChange={setScreen} isAdmin={userData?.role === 'admin'} />
      </div>
    </div>
  )
}

export default App
