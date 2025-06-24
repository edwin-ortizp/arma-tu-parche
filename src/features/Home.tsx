import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, MapPin, Heart, Sparkles } from 'lucide-react'

interface DatePlan {
  id: string
  title: string
  description: string
  category: string
  duration: string
  cost: string
  image: string
  active: boolean
  bgGradient: string
  goodForToday: boolean
  city?: string
}

export default function Home() {
  const [dates, setDates] = useState<DatePlan[]>([])
  const [connections, setConnections] = useState<{ uid: string; name: string }[]>([])
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      try {
        // Cargar planes disponibles
        const snap = await getDocs(collection(db, 'dates'))
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<DatePlan, 'id'>) }))
        setDates(items.filter(d => d.active))

        // Cargar conexiones del usuario actual
        const uid = auth.currentUser?.uid
        if (!uid) return
        
        const userSnap = await getDoc(doc(db, 'users', uid))
        if (!userSnap.exists()) {
          console.log('Documento de usuario no encontrado')
          return
        }
        
        const userData = userSnap.data()
        const ids: string[] = userData?.connections || []
        
        if (ids.length === 0) {
          setConnections([])
          return
        }
        
        const users = await Promise.all(
          ids.map(async id => {
            try {
              const u = await getDoc(doc(db, 'users', id))
              return { uid: id, name: u.data()?.displayName || 'Anon' }
            } catch (err) {
              console.error('Error al cargar usuario:', id, err)
              return { uid: id, name: 'Error' }
            }
          })
        )
        setConnections(users)
      } catch (err: any) {
        console.error('Error al cargar datos:', err)
        if (err.code === 'permission-denied') {
          alert('Error de permisos al cargar datos. Verifica tu configuración de Firestore.')
        }
      }
    }
    load()
  }, [])

  const likeDate = async (dateId: string) => {
    const user = auth.currentUser
    if (!user || !selected) return
    try {
      await setDoc(doc(db, 'likes', `${user.uid}_${dateId}`), {
        userId: user.uid,
        dateId,
        liked: true,
        createdAt: Date.now(),
      })

      const likeRef = doc(db, 'likes', `${selected}_${dateId}`)
      const otherLike = await getDoc(likeRef)
      if (otherLike.exists()) {
        const matchRef = doc(db, 'matches', `${[user.uid, selected].sort().join('_')}_${dateId}`)
        const mSnap = await getDoc(matchRef)
        if (!mSnap.exists()) {
          await setDoc(matchRef, {
            users: [user.uid, selected],
            dateId,
            createdAt: Date.now(),
          })
        }
      }
    } catch (err: any) {
      console.error('Error al dar like:', err)
      if (err.code === 'permission-denied') {
        alert('Error de permisos. Verifica tu configuración de Firestore.')
      } else {
        alert('Error al procesar el like: ' + (err.message || 'Error desconocido'))
      }
    }
  }

  return (
    <div className="p-4 space-y-6 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Encuentra tu Plan</h1>
        <p className="text-gray-600">Descubre actividades perfectas para compartir</p>
      </div>

      {connections.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Conecta con Amigos!</h3>
            <p className="text-gray-600 mb-4">
              Aún no tienes conexiones. Agrega amigos con su PIN desde la sección de Amigos.
            </p>
            <div className="inline-flex items-center text-sm text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
              💡 Tip: Ve a la pestaña "Amigos" para conectarte
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Friend Selection */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-900">Selecciona tu Compañero</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Elige un amigo para planificar juntos" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map(c => (
                    <SelectItem key={c.uid} value={c.uid}>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-semibold">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selected === '' ? (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl">👆</span>
                </div>
                <p className="text-gray-700 font-medium">Elige una conexión para ver planes increíbles</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Planes Disponibles</h2>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  {dates.length} planes
                </Badge>
              </div>
              
              {dates.map(date => (
                <Card key={date.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className={`h-2 bg-gradient-to-r ${date.bgGradient || 'from-blue-500 to-purple-500'}`} />
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="text-3xl mr-3">{date.image}</div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{date.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{date.description}</p>
                          </div>
                        </div>
                        {date.goodForToday && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            ¡Hoy!
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{date.duration}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                          <span>{date.cost}</span>
                        </div>
                        {date.city && (
                          <div className="flex items-center text-sm text-gray-600 col-span-2">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span>{date.city}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className="text-purple-700 border-purple-200 bg-purple-50"
                        >
                          {date.category}
                        </Badge>
                        <Button 
                          onClick={() => likeDate(date.id)} 
                          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Me gusta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
