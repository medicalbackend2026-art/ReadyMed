import React from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { FormInput } from '../../components/FormElements'
import { Button } from '../../components/Button'

export function SignupPage() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'employee'
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/otp-verify?role=${role}`)
  }

  return (
    <div className="grid md:grid-cols-2 min-h-[calc(95vh)] font-sans">

      {/* Left Panel - Hidden on mobile */}
      <div className="hidden md:flex flex-col justify-center p-12 relative overflow-hidden bg-gradient-to-br from-teal-800 to-teal-700">
        <div className="absolute -top-[20%] -right-[15%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(93,202,165,0.15)_0%,transparent_70%)]" />

        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-200 mb-5">
            Join ReadyMD
          </div>
          <h2 className="font-serif text-[34px] text-white font-normal leading-tight mb-4">
            Start your medical career journey today
          </h2>
          <p className="text-[15px] text-white/65 leading-[1.7] max-w-[380px] mb-8">
            Create your account in under 2 minutes and get matched with relevant medical job opportunities across India.
          </p>

          <div className="flex flex-col gap-[14px]">
            {[
              { icon: '🎯', text: 'Profession-specific job matching' },
              { icon: '📋', text: 'Medical license & certification tracking' },
              { icon: '⚡', text: 'One-tap apply from your profile' },
              { icon: '🔔', text: 'Real-time application status updates' }
            ].map((feature, i) => (
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
          <p className="text-sm text-gray-500 mb-7">Fill in your details to get started with ReadyMD.</p>

          <button className="w-full py-[11px] border border-border rounded-lg text-sm font-medium text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-200 transition-all">
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

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 mb-[18px]">
              <div className="mb-0 [&>div]:mb-0">
                <FormInput label="First name" placeholder="Sneha" required className="mb-0" />
              </div>
              <div className="mb-0 [&>div]:mb-0">
                <FormInput label="Last name" placeholder="Kulkarni" required className="mb-0" />
              </div>
            </div>

            <FormInput label="Email address" type="email" placeholder="sneha@example.com" required />
            <FormInput label="Phone number" type="tel" placeholder="+91 98765 43210" required />

            <FormInput
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              hint="At least 8 characters with one number and one letter."
              required
            />
            <FormInput
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              className="mb-[22px]"
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth>Create account</Button>
          </form>

          <div className="text-center text-[13px] text-gray-500 mt-6">
            Already have an account? <Link to={`/login?role=${role}`} className="font-semibold text-teal-600 hover:underline">Log in</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
