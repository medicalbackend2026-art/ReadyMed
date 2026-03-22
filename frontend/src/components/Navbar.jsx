import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUserProfile, getInitials, clearUserProfile } from '../hooks/useUserProfile'

export function Navbar({ variant = 'public' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef(null)
  const [profile, setProfile] = useState(() => getUserProfile())

  // Re-read profile when dropdown opens so initials/photo stay fresh
  useEffect(() => {
    if (avatarOpen) setProfile(getUserProfile())
  }, [avatarOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearUserProfile()
    setAvatarOpen(false)
    navigate('/login')
  }

  const initials = getInitials(profile?.name)
  const avatarPhoto = profile?.photo
  
  const getLinkClass = (path) => {
    const isActive = location.pathname.startsWith(path)
    return isActive 
      ? "px-4 py-2 rounded-lg text-sm font-semibold text-teal-700 bg-teal-50 transition-colors"
      : "px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
  }

  if (variant === 'employee') {
    const isServicesPage = location.pathname === '/services'
    return (
      <nav className="sticky top-0 z-50 h-[64px] bg-white border-b border-border">
        <div className="container-main h-full flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl text-teal-700 tracking-tight">
            Ready<span className="text-teal-200">MD</span>
          </Link>
          {!isServicesPage && (
            <div className="flex items-center gap-1.5">
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
              <Link to="/jobs" className={getLinkClass('/jobs')}>Find Jobs</Link>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(o => !o)}
                className="w-[34px] h-[34px] rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-teal-300 transition-all overflow-hidden"
              >
                {avatarPhoto
                  ? <img src={avatarPhoto} alt="avatar" className="w-full h-full object-cover" />
                  : initials
                }
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-[42px] w-44 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                  <Link
                    to="/profile-setup"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span></span> Profile
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span></span> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  if (variant === 'recruiter') {
    const isServicesPage = location.pathname === '/recruiter/services'
    return (
      <nav className="sticky top-0 z-50 h-[64px] bg-white border-b border-border">
        <div className="container-main h-full flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl text-teal-700 tracking-tight">
            Ready<span className="text-teal-200">MD</span>
          </Link>
          {!isServicesPage && (
            <div className="flex items-center gap-1.5">
              <Link to="/recruiter/candidates" className={getLinkClass('/recruiter/candidates')}>Search</Link>
              <Link to="/recruiter/dashboard" className={getLinkClass('/recruiter/dashboard')}>Dashboard</Link>
              <Link to="/recruiter/applications" className={getLinkClass('/recruiter/applications')}>Applications</Link>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Link to="/recruiter/post-job" className="px-4 py-[7px] text-[13px] font-semibold rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition-colors">Post Job</Link>
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(o => !o)}
                className="w-[34px] h-[34px] rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-blue-300 transition-all overflow-hidden"
              >
                {avatarPhoto
                  ? <img src={avatarPhoto} alt="avatar" className="w-full h-full object-cover" />
                  : initials
                }
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-[42px] w-48 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                  <Link
                    to="/recruiter/company-setup"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>🏢</span> Company Profile
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span>🚪</span> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-12 border-b border-page-border backdrop-blur-md bg-page-bg/80 transition-colors duration-400">
      <Link to="/" className="font-serif text-2xl font-semibold text-page-text tracking-tight flex items-center">
        Ready<em className="italic text-page-accent">MD</em>
      </Link>
      <div className="hidden md:flex items-center gap-2">
        <Link to="/jobs" className="px-4 py-2 rounded-lg text-sm font-medium text-page-text2 hover:text-page-text hover:bg-page-border transition-colors">Find Jobs</Link>
        <Link to="/#how" className="px-4 py-2 rounded-lg text-sm font-medium text-page-text2 hover:text-page-text hover:bg-page-border transition-colors">How it works</Link>
        <Link to="/#professions" className="px-4 py-2 rounded-lg text-sm font-medium text-page-text2 hover:text-page-text hover:bg-page-border transition-colors">Professions</Link>
        <Link to="/recruiter/post-job" className="px-4 py-2 rounded-lg text-sm font-medium text-page-text2 hover:text-page-text hover:bg-page-border transition-colors">For Employers</Link>
      </div>
      <div className="flex items-center gap-2.5">
        <Link to="/login" className="px-5 py-[9px] rounded-lg text-sm font-medium text-page-text2 bg-transparent border border-page-border2 hover:text-page-text hover:bg-page-border transition-all">Log in</Link>
        <Link to="/signup" className="px-5 py-[9px] rounded-lg text-sm font-semibold text-white bg-page-accent hover:-translate-y-[1px] transition-all tracking-tight">Get started</Link>
      </div>
    </nav>
  )
}
