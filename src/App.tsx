import { useEffect, useState } from 'react'
import './App.css'
import Home from './features/Home'
import Friends from './features/Friends'
import Matches from './features/Matches'
import Profile from './features/Profile'
import Config from './features/Config'
import BottomNav from './components/BottomNav'
import Login from './features/Login'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore'

interface UserData {
  role: string
  connections: string[]
  pin: string
}

function App() {
  const [screen, setScreen] = useState('home')
  const [user, setUser] = useState(auth.currentUser)
  const [userData, setUserData] = useState<UserData | undefined>()

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        try {
          const ref = doc(db, 'users', u.uid)
          let snap = await getDoc(ref)
          
          if (!snap.exists()) {
            // Generar PIN único
            let pin = ''
            for (let i = 0; i < 5; i++) {
              pin = Math.floor(1000 + Math.random() * 9000).toString()
              const q = query(collection(db, 'users'), where('pin', '==', pin))
              const qs = await getDocs(q)
              if (qs.empty) break
            }
            
            const userData = {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              pin,
              role: 'user',
              connections: [],
            }
            
            await setDoc(ref, userData)
            snap = await getDoc(ref)
          }
          
          setUserData(snap.data() as UserData)
        } catch (error: any) {
          console.error('Error en la gestión del usuario:', error)
          alert('Error al crear/cargar usuario: ' + error.message)
        }
      } else {
        setUserData(undefined)
      }
    })
  }, [])

  if (!user) return <Login />

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <div className="flex-1 flex items-start justify-center w-full pt-4 pb-20">
        {screen === 'home' && <Home />}
        {screen === 'friends' && <Friends />}
        {screen === 'matches' && <Matches />}
        {screen === 'profile' && <Profile />}
        {screen === 'config' && <Config />}
      </div>
      <BottomNav current={screen} onChange={setScreen} isAdmin={userData?.role === 'admin'} />
    </div>
  )
}

export default App
