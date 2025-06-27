import { Heart, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import LoginPage from '@/features/auth'
import { useAuth } from '@/hooks/useAuth'
import { MatchCard } from './components/MatchCard'
import { useMatches } from './hooks/useMatches'

export default function MatchesPage() {
  const { user } = useAuth()
  const { matches, loading } = useMatches()

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
    <div className="space-y-8">
      <PageHeader
        title="Matches"
        description="Planes en los que coincidieron"
        icon={<Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />}
        badge={{
          text: `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`,
          className: 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
        }}
      />

      {matches.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-muted-foreground" />}
          title="Sin matches aún"
          description="Cuando tú y tus amigos marquen el mismo plan como favorito, aparecerá aquí como un match."
          tip="Explora la sección de Planes para encontrar actividades que te gusten"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}