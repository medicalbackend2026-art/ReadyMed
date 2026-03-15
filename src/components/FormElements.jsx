import React, { useState } from 'react'

export function FormInput({ 
  label, 
  hint, 
  type = 'text', 
  id, 
  className = '', 
  ...props 
}) {
  const [showPw, setShowPw] = useState(false)
  
  const inputId = id || Math.random().toString(36).substr(2, 9)
  const isPassword = type === 'password'
  
  return (
    <div className={`mb-[18px] ${className}`}>
      {label && <label htmlFor={inputId} className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <input 
          id={inputId}
          type={isPassword && showPw ? 'text' : type}
          className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-teal-200 focus:ring-3 focus:ring-teal-200/20 placeholder:text-gray-200"
          {...props}
        />
        {isPassword && (
          <button 
            type="button" 
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 p-1"
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && <div className="text-[12px] text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}

export function FormSelect({ label, hint, id, children, className = '', ...props }) {
  const inputId = id || Math.random().toString(36).substr(2, 9)
  
  return (
    <div className={`mb-[18px] ${className}`}>
      {label && <label htmlFor={inputId} className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>}
      <select 
        id={inputId}
        className="w-full px-3.5 py-2.5 pr-9 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-teal-200 focus:ring-3 focus:ring-teal-200/20 appearance-none bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%235F5E5A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }}
        {...props}
      >
        {children}
      </select>
      {hint && <div className="text-[12px] text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}
