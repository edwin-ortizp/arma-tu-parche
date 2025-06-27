import { useAuth } from '@/hooks/useAuth'
import { useConnections } from '@/hooks/useConnections'

export function useFriendsPage() {
  const { user } = useAuth()
  const { connections, pin, loading, error, addConnection, copyPin } = useConnections()

  return {
    // User data
    user,
    
    // Connections data
    connections,
    pin,
    
    // Loading and error states
    loading,
    error,
    
    // Actions
    addConnection,
    copyPin,
  }
}