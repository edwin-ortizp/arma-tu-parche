import { Home, Heart, User, Settings, Users } from 'lucide-react'

interface Props {
  current: string
  onChange: (screen: string) => void
  isAdmin?: boolean
}

export default function BottomNav({ current, onChange, isAdmin }: Props) {
  const items = [
    { key: 'home', label: 'Inicio', icon: Home },
    { key: 'friends', label: 'Amigos', icon: Users },
    { key: 'matches', label: 'Matches', icon: Heart },
    { key: 'profile', label: 'Perfil', icon: User },
  ]
  if (isAdmin) {
    items.push({ key: 'config', label: 'Config', icon: Settings })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-50 m-4 mb-6 rounded-2xl">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-4">
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center text-xs focus:outline-none px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-110 min-w-0 ${
                current === key 
                  ? 'text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <Icon size={22} className="mb-1 flex-shrink-0" />
              <span className="font-medium text-xs truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
