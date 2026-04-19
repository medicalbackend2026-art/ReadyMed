import React from 'react'

export function Footer({ variant = 'public' }) {
  if (variant === 'minimal') {
    return (
      <footer className="mt-auto py-6 text-center text-xs text-gray-400 border-t border-border">
        © {new Date().getFullYear()} ReadyMD. All rights reserved.
      </footer>
    )
  }

  return (
    <footer className="border-t border-page-border py-10 px-5">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <a href="/" className="font-serif text-xl font-semibold text-page-text2 decoration-transparent">
          Ready<em className="text-page-accent not-italic">MD</em>
        </a>
        <div className="flex gap-6">
          <a href="#" className="text-[13px] text-page-text3 hover:text-page-text2 transition-colors">About</a>
          <a href="#" className="text-[13px] text-page-text3 hover:text-page-text2 transition-colors">Privacy</a>
          <a href="#" className="text-[13px] text-page-text3 hover:text-page-text2 transition-colors">Terms</a>
          <a href="#" className="text-[13px] text-page-text3 hover:text-page-text2 transition-colors">Contact</a>
        </div>
        <div className="text-[12px] text-page-text3">© {new Date().getFullYear()} ReadyMD. All rights reserved.</div>
      </div>
    </footer>
  )
}
