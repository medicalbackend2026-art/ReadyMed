import React from 'react'

export function Badge({ children, variant = 'gray', className = '' }) {
  const baseClasses = 'inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border leading-tight'
  
  const variantClasses = {
    teal: 'bg-teal-50 border-teal-100 text-teal-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    pink: 'bg-pink-50 border-pink-100 text-pink-700',
    coral: 'bg-coral-50 border-coral-100 text-coral-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    gray: 'bg-gray-50 border-border text-gray-500',
    outline: 'bg-white border-border text-gray-500',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
