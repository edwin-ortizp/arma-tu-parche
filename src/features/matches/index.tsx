import { Heart } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import LoginPage from '@/features/auth'
import { useAuth } from '@/hooks/useAuth'
import { HorizontalMatchCard } from './components/HorizontalMatchCard'
import { FriendsFilter } from './components/FriendsFilter'
import { useMatches } from './hooks/useMatches'

export default function MatchesPage() {
  const { user } = useAuth()
  const { 
    matches, 
    allMatches, 
    friends, 
    selectedFriend, 
    setSelectedFriend, 
    loading 
  } = useMatches()

  if (!user) return <LoginPage />

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-20 bg-muted rounded"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matches"
        description="Planes en los que coincidieron"
        icon={<Heart className="w-5 h-5 text-white" />}
        badge={{
          text: `${allMatches.length} ${allMatches.length === 1 ? 'match' : 'matches'}`,
          className: 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
        }}
      />

      {/* Friends Filter */}
      {friends.length > 0 && (
        <FriendsFilter
          friends={friends}
          selectedFriend={selectedFriend}
          onFriendSelect={setSelectedFriend}
          totalMatches={allMatches.length}
          filteredMatches={matches.length}
        />
      )}

      {/* Matches List */}
      {matches.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-muted-foreground" />}
          title={selectedFriend === 'all' ? 'Sin matches aún' : 'Sin matches con este amigo'}
          description={
            selectedFriend === 'all' 
              ? "Cuando tú y tus amigos marquen el mismo plan como favorito, aparecerá aquí como un match."
              : "No tienes matches con este amigo todavía. ¡Exploren juntos los planes disponibles!"
          }
          tip="Explora la sección de Planes para encontrar actividades que te gusten"
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop/Tablet: Más compacto, Mobile: Stack vertical */}
          <div className="space-y-3">
            {matches.map(match => (
              <HorizontalMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}