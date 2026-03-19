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
  const [orgName, setOrgName] = useState('')
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
        role,
        orgName: role === 'recruiter' ? orgName : undefined,
      })
      
      // 5. Navigate — skip profile-setup if profile already ≥75%
      const profile = getUserProfile()
      const alreadyFilled = getProfileCompletion(profile) >= 75
      setCurrentUser({ name: fullName, role, email })
      navigate(role === 'recruiter' ? '/recruiter/dashboard' : (alreadyFilled ? '/dashboard' : '/profile-setup'))
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
        role,
        photo: gUser.photoURL || null,
      })
      const profile2 = getUserProfile()
      const alreadyFilled2 = getProfileCompletion(profile2) >= 75
      setCurrentUser({ name: gUser.displayName || '', role, email: gUser.email || '' })
      navigate(role === 'recruiter' ? '/recruiter/dashboard' : (alreadyFilled2 ? '/dashboard' : '/profile-setup'))
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 min-h-[calc(95vh)] font-sans">

      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center p-12 relative overflow-hidden bg-gradient-to-br from-teal-800 to-teal-700 transition-all duration-500">
        <div className="absolute -top-[20%] -right-[15%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(93,202,165,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-200 mb-3">
            Joining as {config.label}
          </div>
          <div className="text-4xl mb-4">{config.emoji}</div>
          <h2 className="font-serif text-[34px] text-white font-normal leading-tight mb-4">
            {config.heading}
          </h2>
          <p className="text-[15px] text-white/65 leading-[1.7] max-w-[380px] mb-8">
            {config.sub}
          </p>
          <div className="flex flex-col gap-[14px]">
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
      <div className="flex items-center justify-center p-8 md:p-12 my-auto">
        <div className="w-full max-w-[400px]">
          <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Create your account</h1>
          <p className="text-sm text-gray-500 mb-5">Fill in your details to get started with ReadyMD.</p>

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

          {/* Google Sign Up */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-[11px] border border-border rounded-lg text-sm font-medium text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5 text-xs text-gray-400 before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
            or sign up with email
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div id="recaptcha-container"></div>

          {step === 'form' ? (
            <form onSubmit={handleSendOtp}>
              <div className="grid grid-cols-2 gap-3 mb-[18px]">
                <div className="mb-0 [&>div]:mb-0">
                  <FormInput
                    label="First name"
                    placeholder="Sneha"
                    required
                    className="mb-0"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="mb-0 [&>div]:mb-0">
                  <FormInput
                    label="Last name"
                    placeholder="Kulkarni"
                    required
                    className="mb-0"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {role === 'recruiter' && (
                <FormInput
                  label="Organisation / Hospital name"
                  placeholder="Apollo Hospitals"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              )}

              <FormInput
                label="Email address"
                type="email"
                placeholder="sneha@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormInput
                label="Phone number"
                type="tel"
                placeholder="+919876543210"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <FormInput
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                hint="At least 8 characters with one number and one letter."
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormInput
                label="Confirm password"
                type="password"
                placeholder="Re-enter password"
                className="mb-[22px]"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <input type="hidden" name="role" value={role} />

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Sending OTP…' : `Verify Phone Number`}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 p-4 rounded-lg bg-teal-50 border border-teal-100 flex items-start gap-3">
                 <div className="text-xl mt-1">📱</div>
                 <div>
                   <h3 className="text-sm font-semibold text-teal-900 mb-1">Verify your phone</h3>
                   <p className="text-sm text-teal-800">We've sent a 6-digit code to {phone}</p>
                 </div>
              </div>

              <FormInput
                label="Verification Code (OTP)"
                type="text"
                placeholder="123456"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center text-lg tracking-widest font-mono"
              />

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading || otp.length < 6}>
                {loading ? 'Creating account…' : `Create ${role === 'recruiter' ? 'employer' : 'professional'} account`}
              </Button>

              <button 
                type="button" 
                onClick={() => setStep('form')}
                className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Back to details
              </button>
            </form>
          )}

          <div className="text-center text-[13px] text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="font-semibold text-teal-600 hover:underline">Log in</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
