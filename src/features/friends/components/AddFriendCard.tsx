import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus } from 'lucide-react'
import { relationTypes } from '@/constants'

interface AddFriendCardProps {
  onAddConnection: (pin: string, relation: string) => Promise<{ success: boolean }>
}

export function AddFriendCard({ onAddConnection }: AddFriendCardProps) {
  const [pinInput, setPinInput] = useState('')
  const [relationChoice, setRelationChoice] = useState(relationTypes[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!pinInput.trim()) return
    
    setLoading(true)
    try {
      await onAddConnection(pinInput, relationChoice)
      setPinInput('')
      setRelationChoice(relationTypes[0])
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
          <Select value={relationChoice} onValueChange={setRelationChoice}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tipo de vínculo" />
            </SelectTrigger>
            <SelectContent>
              {relationTypes.map(rt => (
                <SelectItem key={rt} value={rt}>
                  {rt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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