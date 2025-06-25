import { useEffect, useState } from 'react'
import './App.css'
import Home from './features/Home'
import Friends from './features/Friends'
import Matches from './features/Matches'
import Profile from './features/Profile'
import Config from './features/Config'
import BottomNav from './components/BottomNav'
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
  const [userData, setUserData] = useState<UserData | undefined>()

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
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
        } catch (error) {
          console.error('Error en la gestión del usuario:', error)
          alert('Error al crear/cargar usuario: ' + (error as Error).message)
        }
      } else {
        setUserData(undefined)
      }
    })
  }, [])



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200" 
         style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
           backgroundSize: '40px 40px'
         }}>
      {/* Contenedor boxed para toda la aplicación */}
      <div className="min-h-screen max-w-sm mx-auto bg-white shadow-xl relative flex flex-col">
        <div className="flex-1 py-8 pb-24">
          {screen === 'home' && <Home />}
          {screen === 'friends' && <Friends />}
          {screen === 'matches' && <Matches />}
          {screen === 'profile' && <Profile />}
          {screen === 'config' && <Config />}
        </div>
        <BottomNav current={screen} onChange={setScreen} isAdmin={userData?.role === 'admin'} />
      </div>
    </div>
  )
}

export default App
