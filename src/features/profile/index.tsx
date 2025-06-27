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
import LoginPage from '@/features/auth'
import { categories as planCategories } from '@/constants'
import { PageHeader } from '@/components/PageHeader'

export default function ProfilePage() {
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

  if (!user) return <LoginPage />

  const doSignOut = () => signOut(auth)

  const categories = planCategories

  const toggleInterest = async (cat: string) => {
    if (!user) return
    const newInterests = interests.includes(cat)
      ? interests.filter(i => i !== cat)
      : [...interests, cat]
    setInterests(newInterests)
    await updateDoc(doc(db, 'users', user.uid), { interests: newInterests })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Gestiona tu información y preferencias"
        icon={<User className="w-5 h-5 text-white" />}
      />

      <div className="space-y-6">
        {/* User Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{user.displayName}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {connections.length > 0 && (
                <div className="text-center">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">{connections.length} {connections.length === 1 ? 'amigo' : 'amigos'}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Interests */}
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

        {/* Sign Out */}
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
    </div>
  )
}