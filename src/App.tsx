import { useState } from 'react'
import './App.css'
import Home from './features/Home'
import Matches from './features/Matches'
import Profile from './features/Profile'
import Config from './features/Config'
import BottomNav from './components/BottomNav'

function App() {
  const [screen, setScreen] = useState('home')

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 flex items-center justify-center w-full">
        {screen === 'home' && <Home />}
        {screen === 'matches' && <Matches />}
        {screen === 'profile' && <Profile />}
        {screen === 'config' && <Config />}
      </div>
      <BottomNav current={screen} onChange={setScreen} />
    </div>
  )
}

export default App
