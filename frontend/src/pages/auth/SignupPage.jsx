import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  PhoneAuthProvider,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'
import { FormInput } from '../../components/FormElements'
import { Button } from '../../components/Button'
import { saveUserProfile, getUserProfile, getProfileCompletion } from '../../hooks/useUserProfile'
import { useAppContext } from '../../context/AppContext'
import { BackButton } from '../../components/BackButton'

// Field helpers — controlled spacing (avoids FormInput's fixed mb-[18px])
function CompactField({ label, type = 'text', placeholder, value, onChange, required = true, wrapClass = '' }) {
  return (
    <div className={wrapClass}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-200/30 placeholder:text-gray-300 transition-all"
      />
    </div>
  )
}

function CompactPasswordField({ label, placeholder, value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          required
          value={value}
          onChange={onChange}
          className="w-full px-3.5 py-2.5 pr-12 border border-border rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-200/30 placeholder:text-gray-300 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-gray-400 hover:text-gray-700 transition-colors"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

const ROLE_CONFIG = {
  employee: {
    label: 'Professional',
    emoji: '🩺',
    heading: 'Start your medical career journey today',
    sub: 'Create your account in under 2 minutes and get matched with relevant medical job opportunities across India.',
    features: [
      { icon: '🎯', text: 'Profession-specific job matching' },
      { icon: '📋', text: 'Medical license & certification tracking' },
      { icon: '⚡', text: 'One-tap apply from your profile' },
      { icon: '🔔', text: 'Real-time application status updates' },
    ],
  },
  recruiter: {
    label: 'Employer',
    emoji: '🏥',
    heading: 'Find the right medical talent — fast',
    sub: 'Post jobs, search 12,000+ verified professionals, and manage your entire hiring pipeline from one place.',
    features: [
      { icon: '🔍', text: 'Search by specialisation & location' },
      { icon: '📢', text: 'Post jobs to 12,000+ professionals' },
      { icon: '✅', text: 'Verified credentials on every profile' },
      { icon: '📊', text: 'Full applicant tracking dashboard' },
    ],
  },
}

export function SignupPage() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'employee'
  const [role, setRole] = useState(initialRole)
  const navigate = useNavigate()
  const { setCurrentUser } = useAppContext()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [profession, setProfession] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgType, setOrgType] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' or 'otp'
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)

  const config = ROLE_CONFIG[role]

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }
    if (!phone || phone.length < 10) {
      return setError('Please enter a valid phone number with country code (e.g. +91...)')
    }

    setLoading(true)
    try {
      // Initialize recapcha
      setupRecaptcha()
      const appVerifier = window.recaptchaVerifier
      
      // Ensure phone has a + at start for firebase
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`

      // Request OTP
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(confirmation)
      setStep('otp')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''))
      // Reset recaptcha if error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }

    setLoading(true)
    try {
      // 1. Verify OTP to sign in with Phone
      const result = await confirmationResult.confirm(otp)
      const user = result.user

      // 2. Link Email/Password credential to the phone user
      const credential = EmailAuthProvider.credential(email, password)
      await linkWithCredential(user, credential)

      // 3. Update profile details
      const fullName = `${firstName} ${lastName}`.trim()
      await updateProfile(user, { displayName: fullName })
      
      // 4. Save user data to localStorage
      saveUserProfile({
        name: fullName,
        firstName,
        lastName,
        email,
        phone,
        profession: role === 'employee' ? profession : undefined,
        orgName: role === 'recruiter' ? orgName : undefined,
        orgType: role === 'recruiter' ? orgType : undefined,
        city: role === 'recruiter' ? city : undefined,
        role: role, // Save actual role (employee or recruiter)
      })
      
      // 5. Navigate to services dashboard directly after signup
      setCurrentUser({ name: fullName, role: role, email })
      navigate('/services')
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
      const gUser = result.user
      const nameParts = (gUser.displayName || '').split(' ')
      saveUserProfile({
        name: gUser.displayName || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: gUser.email || '',
        phone: gUser.phoneNumber || '',
        profession: role === 'employee' ? profession : undefined,
        orgName: role === 'recruiter' ? orgName : undefined,
        orgType: role === 'recruiter' ? orgType : undefined,
        city: role === 'recruiter' ? city : undefined,
        role: role, // Save actual role (employee or recruiter)
        photo: gUser.photoURL || null,
      })
      setCurrentUser({ name: gUser.displayName || '', role: role, email: gUser.email || '' })
      navigate('/services')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 h-[calc(100vh-68px)] mt-[68px] overflow-hidden font-sans bg-white">

      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center p-8 relative overflow-hidden bg-gradient-to-br from-teal-800 to-teal-700 transition-all duration-500">
        <div className="absolute -top-[20%] -right-[15%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(93,202,165,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-200 mb-3">
            Joining as {config.label}
          </div>
          <div className="text-4xl mb-4">{config.emoji}</div>
          <h2 className="font-serif text-[28px] text-white font-normal leading-tight mb-3">
            {config.heading}
          </h2>
          <p className="text-[13px] text-white/65 leading-[1.6] max-w-[380px] mb-6">
            {config.sub}
          </p>
          <div className="flex flex-col gap-2">
            {config.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm shrink-0">
                  {feature.icon}
                </div>
                {feature.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="relative flex flex-col items-center justify-center h-full overflow-hidden px-8 py-3 w-full bg-white">
        
        <BackButton to="/" label="Home" className="absolute top-6 left-6 md:top-8 md:left-8 z-10" />
        
        <div className="w-full max-w-[460px]">
          <h1 className="font-serif text-[26px] text-gray-900 mb-1">Create your account</h1>
          <p className="text-[15px] text-gray-500 mb-3">Fill in your details to get started with ReadyMD.</p>

          {/* Role Toggle */}
          <div className="relative flex p-1 bg-gray-100 rounded-lg mb-3">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-300 ease-in-out"
              style={{ transform: role === 'recruiter' ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
            />
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                role === 'employee' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Professional
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                role === 'recruiter' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Employer
            </button>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-2 border border-border rounded-lg text-sm font-medium text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-3 text-xs text-gray-400 before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
            or sign up with email
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
              {error}
            </div>
          )}

          <div id="recaptcha-container"></div>

          {step === 'form' ? (
            <form onSubmit={handleSendOtp}>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <CompactField label="First name" placeholder="Sneha" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <CompactField label="Last name" placeholder="Kulkarni" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>

              {role === 'recruiter' && (
                <>
                  <CompactField label="Organisation / Hospital name" placeholder="Apollo Hospitals" value={orgName} onChange={(e) => setOrgName(e.target.value)} wrapClass="mb-3" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <CompactField label="Org type" placeholder="Hospital, Clinic…" value={orgType} onChange={(e) => setOrgType(e.target.value)} />
                    <CompactField label="City" placeholder="Mumbai, Delhi…" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </>
              )}

              {/* Email + Phone row */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <CompactField label="Email address" type="email" placeholder="sneha@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <CompactField label="Phone number" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              {/* Password + Confirm row */}
              <div className="grid grid-cols-2 gap-3 mb-1">
                <CompactPasswordField label="Password" placeholder="Min. 8 chars" value={password} onChange={(e) => setPassword(e.target.value)} />
                <CompactPasswordField label="Confirm password" placeholder="Re-enter" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <p className="text-xs text-gray-400 mb-3">At least 8 characters with one number and one letter.</p>

              <input type="hidden" name="role" value={role} />

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Sending OTP…' : 'Verify Phone Number'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-3 p-2.5 rounded-lg bg-teal-50 border border-teal-100 flex items-start gap-2">
                <div className="text-base mt-0.5">📱</div>
                <div>
                  <h3 className="text-xs font-semibold text-teal-900 mb-0.5">Verify your phone</h3>
                  <p className="text-[11px] text-teal-800">We've sent a 6-digit code to {phone}</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Verification Code (OTP)</label>
                <input
                  type="text" placeholder="123456" required maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-200/20 placeholder:text-gray-300 text-center tracking-widest font-mono"
                />
              </div>

              <Button type="submit" variant="primary" size="sm" fullWidth disabled={loading || otp.length < 6}>
                {loading ? 'Creating account…' : `Create ${role === 'recruiter' ? 'employer' : 'professional'} account`}
              </Button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Back to details
              </button>
            </form>
          )}

          <div className="text-center text-[13px] text-gray-500 mt-3">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="font-semibold text-teal-600 hover:underline">Log in</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
