import { Users, ChevronDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { Connection } from '@/types'

interface FriendsFilterProps {
  friends: Connection[]
  selectedFriend: string
  onFriendSelect: (friendId: string) => void
  totalMatches: number
  filteredMatches: number
}

export function FriendsFilter({ 
  friends, 
  selectedFriend, 
  onFriendSelect, 
  totalMatches, 
  filteredMatches 
}: FriendsFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border border-pink-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Users className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Filtrar por amigo</h3>
          <p className="text-sm text-gray-600">
            Mostrando {filteredMatches} de {totalMatches} matches
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Select value={selectedFriend} onValueChange={onFriendSelect}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white border-pink-200 focus:border-pink-400 focus:ring-pink-400">
            <SelectValue placeholder="Seleccionar amigo">
              {selectedFriend === 'all' ? (
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Todos los amigos
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {friends.find(f => f.uid === selectedFriend)?.name.charAt(0) || 'A'}
                    </span>
                  </div>
                  {friends.find(f => f.uid === selectedFriend)?.name || 'Amigo'}
                </span>
              )}
            </SelectValue>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Todos los amigos</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {totalMatches}
                </Badge>
              </div>
            </SelectItem>
            {friends.map(friend => (
              <SelectItem key={friend.uid} value={friend.uid}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {friend.name.charAt(0)}
                    </span>
                  </div>
                  <span>{friend.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {friend.relation || 'Amigo'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
