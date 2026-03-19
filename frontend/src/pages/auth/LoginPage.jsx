import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'
import { FormInput } from '../../components/FormElements'
import { Button } from '../../components/Button'
import { getUserProfile, getProfileCompletion, saveUserProfile, getCompanyProfile, getCompanyCompletion } from '../../hooks/useUserProfile'
import { useAppContext } from '../../context/AppContext'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'employee'
  const [role, setRole] = useState(initialRole)
  const navigate = useNavigate()
  const { setCurrentUser } = useAppContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectAfterLogin = (r, firebaseUser = null) => {
    let name = 'Guest';
    let userEmail = '';
    
    if (r === 'recruiter') {
      const company = getCompanyProfile()
      const isCompanyComplete = getCompanyCompletion(company) >= 100
      name = company?.companyName || firebaseUser?.displayName || 'Employer'
      userEmail = company?.email || firebaseUser?.email || email
      setCurrentUser({ name, role: 'recruiter', email: userEmail })
      navigate(isCompanyComplete ? '/recruiter/dashboard' : '/recruiter/company-setup')
    } else {
      // If Google login, persist basic user info
      if (firebaseUser) {
        const nameParts = (firebaseUser.displayName || '').split(' ')
        saveUserProfile({
          name: firebaseUser.displayName || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: firebaseUser.email || '',
          photo: firebaseUser.photoURL || null,
          role: 'employee',
        })
      }
      const profile = getUserProfile()
      const isComplete = getProfileCompletion(profile) >= 75
      name = profile?.name || firebaseUser?.displayName || 'User'
      userEmail = profile?.email || firebaseUser?.email || email
      setCurrentUser({ name, role: 'employee', email: userEmail })
      navigate(isComplete ? '/dashboard' : '/profile-setup')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      redirectAfterLogin(role, cred.user)
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      redirectAfterLogin(role, result.user)
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 min-h-[calc(100vh)] font-sans">

      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center p-12 relative overflow-hidden bg-gradient-to-br from-teal-800 to-teal-700">
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
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-[400px]">
          <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Log in to ReadyMD</h1>
          <p className="text-sm text-gray-500 mb-7">Enter your credentials to access your account.</p>

          {/* Role Toggle */}
          <div className="relative flex p-1 bg-gray-100 rounded-lg mb-8">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-300 ease-in-out"
              style={{ transform: role === 'recruiter' ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
            />
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`relative z-10 flex-1 py-2 text-[13px] font-semibold rounded-md transition-colors duration-200 ${
                role === 'employee' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Professional
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`relative z-10 flex-1 py-2 text-[13px] font-semibold rounded-md transition-colors duration-200 ${
                role === 'recruiter' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Employer
            </button>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-[11px] border border-border rounded-lg text-sm font-medium text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5 text-xs text-gray-400 before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
            or log in with email
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email address"
              placeholder="sneha@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              label="Password"
              placeholder="Enter your password"
              type="password"
              className="mb-0"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-between items-center -mt-1.5 mb-5">
              <label className="flex items-center gap-1.5 text-[13px] text-gray-500 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-[15px] h-[15px] accent-teal-600" />
                Remember me
              </label>
              <Link to="#" className="text-[13px] text-teal-600 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          <div className="text-center text-[13px] text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to={`/signup?role=${role}`} className="font-semibold text-teal-600 hover:underline">Sign up free</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
