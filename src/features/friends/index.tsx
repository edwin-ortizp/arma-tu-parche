import { Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import LoginPage from '@/features/auth'
import { PinCard } from './components/PinCard'
import { AddFriendCard } from './components/AddFriendCard'
import { ConnectionsList } from './components/ConnectionsList'
import { useFriendsPage } from './hooks/useFriendsPage'

export default function FriendsPage() {
  const { user, connections, pin, loading, addConnection, copyPin } = useFriendsPage()

  if (!user) return <LoginPage />

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Amigos"
        description="Conecta con tus amigos para encontrar planes juntos"
        icon={<Users className="w-5 h-5 text-white" />}
        badge={{
          text: `${connections.length} ${connections.length === 1 ? 'amigo' : 'amigos'}`,
          className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PinCard pin={pin} onCopyPin={copyPin} />
        <AddFriendCard onAddConnection={addConnection} />
      </div>

      <ConnectionsList connections={connections} />
    </div>
  )
}