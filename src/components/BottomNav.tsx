import { Home, Heart, User, Settings } from 'lucide-react'

interface Props {
  current: string
  onChange: (screen: string) => void
}

export default function BottomNav({ current, onChange }: Props) {
  const items = [
    { key: 'home', label: 'Inicio', icon: Home },
    { key: 'matches', label: 'Matches', icon: Heart },
    { key: 'profile', label: 'Perfil', icon: User },
    { key: 'config', label: 'Config', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-2 z-50">
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center text-xs focus:outline-none ${
            current === key ? 'text-pink-600' : 'text-gray-500'
          }`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
