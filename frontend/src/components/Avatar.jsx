import React from 'react'

export function Avatar({ children, variant = 'teal', size = 'md', className = '' }) {
  const baseClasses = 'rounded-full flex items-center justify-center font-semibold shrink-0'
  
  const sizeClasses = {
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  }

  const variantClasses = {
    teal: 'bg-teal-100 text-teal-700',
    blue: 'bg-blue-100 text-blue-700',
    pink: 'bg-pink-100 text-pink-700',
    amber: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}
