import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface PinCardProps {
  pin: string | undefined
  onCopyPin: () => Promise<boolean>
}

export function PinCard({ pin, onCopyPin }: PinCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await onCopyPin()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-indigo-900">Tu PIN</CardTitle>
      </CardHeader>
      <CardContent>
        {pin && (
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white rounded-xl px-6 py-4 border border-indigo-200 shadow-sm">
              <p className="font-mono text-3xl font-bold text-indigo-900 tracking-wider">{pin}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="ml-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        )}
        <p className="text-base text-indigo-600 leading-relaxed">
          Comparte este PIN con tus amigos para que puedan conectarse contigo
        </p>
      </CardContent>
    </Card>
  )
}