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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Copy, Check } from 'lucide-react'
import Login from './Login'

export default function Friends() {
  const user = auth.currentUser
  const [pin, setPin] = useState<string>()
  const [pinInput, setPinInput] = useState('')
  const [connections, setConnections] = useState<{ uid: string; name: string; relation?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!user) return
        
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (!snap.exists()) return
        
        const data = snap.data()
        setPin(data?.pin)
        const ids: string[] = data?.connections || []
        const rels: Record<string, string> = data?.relationships || {}
        
        if (ids.length === 0) {
          setConnections([])
          return
        }
        
        const users = await Promise.all(
          ids.map(async id => {
            try {
              const u = await getDoc(doc(db, 'users', id))
              return {
                uid: id,
                name: u.data()?.displayName || 'Anon',
                relation: rels[id],
              }
            } catch (err) {
              console.error('Error al cargar conexión:', id, err)
              return { uid: id, name: 'Error' }
            }
          })
        )
        setConnections(users)
      } catch (err) {
        console.error('Error al cargar datos en Friends:', err)
      }
    }
    load()
  }, [user])

  if (!user) return <Login />

  const addConnection = async () => {
    if (!pinInput.trim()) return
    
    setLoading(true)
    try {
      const q = query(collection(db, 'users'), where('pin', '==', pinInput))
      const qs = await getDocs(q)
      if (qs.empty) {
        alert('PIN no encontrado')
        setLoading(false)
        return
      }
      const other = qs.docs[0]
      
      // Check if trying to add yourself
      if (other.id === user.uid) {
        alert('No puedes agregarte a ti mismo')
        setLoading(false)
        return
      }
      
      // Check if already connected
      if (connections.some(c => c.uid === other.id)) {
        alert('Ya tienes esta conexión')
        setLoading(false)
        return
      }
      
      const relation = prompt('Tipo de vínculo (amigo, pareja, familia, trabajo, etc.)', 'amigo') || 'amigo'

      // Update current user's connections
      await updateDoc(doc(db, 'users', user.uid), {
        connections: arrayUnion(other.id),
        [`relationships.${other.id}`]: relation,
      })

      // Update other user's connections
      await updateDoc(doc(db, 'users', other.id), {
        connections: arrayUnion(user.uid),
        [`relationships.${user.uid}`]: relation,
      })

      setConnections(prev => [...prev, { uid: other.id, name: other.data().displayName, relation }])
      setPinInput('')
      alert('¡Conexión añadida exitosamente!')
    } catch (err) {
      console.error('Error al agregar conexión:', err)
      const e = err as { code?: string; message?: string }
      if (e.code === 'permission-denied') {
        alert('Error de permisos. Verifica que tienes acceso a la base de datos.')
      } else {
        alert('Error al agregar conexión: ' + (e.message || 'Error desconocido'))
      }
    } finally {
      setLoading(false)
    }
  }

  const copyPin = async () => {
    if (pin) {
      await navigator.clipboard.writeText(pin)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="px-6 py-4 space-y-8 w-full max-w-sm mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Mis Amigos</h1>
        <p className="text-gray-600 text-lg">Conecta con tus amigos para encontrar planes juntos</p>
      </div>

      {/* Your PIN Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-indigo-900">Tu PIN</CardTitle>
        </CardHeader>
        <CardContent>
          {pin && (
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white rounded-xl px-6 py-4 border border-indigo-200 shadow-sm">
                <p className="font-mono text-3xl font-bold text-indigo-900 tracking-wider">{pin}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyPin}
                className="ml-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          )}
          <p className="text-base text-indigo-600 leading-relaxed">
            Comparte este PIN con tus amigos para que puedan conectarse contigo
          </p>
        </CardContent>
      </Card>

      {/* Add Friend Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-green-900 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Agregar Amigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="Ingresa el PIN de tu amigo"
              className="border-green-200 focus:border-green-400"
            />
            <Button
              onClick={addConnection}
              disabled={loading || !pinInput.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {loading ? 'Agregando...' : 'Agregar Conexión'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connections List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Mis Conexiones</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {connections.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aún no tienes conexiones</p>
              <p className="text-sm text-gray-400 mt-1">
                Agrega amigos usando su PIN para empezar a encontrar planes juntos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map(c => (
                <div key={c.uid} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.relation || 'Conectado'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
