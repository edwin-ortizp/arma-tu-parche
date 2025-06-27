import { useEffect, useState } from 'react'
import { 
  doc, 
  getDoc, 
  addDoc,
  query, 
  collection, 
  where, 
  getDocs,
  updateDoc
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { Connection, ConnectionDocument } from '@/types'

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [pin, setPin] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadConnections = async () => {
      const user = auth.currentUser
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Cargar PIN del usuario
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (userSnap.exists()) {
          setPin(userSnap.data()?.pin)
        }
        
        // Cargar conexiones desde la nueva colección
        // Como `or` puede tener problemas de compatibilidad, hacemos dos consultas separadas
        const connectionsAsUser1 = query(
          collection(db, 'connections'),
          where('user1', '==', user.uid),
          where('status', '==', 'accepted')
        )
        
        const connectionsAsUser2 = query(
          collection(db, 'connections'),
          where('user2', '==', user.uid),
          where('status', '==', 'accepted')
        )
        
        const [snap1, snap2] = await Promise.all([
          getDocs(connectionsAsUser1),
          getDocs(connectionsAsUser2)
        ])
        
        const allDocs = [...snap1.docs, ...snap2.docs]
        
        const loadedConnections: Connection[] = allDocs.map(doc => {
          const data = doc.data() as ConnectionDocument
          const isUser1 = data.user1 === user.uid
          
          return {
            uid: isUser1 ? data.user2 : data.user1,
            name: isUser1 ? data.user2Name : data.user1Name,
            relation: isUser1 ? data.user1Relation : data.user2Relation
          }
        })
        
        setConnections(loadedConnections)
      } catch (err) {
        console.error('Error al cargar conexiones:', err)
        setError('Error al cargar conexiones')
      } finally {
        setLoading(false)
      }
    }

    loadConnections()
  }, [])

  const addConnection = async (pinInput: string, relationChoice: string) => {
    const user = auth.currentUser
    if (!user || !pinInput.trim()) {
      throw new Error('Usuario no autenticado o PIN vacío')
    }

    try {
      // Buscar usuario por PIN
      const q = query(collection(db, 'users'), where('pin', '==', pinInput))
      const qs = await getDocs(q)
      
      if (qs.empty) {
        throw new Error('PIN no encontrado')
      }
      
      const otherUserDoc = qs.docs[0]
      const otherUserData = otherUserDoc.data()
      
      if (otherUserDoc.id === user.uid) {
        throw new Error('No puedes conectarte contigo mismo')
      }
      
      // Verificar si ya existe una conexión
      const existingAsUser1 = query(
        collection(db, 'connections'),
        where('user1', '==', user.uid),
        where('user2', '==', otherUserDoc.id)
      )
      
      const existingAsUser2 = query(
        collection(db, 'connections'),
        where('user1', '==', otherUserDoc.id),
        where('user2', '==', user.uid)
      )
      
      const [snap1, snap2] = await Promise.all([
        getDocs(existingAsUser1),
        getDocs(existingAsUser2)
      ])
      
      if (!snap1.empty || !snap2.empty) {
        throw new Error('Ya tienes una conexión con este usuario')
      }

      // Obtener información del usuario actual
      const currentUserSnap = await getDoc(doc(db, 'users', user.uid))
      const currentUserData = currentUserSnap.data()

      // Crear nueva conexión
      const connectionData: Omit<ConnectionDocument, 'id'> = {
        user1: user.uid,
        user2: otherUserDoc.id,
        user1Name: currentUserData?.displayName || 'Usuario',
        user2Name: otherUserData?.displayName || 'Usuario',
        user1Relation: relationChoice,
        user2Relation: relationChoice, // Por defecto la misma relación
        status: 'accepted', // Por simplicidad, aceptamos directamente
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: user.uid
      }

      await addDoc(collection(db, 'connections'), connectionData)

      // Actualizar estado local
      setConnections(prev => [...prev, { 
        uid: otherUserDoc.id, 
        name: otherUserData?.displayName || 'Usuario', 
        relation: relationChoice 
      }])
      
      return { success: true }
    } catch (err) {
      console.error('Error al agregar conexión:', err)
      throw err
    }
  }

  const removeConnection = async (connectionUid: string) => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    try {
      // Buscar la conexión a eliminar
      const connectionsAsUser1 = query(
        collection(db, 'connections'),
        where('user1', '==', user.uid),
        where('user2', '==', connectionUid)
      )
      
      const connectionsAsUser2 = query(
        collection(db, 'connections'),
        where('user1', '==', connectionUid),
        where('user2', '==', user.uid)
      )
      
      const [snap1, snap2] = await Promise.all([
        getDocs(connectionsAsUser1),
        getDocs(connectionsAsUser2)
      ])
      
      const connectionDoc = snap1.docs[0] || snap2.docs[0]
      
      if (!connectionDoc) {
        throw new Error('Conexión no encontrada')
      }

      // Cambiar estado a bloqueado en lugar de eliminar
      await updateDoc(doc(db, 'connections', connectionDoc.id), {
        status: 'blocked',
        updatedAt: Date.now()
      })

      // Actualizar estado local
      setConnections(prev => prev.filter(conn => conn.uid !== connectionUid))
      
      return { success: true }
    } catch (err) {
      console.error('Error al eliminar conexión:', err)
      throw err
    }
  }

  const copyPin = async () => {
    if (pin) {
      try {
        await navigator.clipboard.writeText(pin)
        return true
      } catch (err) {
        console.error('Error al copiar PIN:', err)
        return false
      }
    }
    return false
  }

  return { 
    connections, 
    pin, 
    loading, 
    error, 
    addConnection, 
    removeConnection,
    copyPin 
  }
}