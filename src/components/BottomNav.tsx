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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-3">
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center text-xs focus:outline-none px-3 py-2 rounded-xl transition-all duration-300 min-w-0 ${
                current === key 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} className="mb-1 flex-shrink-0" />
              <span className="font-medium text-xs truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
