import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    className?: string
  }
  actions?: ReactNode
}

export function PageHeader({ title, description, icon, badge, actions }: PageHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Icon and title */}
      {icon && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 shadow-lg">
            {icon}
          </div>
        </div>
      )}
      
      {/* Title and actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-base md:text-lg">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {badge && (
            <Badge 
              variant={badge.variant || 'default'} 
              className={badge.className}
            >
              {badge.text}
            </Badge>
          )}
          {actions}
        </div>
      </div>
    </div>
  )
}