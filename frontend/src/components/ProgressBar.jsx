import React from 'react'

export function ProgressBar({ steps, current, variant = 'teal', className = '' }) {
  const arr = Array.from({ length: steps }, (_, i) => i + 1)
  
  const variantClasses = {
    teal: {
      done: 'bg-teal-200',
      active: 'bg-teal-700',
    },
    blue: {
      done: 'bg-blue-200',
      active: 'bg-blue-700',
    }
  }

  return (
    <div className={`flex gap-1 mb-2 ${className}`}>
      {arr.map(step => {
        let bgClass = 'bg-gray-100'
        if (step < current) bgClass = variantClasses[variant].done
        if (step === current) bgClass = variantClasses[variant].active
        
        return (
          <div 
            key={step} 
            className={`h-1 flex-1 rounded-sm transition-colors duration-250 ${bgClass}`}
          />
        )
      })}
    </div>
  )
}
