import React from 'react'

export function Card({ children, className = '', flat = false }) {
  if (flat) {
    return <div className={`card-flat ${className}`}>{children}</div>
  }
  return <div className={`card ${className}`}>{children}</div>
}
