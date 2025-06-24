import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Profile() {
  const user = auth.currentUser
  const [pin, setPin] = useState<string>()

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const snap = await getDoc(doc(db, 'users', user.uid))
      setPin(snap.data()?.pin)
    }
    load()
  }, [user])

  if (!user) return null

  return (
    <div className="p-4 space-y-2 w-full max-w-md text-center">
      {user.photoURL && (
        <img src={user.photoURL} alt="avatar" className="w-20 h-20 rounded-full mx-auto" />
      )}
      <h2 className="text-lg font-bold">{user.displayName}</h2>
      <p className="text-sm">PIN: {pin}</p>
    </div>
  )
}
