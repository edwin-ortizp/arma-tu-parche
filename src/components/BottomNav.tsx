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
    <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="flex justify-around py-3 px-4">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center text-xs focus:outline-none px-3 py-2 rounded-xl transition-all duration-200 ${
              current === key 
                ? 'text-pink-600 bg-pink-50 scale-105 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={24} className="mb-1" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
