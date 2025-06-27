// Script de migración para convertir conexiones del formato antiguo al nuevo
// Ejecuta este script una sola vez después de implementar las nuevas reglas de Firestore

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc
} from 'firebase/firestore'
import { db } from './firebase'

interface OldUserData {
  uid: string
  displayName?: string
  connections?: string[]
  relationships?: Record<string, string>
}

interface NewConnectionDocument {
  user1: string
  user2: string
  user1Name: string
  user2Name: string
  user1Relation: string
  user2Relation: string
  status: 'accepted'
  createdAt: number
  updatedAt: number
  createdBy: string
}

export async function migrateConnections() {
  console.log('🚀 Iniciando migración de conexiones...')
  
  try {
    // 1. Obtener todos los usuarios
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users: OldUserData[] = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as OldUserData[]

    console.log(`📊 Encontrados ${users.length} usuarios`)

    // 2. Crear un mapa para evitar conexiones duplicadas
    const processedConnections = new Set<string>()
    let migratedCount = 0

    // 3. Procesar cada usuario
    for (const user of users) {
      if (!user.connections || user.connections.length === 0) {
        continue
      }

      console.log(`👤 Procesando usuario: ${user.displayName || user.uid}`)

      // 4. Procesar cada conexión del usuario
      for (const connectionUid of user.connections) {
        // Crear un ID único para la conexión (ordenado alfabéticamente)
        const connectionId = [user.uid, connectionUid].sort().join('_')
        
        // Si ya procesamos esta conexión, saltarla
        if (processedConnections.has(connectionId)) {
          continue
        }

        try {
          // Obtener datos del usuario conectado
          const connectedUserDoc = await getDoc(doc(db, 'users', connectionUid))
          if (!connectedUserDoc.exists()) {
            console.warn(`⚠️ Usuario conectado no encontrado: ${connectionUid}`)
            continue
          }

          const connectedUserData = connectedUserDoc.data()
          
          // Obtener relaciones (si existen)
          const user1Relation = user.relationships?.[connectionUid] || 'amigo'
          const user2Relation = connectedUserData?.relationships?.[user.uid] || 'amigo'

          // Crear documento de conexión
          const connectionData: NewConnectionDocument = {
            user1: user.uid,
            user2: connectionUid,
            user1Name: user.displayName || 'Usuario',
            user2Name: connectedUserData?.displayName || 'Usuario',
            user1Relation,
            user2Relation,
            status: 'accepted',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: user.uid
          }

          // Guardar en la nueva colección
          await addDoc(collection(db, 'connections'), connectionData)
          
          processedConnections.add(connectionId)
          migratedCount++

          console.log(`✅ Conexión migrada: ${user.displayName} ↔ ${connectedUserData?.displayName}`)
          
        } catch (error) {
          console.error(`❌ Error migrando conexión ${user.uid} → ${connectionUid}:`, error)
        }
      }
    }

    console.log(`🎉 Migración completada: ${migratedCount} conexiones migradas`)
    
    // 5. Opcional: Limpiar campos antiguos (comentado por seguridad)
    // console.log('🧹 Limpiando campos antiguos...')
    // for (const user of users) {
    //   if (user.connections || user.relationships) {
    //     await updateDoc(doc(db, 'users', user.uid), {
    //       connections: deleteField(),
    //       relationships: deleteField()
    //     })
    //   }
    // }
    
    return {
      success: true,
      migratedCount,
      totalUsers: users.length
    }
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error)
    throw error
  }
}

// Función auxiliar para ejecutar la migración manualmente
export async function runMigration() {
  try {
    const result = await migrateConnections()
    console.log('📋 Resultado de la migración:', result)
  } catch (error) {
    console.error('❌ Migración fallida:', error)
  }
}

// Para ejecutar desde la consola del navegador:
// import { runMigration } from './migrationScript'
// runMigration()
