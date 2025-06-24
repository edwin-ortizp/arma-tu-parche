import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'

export default function Profile() {
  const user = auth.currentUser
  const [pin, setPin] = useState<string>()
  const [pinInput, setPinInput] = useState('')
  const [connections, setConnections] = useState<{ uid: string; name: string }[]>([])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data()
      setPin(data?.pin)
      const ids: string[] = data?.connections || []
      const users = await Promise.all(
        ids.map(async id => {
          const u = await getDoc(doc(db, 'users', id))
          return { uid: id, name: u.data()?.displayName || 'Anon' }
        })
      )
      setConnections(users)
    }
    load()
  }, [user])

  if (!user) return null

  const addConnection = async () => {
    try {
      const q = query(collection(db, 'users'), where('pin', '==', pinInput))
      const qs = await getDocs(q)
      if (qs.empty) {
        alert('PIN no encontrado')
        return
      }
      const other = qs.docs[0]
      await updateDoc(doc(db, 'users', user.uid), {
        connections: arrayUnion(other.id),
      })
      await updateDoc(doc(db, 'users', other.id), {
        connections: arrayUnion(user.uid),
      })
      setConnections(prev => [...prev, { uid: other.id, name: other.data().displayName }])
      setPinInput('')
      alert('Conexión añadida')
    } catch (err) {
      console.error(err)
    }
  }

  const doSignOut = () => signOut(auth)

  return (
    <div className="p-4 space-y-2 w-full max-w-md text-center">
      {user.photoURL && (
        <img
          src={user.photoURL}
          alt="avatar"
          className="w-20 h-20 rounded-full mx-auto"
        />
      )}
      <h2 className="text-lg font-bold">{user.displayName}</h2>
      {pin && (
        <div className="mx-auto w-max bg-gray-100 rounded p-2">
          <p className="text-xs text-gray-500">Tu PIN</p>
          <p className="font-mono text-xl tracking-widest">{pin}</p>
        </div>
      )}
      <div className="space-y-2">
        <input
          value={pinInput}
          onChange={e => setPinInput(e.target.value)}
          placeholder="PIN de tu amigo"
          className="border p-1 rounded w-full"
        />
        <button
          onClick={addConnection}
          className="px-3 py-1 bg-indigo-500 text-white rounded w-full"
        >
          Agregar conexión
        </button>
      </div>
      {connections.length > 0 && (
        <div className="text-left mt-4">
          <h3 className="font-semibold mb-1">Conexiones</h3>
          <ul className="space-y-1">
            {connections.map(c => (
              <li key={c.uid} className="text-sm">{c.name}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={doSignOut}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
