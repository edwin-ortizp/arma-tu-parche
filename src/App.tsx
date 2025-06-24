import { useEffect, useState } from 'react'
import './App.css'
import Home from './features/Home'
import Matches from './features/Matches'
import Profile from './features/Profile'
import Config from './features/Config'
import BottomNav from './components/BottomNav'
import Login from './features/Login'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

function App() {
  const [screen, setScreen] = useState('home')
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: u.uid,
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
          })
        }
      }
    })
  }, [])

  if (!user) return <Login />

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
