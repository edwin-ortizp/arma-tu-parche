import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border transform transition-all duration-300",
      "animate-in slide-in-from-bottom-2",
      {
        "bg-green-50 border-green-200 text-green-800": type === 'success',
        "bg-red-50 border-red-200 text-red-800": type === 'error',
        "bg-blue-50 border-blue-200 text-blue-800": type === 'info'
      }
    )}>
      <div className="flex items-center space-x-2">
        {type === 'success' && <span className="text-green-600">✓</span>}
        {type === 'error' && <span className="text-red-600">✗</span>}
        {type === 'info' && <span className="text-blue-600">ℹ</span>}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}