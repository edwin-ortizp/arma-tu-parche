import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, Crown } from 'lucide-react'
import Login from './Login'

export default function Profile() {
  const user = auth.currentUser
  const [connections, setConnections] = useState<{ uid: string; name: string }[]>([])
  const [interests, setInterests] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data()
      const ids: string[] = data?.connections || []
      const users = await Promise.all(
        ids.map(async id => {
          const u = await getDoc(doc(db, 'users', id))
          return { uid: id, name: u.data()?.displayName || 'Anon' }
        })
      )
      setConnections(users)
      setInterests(data?.interests || [])
    }
    load()
  }, [user])

  if (!user) return <Login />

  const doSignOut = () => signOut(auth)

  const categories = ['eventos', 'museos', 'actividades al aire libre']

  const toggleInterest = async (cat: string) => {
    if (!user) return
    const newInterests = interests.includes(cat)
      ? interests.filter(i => i !== cat)
      : [...interests, cat]
    setInterests(newInterests)
    await updateDoc(doc(db, 'users', user.uid), { interests: newInterests })
  }

  return (
    <div className="px-6 py-4 space-y-8 w-full max-w-sm mx-auto">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-white shadow-xl"
            />
          ) : (
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{user.displayName}</h1>
        <p className="text-gray-600 text-lg">{user.email}</p>
      </div>

      {/* PIN Card - moved to Friends screen */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="text-center py-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">👥</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">¿Buscas conectar con amigos?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ve a la sección "Amigos" para gestionar tus conexiones y agregar nuevos amigos usando su PIN.
          </p>
          <div className="inline-flex items-center text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
            💡 Tip: Tu PIN y conexiones están en "Amigos"
          </div>
        </CardContent>
      </Card>

      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Conexiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-purple-600 mb-1">{connections.length}</div>
              <p className="text-sm text-gray-600">
                {connections.length === 1 ? 'Amigo conectado' : 'Amigos conectados'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intereses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                type="button"
                variant={interests.includes(cat) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleInterest(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <CardContent className="py-6">
          <Button
            onClick={doSignOut}
            variant="destructive"
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
