import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'

export function OTPVerifyPage() {
  const [otp, setOtp] = useState(['4', '8', '2', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(28)
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'employee'

  useEffect(() => {
    if (timeLeft <= 0) return
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [timeLeft])

  const handleChange = (index, e) => {
    const value = e.target.value
    if (isNaN(value)) return

    const newOtp = [...otp]
    // allow only one character
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, verify OTP here
    if (role === 'recruiter') {
      navigate('/recruiter/company-setup')
    } else {
      navigate('/profile-setup')
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-page-bg font-sans">
      <div className="max-w-[420px] w-full text-center">
        
        <div className="w-[72px] h-[72px] rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-[32px] mx-auto mb-6">
          ✉️
        </div>
        
        <h1 className="font-serif text-[28px] text-gray-900 mb-2">Check your inbox</h1>
        <p className="text-sm text-gray-500 leading-[1.6] mb-8">
          We've sent a 6-digit verification code to <strong className="text-gray-700 font-semibold">sneha@example.com</strong>. Enter it below to verify your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2.5 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-[52px] h-[58px] border-2 border-border rounded-xl text-center text-[22px] font-bold text-gray-900 bg-white transition-all outline-none focus:border-purple-200 focus:ring-4 focus:ring-[#AFA9EC]/20"
                autoFocus={index === 3} // focus the first empty one based on default state
              />
            ))}
          </div>

          <div className="text-[13px] text-gray-500 mb-7">
            Didn't receive the code?{' '}
            {timeLeft > 0 ? (
              <span className="font-medium text-gray-400">Resend in {formatTime(timeLeft)}</span>
            ) : (
              <button 
                type="button" 
                onClick={() => setTimeLeft(60)} 
                className="font-semibold text-teal-600 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Resend code
              </button>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth>Verify account</Button>
        </form>

        <div className="bg-gray-50 border border-border rounded-lg px-4 py-3 text-xs text-gray-500 flex items-start gap-2.5 mt-5 text-left">
          <span className="text-[15px] shrink-0 leading-tight">🔒</span>
          <span>The code expires in 10 minutes. If you don't see it, check your spam folder.</span>
        </div>

      </div>
    </div>
  )
}
