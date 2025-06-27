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
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
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
  )
}