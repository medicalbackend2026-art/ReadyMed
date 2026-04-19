import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'
import { saveUserProfile } from '../../hooks/useUserProfile'
import { useAppContext } from '../../context/AppContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { setCurrentUser } = useAppContext()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If user is already logged in via Firebase, skip the login page
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return
      try {
        const token = await firebaseUser.getIdToken()
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const res = await fetch(`${API}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const { profile } = await res.json()
          if (profile?.role && profile.role !== 'new_user') {
            setCurrentUser({ name: profile.name || firebaseUser.displayName, role: profile.role, email: profile.email || firebaseUser.email })
            saveUserProfile(profile)
            navigate(profile.role === 'recruiter' ? '/recruiter/services' : '/services', { replace: true })
          }
        }
      } catch (e) {
        // If cloud check fails, stay on login — user can sign in manually
      }
    })
    return () => unsub()
  }, [])

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      const nameParts = (firebaseUser.displayName || '').split(' ')
      const name = firebaseUser.displayName || 'User'
      const userEmail = firebaseUser.email || ''

      // Save basic info locally
      saveUserProfile({
        name,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userEmail,
        photo: firebaseUser.photoURL || null,
      })

      // Check cloud profile — if role is already set, skip role-selection
      let cloudRole = null
      let profileComplete = false
      try {
        const token = await firebaseUser.getIdToken()
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const headers = { Authorization: `Bearer ${token}` }

        const res = await fetch(`${API}/api/users/profile`, { headers })
        if (res.ok) {
          const { profile } = await res.json()
          if (profile?.role && profile.role !== 'new_user') {
            cloudRole = profile.role
            saveUserProfile(profile)

            if (cloudRole === 'employee') {
              // Employee profile completion (same 7-field logic as useUserProfile.js)
              const checks = [
                !!profile.profession,
                !!(profile.experiences?.length > 0 && profile.experiences[0].jobTitle),
                !!(profile.qualifications?.length > 0 && profile.qualifications[0].degree),
                !!(profile.certifications?.length > 0 && profile.certifications[0].regNumber),
                !!(profile.skills?.length > 0),
                !!(profile.currentSalary || profile.expectedSalary),
                !!(profile.resumeFilename),
              ]
              const pct = Math.round((checks.filter(Boolean).length / 7) * 100)
              profileComplete = pct >= 75
            } else if (cloudRole === 'recruiter') {
              // Recruiter: check company profile too
              try {
                const compRes = await fetch(`${API}/api/companies/profile`, { headers })
                if (compRes.ok) {
                  const { profile: co } = await compRes.json()
                  let score = 0
                  if (co?.companyName) score += 25
                  if (co?.orgType) score += 15
                  if (co?.description) score += 20
                  if (co?.contactName) score += 20
                  if (co?.logo) score += 20
                  profileComplete = score >= 75
                }
              } catch (_) { /* ignore */ }
            }
          }
        }
      } catch (e) {
        console.warn('Cloud profile check failed:', e)
      }

      if (cloudRole) {
        setCurrentUser({ name, role: cloudRole, email: userEmail })
        if (profileComplete) {
          // Profile is solid — go straight to the services dashboard
          navigate(cloudRole === 'recruiter' ? '/recruiter/services' : '/services')
        } else {
          // Profile incomplete — go to setup so they can finish
          navigate(cloudRole === 'recruiter' ? '/recruiter/company-setup' : '/profile-setup')
        }
      } else {
        // New user — ask who they are
        setCurrentUser({ name, role: 'new_user', email: userEmail })
        navigate('/role-selection')
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 h-[calc(100vh-68px)] mt-[68px] overflow-hidden font-sans bg-white">

      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center p-12 relative overflow-hidden bg-gradient-to-br from-teal-800 to-teal-700">
        <Link
          to="/"
          className="absolute top-6 left-6 md:top-15 md:left-15 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/10 backdrop-blur-md text-[13px] font-medium text-white/90 hover:text-white hover:bg-black/20 hover:border-white/30 transition-all group z-10"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>
        <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(93,202,165,0.12)_0%,transparent_70%)]" />
        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-200 mb-5">
            Welcome back
          </div>
          <h2 className="font-serif text-[34px] text-white font-normal leading-tight mb-4">
            Your medical career dashboard awaits
          </h2>
          <p className="text-[15px] text-white/65 leading-[1.7] max-w-[380px]">
            Log in to check your application status, browse new matched jobs, and manage your professional profile.
          </p>
          <div className="flex gap-7 mt-9">
            <div>
              <div className="font-serif text-2xl text-white">12,400+</div>
              <div className="text-xs text-white/50 mt-0.5">Professionals registered</div>
            </div>
            <div>
              <div className="font-serif text-2xl text-white">3,200+</div>
              <div className="text-xs text-white/50 mt-0.5">Active listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="relative flex items-center justify-center p-4 sm:p-8 md:p-12 h-full overflow-y-auto w-full">

        {/* Back Button */}

        <div className="w-full max-w-[400px]">
          <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Welcome to ReadyMD</h1>
          <p className="text-sm text-gray-500 mb-7">Log in or create an account to continue.</p>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-[11px] border border-border rounded-lg text-sm font-medium text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Continuing...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
