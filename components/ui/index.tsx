'use client'

import { motion } from 'framer-motion'
import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Utility function sudah diimport dari @/lib/utils

// Button Component dengan semua variant
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  animated?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animated = true,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    secondary: 'bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 shadow-md hover:shadow-lg focus:ring-green-500',
    ghost: 'bg-transparent hover:bg-green-50 text-green-600 focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    info: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-5 text-xl',
  }
  
  const animationClasses = animated ? 'transform hover:-translate-y-0.5 active:translate-y-0' : ''
  const widthClasses = fullWidth ? 'w-full' : ''
  
  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    animationClasses,
    widthClasses,
    className
  )

  const ButtonComponent = animated ? motion.button : 'button'
  const buttonProps = animated ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <ButtonComponent
      className={buttonClasses}
      disabled={disabled || loading}
      {...buttonProps}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"
        />
      ) : icon && iconPosition === 'left' ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' ? (
        <span className="ml-2">{icon}</span>
      ) : null}
    </ButtonComponent>
  )
}

// Input Component dengan semua variant
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  label?: string
  error?: string
  help?: string
  animated?: boolean
}

export function Input({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  label,
  error,
  help,
  animated = true,
  className,
  ...props
}: InputProps) {
  const baseClasses = 'w-full border rounded-xl transition-all duration-300 focus:outline-none bg-white/80 backdrop-blur-sm'
  
  const variantClasses = {
    default: 'border-gray-300 focus:ring-green-500 focus:border-green-500',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
    warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }
  
  const animationClasses = animated ? 'focus:scale-105 focus:shadow-lg' : ''
  
  const inputClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    animationClasses,
    icon && iconPosition === 'left' ? 'pl-10' : '',
    icon && iconPosition === 'right' ? 'pr-10' : '',
    className
  )

  const InputComponent = animated ? motion.input : 'input'
  const inputProps = animated ? {
    whileFocus: { scale: 1.02 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <InputComponent
          className={inputClasses}
          {...inputProps}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
      
      {help && !error && (
        <p className="text-sm text-gray-500">
          {help}
        </p>
      )}
    </div>
  )
}

// Card Component dengan semua variant
interface CardProps {
  variant?: 'default' | 'elevated' | 'flat' | 'glass' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  animated?: boolean
  className?: string
  children: ReactNode
}

export function Card({
  variant = 'default',
  size = 'md',
  hover = true,
  animated = true,
  className,
  children
}: CardProps) {
  const baseClasses = 'rounded-2xl transition-all duration-500'
  
  const variantClasses = {
    default: 'bg-white/80 backdrop-blur-sm shadow-lg border border-white/20',
    elevated: 'bg-white shadow-2xl border border-gray-200',
    flat: 'bg-white border border-gray-200 hover:border-gray-300',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-200',
  }
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }
  
  const hoverClasses = hover ? 'hover:shadow-2xl hover:-translate-y-2' : ''
  const animationClasses = animated ? 'hover:scale-105' : ''
  
  const cardClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    hoverClasses,
    animationClasses,
    className
  )

  const CardComponent = animated ? motion.div : 'div'
  const cardProps = animated ? {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.3 }
  } : {}

  return (
    <CardComponent
      className={cardClasses}
      {...cardProps}
    >
      {children}
    </CardComponent>
  )
}

// Badge Component
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
  children: ReactNode
}

export function Badge({
  variant = 'default',
  size = 'md',
  animated = true,
  className,
  children
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium'
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-primary-100 text-primary-800',
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  }
  
  const animationClasses = animated ? 'hover:scale-105 transition-transform duration-200' : ''
  
  const badgeClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    animationClasses,
    className
  )

  const BadgeComponent = animated ? motion.span : 'span'
  const badgeProps = animated ? {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <BadgeComponent
      className={badgeClasses}
      {...badgeProps}
    >
      {children}
    </BadgeComponent>
  )
}

// Alert Component
interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  closable?: boolean
  onClose?: () => void
  className?: string
  children: ReactNode
}

export function Alert({
  variant = 'info',
  size = 'md',
  animated = true,
  closable = false,
  onClose,
  className,
  children
}: AlertProps) {
  const baseClasses = 'rounded-lg border p-4'
  
  const variantClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  }
  
  const alertClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  )

  const AlertComponent = animated ? motion.div : 'div'
  const alertProps = animated ? {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  } : {}

  return (
    <AlertComponent
      className={alertClasses}
      {...alertProps}
    >
      <div className="flex items-start">
        <div className="flex-1">
          {children}
        </div>
        {closable && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            ×
          </motion.button>
        )}
      </div>
    </AlertComponent>
  )
}

// Progress Component
interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  animated?: boolean
  showPercentage?: boolean
  className?: string
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  animated = true,
  showPercentage = true,
  className
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden'
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-green-500 to-green-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    error: 'bg-gradient-to-r from-red-500 to-red-600',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600',
  }
  
  const progressClasses = cn(
    baseClasses,
    sizeClasses[size],
    className
  )

  return (
    <div className="space-y-2">
      {showPercentage && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={progressClasses}>
        <motion.div
          className={`h-full rounded-full ${variantClasses[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// Divider Component
interface DividerProps {
  variant?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'light' | 'dark'
  text?: string
  animated?: boolean
  className?: string
}

export function Divider({
  variant = 'horizontal',
  size = 'md',
  color = 'default',
  text,
  animated = true,
  className
}: DividerProps) {
  const baseClasses = 'relative'
  
  const sizeClasses = {
    sm: variant === 'horizontal' ? 'h-px' : 'w-px',
    md: variant === 'horizontal' ? 'h-0.5' : 'w-0.5',
    lg: variant === 'horizontal' ? 'h-1' : 'w-1',
  }
  
  const colorClasses = {
    default: 'bg-gray-300',
    light: 'bg-gray-200',
    dark: 'bg-gray-400',
  }
  
  const dividerClasses = cn(
    baseClasses,
    sizeClasses[size],
    colorClasses[color],
    className
  )

  if (text && variant === 'horizontal') {
    return (
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{text}</span>
        </div>
      </div>
    )
  }

  const DividerComponent = animated ? motion.div : 'div'
  const dividerProps = animated ? {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { duration: 0.3 }
  } : {}

  return (
    <DividerComponent
      className={dividerClasses}
      {...dividerProps}
    />
  )
}
