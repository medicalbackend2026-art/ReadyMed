import React from 'react'
import { Link } from 'react-router-dom'

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  to,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 rounded-lg whitespace-nowrap outline-none cursor-pointer border border-transparent leading-none'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-[15px] rounded-xl'
  }

  const variantClasses = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 hover:-translate-y-[1px] hover:shadow-md',
    secondary: 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50',
    ghost: 'bg-transparent text-gray-500 border-border hover:bg-gray-50 hover:text-gray-700',
    blue: 'bg-blue-700 text-white hover:bg-blue-800 hover:-translate-y-[1px] hover:shadow-md',
    'blue-outline': 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
    'page-primary': 'bg-page-accent text-white hover:bg-[#5a9e55] hover:-translate-y-[2px] leading-tight tracking-tight shadow-md hover:shadow-lg',
    'page-secondary': 'bg-page-surface text-page-text border-page-border2 hover:border-page-accent hover:text-page-accent hover:-translate-y-[2px]'
  }

  const widthClass = fullWidth ? 'w-full' : ''
  const finalClass = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`

  if (to) {
    return <Link to={to} className={finalClass} {...props}>{children}</Link>
  }

  return <button className={finalClass} {...props}>{children}</button>
}
