import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
}

export function ErrorMessage({ message, className, ...props }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center text-red-500 bg-red-50 p-4 rounded-lg',
        className
      )}
      {...props}
    >
      <AlertCircle className="w-5 h-5 mr-2" />
      <span>{message}</span>
    </div>
  )
} 