import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Accessibility Components
export interface AccessibilityProps {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  role?: string
  tabIndex?: number
}

// Screen Reader Only Text
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
)

// Skip Link for Keyboard Navigation
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
  >
    {children}
  </a>
)

// Accessible Button Component
export interface AccessibleButtonProps extends AccessibilityProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  loading?: boolean
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  ...accessibilityProps
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  }
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg'
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...accessibilityProps}
    >
      {loading && (
        <motion.div
          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
      {loading && <ScreenReaderOnly>Loading...</ScreenReaderOnly>}
    </button>
  )
}

// Accessible Input Component
export interface AccessibleInputProps extends AccessibilityProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  helperText?: string
  className?: string
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  className,
  ...accessibilityProps
}) => {
  const id = React.useId()
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={cn(
          error && errorId,
          helperText && helperId
        )}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...accessibilityProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Accessible Card Component
export interface AccessibleCardProps extends AccessibilityProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  className,
  interactive = false,
  onClick,
  ...accessibilityProps
}) => {
  const Component = interactive ? 'button' : 'div'
  
  return (
    <Component
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        interactive && 'hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      onClick={onClick}
      {...(interactive && { role: 'button', tabIndex: 0 })}
      {...accessibilityProps}
    >
      {children}
    </Component>
  )
}

// Responsive Grid Component
export interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const gridCols = {
    sm: `grid-cols-${cols.sm || 1}`,
    md: `md:grid-cols-${cols.md || 2}`,
    lg: `lg:grid-cols-${cols.lg || 3}`,
    xl: `xl:grid-cols-${cols.xl || 4}`
  }

  return (
    <div
      className={cn(
        'grid',
        gridCols.sm,
        gridCols.md,
        gridCols.lg,
        gridCols.xl,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive Container
export interface ResponsiveContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'md',
  className
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  }

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

// Loading States
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Loading'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <motion.div
      className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', sizeClasses[size], className)}
      role="status"
      aria-label={ariaLabel}
    >
      <ScreenReaderOnly>{ariaLabel}</ScreenReaderOnly>
    </motion.div>
  )
}

// Skeleton Loading
export interface SkeletonProps {
  className?: string
  'aria-label'?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  'aria-label': ariaLabel = 'Loading content'
}) => (
  <div
    className={cn('animate-pulse rounded-md bg-muted', className)}
    role="status"
    aria-label={ariaLabel}
  >
    <ScreenReaderOnly>{ariaLabel}</ScreenReaderOnly>
  </div>
)

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class AccessibleErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ReactNode }>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4 p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
          </div>
          <AccessibleButton
            onClick={() => window.location.reload()}
            variant="primary"
            aria-label="Refresh page to try again"
          >
            Refresh Page
          </AccessibleButton>
        </div>
      )
    }

    return this.props.children
  }
}

// Focus Management Hook
export const useFocusManagement = () => {
  const focusableElements = React.useRef<HTMLElement[]>([])

  const trapFocus = React.useCallback((container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    focusableElements.current = Array.from(focusable)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const firstElement = focusableElements.current[0]
        const lastElement = focusableElements.current[focusableElements.current.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [])

  const focusFirst = React.useCallback(() => {
    focusableElements.current[0]?.focus()
  }, [])

  const focusLast = React.useCallback(() => {
    focusableElements.current[focusableElements.current.length - 1]?.focus()
  }, [])

  return { trapFocus, focusFirst, focusLast }
}

// Keyboard Navigation Hook
export const useKeyboardNavigation = () => {
  const handleKeyDown = React.useCallback((e: KeyboardEvent, actions: Record<string, () => void>) => {
    const action = actions[e.key]
    if (action) {
      action()
      e.preventDefault()
    }
  }, [])

  return { handleKeyDown }
}

// ARIA Live Region for Announcements
export const AriaLiveRegion: React.FC<{ children: React.ReactNode; politeness?: 'polite' | 'assertive' }> = ({
  children,
  politeness = 'polite'
}) => (
  <div
    role="status"
    aria-live={politeness}
    aria-atomic="true"
    className="sr-only"
  >
    {children}
  </div>
)

// High Contrast Mode Support
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isHighContrast
}

// Reduced Motion Support
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Responsive Hook
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('lg')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 640) setScreenSize('sm')
      else if (width < 768) setScreenSize('md')
      else if (width < 1024) setScreenSize('lg')
      else setScreenSize('xl')
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return {
    screenSize,
    isMobile: screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl'
  }
}

// Export all components
export {
  ScreenReaderOnly,
  SkipLink,
  AccessibleButton,
  AccessibleInput,
  AccessibleCard,
  ResponsiveGrid,
  ResponsiveContainer,
  LoadingSpinner,
  Skeleton,
  AccessibleErrorBoundary,
  AriaLiveRegion,
  useFocusManagement,
  useKeyboardNavigation,
  useHighContrast,
  useReducedMotion,
  useResponsive
}
