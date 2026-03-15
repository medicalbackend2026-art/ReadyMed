import React from 'react'

export function StatusTag({ status }) {
  const styles = {
    Active: 'bg-green-50 text-green-700 border-green-100',
    Paused: 'bg-amber-50 text-amber-700 border-amber-100',
    Closed: 'bg-gray-100 text-gray-500 border-gray-200',
    Pending: 'bg-blue-50 text-blue-700 border-blue-100'
  }

  const defaultStyle = 'bg-gray-50 text-gray-700 border-gray-200'
  const currentStyle = styles[status] || defaultStyle

  return (
    <span className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${currentStyle}`}>
      {status}
    </span>
  )
}
