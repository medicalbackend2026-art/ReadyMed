import React from 'react'
import { Link } from 'react-router-dom'

/**
 * BackButton — a unified back / navigation button used across the app.
 *
 * Props:
 *  - onClick      : function  — use when navigating programmatically (e.g. navigate(-1))
 *  - to           : string    — use when navigating to a fixed route via <Link>
 *  - label        : string    — button text (default: "Back")
 *  - variant      : 'default' | 'pill' | 'transparent'
 *      'default'     : pill-shaped, light border on white/light backgrounds (page headers)
 *      'pill'        : slightly smaller pill, used inside sidebars / left panels on white bg
 *      'transparent' : glass-style with white text, for use on dark/coloured backgrounds
 *  - className    : string    — extra classes to append (e.g. "mb-6", "absolute top-6 left-6")
 */
export function BackButton({
  onClick,
  to,
  label = 'Back',
  variant = 'default',
  className = '',
}) {
  const base =
    'inline-flex items-center gap-2 font-medium transition-all group'

  const styles = {
    default:
      'px-4 py-2 text-[13px] rounded-full border border-page-border2 bg-page-surface text-page-text2 hover:text-page-text hover:border-page-accent hover:shadow-sm',
    pill:
      'px-3 py-1.5 text-[12px] rounded-full border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-teal-600 hover:shadow-sm',
    transparent:
      'px-4 py-2 text-[13px] rounded-full border border-white/25 bg-white/10 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/20 hover:border-white/40',
  }

  const chevron = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-hover:-translate-x-0.5 transition-transform shrink-0"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )

  const cls = `${base} ${styles[variant] ?? styles.default} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls}>
        {chevron}
        {label}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {chevron}
      {label}
    </button>
  )
}
