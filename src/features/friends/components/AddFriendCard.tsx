import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus } from 'lucide-react'
import { connectionTypes } from '@/constants'

interface AddFriendCardProps {
  onAddConnection: (pin: string, relation: string) => Promise<{ success: boolean }>
}

export function AddFriendCard({ onAddConnection }: AddFriendCardProps) {
  const [pinInput, setPinInput] = useState('')
  const [relationChoice, setRelationChoice] = useState(connectionTypes[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!pinInput.trim()) return
    
    setLoading(true)
    try {
      await onAddConnection(pinInput, relationChoice)
      setPinInput('')
      setRelationChoice(connectionTypes[0])
      alert('¡Conexión añadida exitosamente!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al agregar conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-green-900 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Agregar Amigo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Input
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            placeholder="Ingresa el PIN de tu amigo"
            className="border-green-200 focus:border-green-400"
          />
          <div>
            <label className="block text-sm font-medium text-green-800 mb-2">
              ¿Cómo describes esta relación?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {connectionTypes.map(type => (
                <label 
                  key={type} 
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    relationChoice === type
                      ? 'bg-green-100 border-green-500 text-green-800 shadow-sm'
                      : 'bg-white border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="relation" 
                    value={type}
                    checked={relationChoice === type}
                    onChange={(e) => setRelationChoice(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium capitalize">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !pinInput.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {loading ? 'Agregando...' : 'Agregar Conexión'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}