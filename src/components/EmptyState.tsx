import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  tip?: string
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  tip, 
  className = '' 
}: EmptyStateProps) {
  return (
    <Card className={`bg-muted/50 ${className}`}>
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-3">
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        
        {action && (
          <Button onClick={action.onClick} className="mb-4">
            {action.label}
          </Button>
        )}
        
        {tip && (
          <div className="inline-flex items-center text-sm text-muted-foreground bg-background px-4 py-2 rounded-full border">
            💡 {tip}
          </div>
        )}
      </CardContent>
    </Card>
  )
}