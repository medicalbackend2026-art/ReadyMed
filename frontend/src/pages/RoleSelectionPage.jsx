<<<<<<< Updated upstream
import React from 'react'
import { Link } from 'react-router-dom'

export function RoleSelectionPage() {
=======
import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { saveUserProfile } from '../hooks/useUserProfile'
import { useAppContext } from '../context/AppContext'

const HEALTHCARE_ROLES = [
  {
    id: 'doctor',
    label: 'Doctor',
    emoji: '👨‍⚕️',
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Medical physician and practitioner',
    benefits: [
      'Access to verified job opportunities',
      'Specialization-specific matching',
      'License & credential tracking',
      'Direct communication with hospitals'
    ]
  },
  {
    id: 'nurse',
    label: 'Nurse',
    emoji: '👩‍⚕️',
    color: 'bg-pink-50',
    textColor: 'text-pink-600',
    description: 'Nursing professional',
    benefits: [
      'Find positions matching your specialty',
      'Flexible job arrangements',
      'Real-time shift notifications',
      'Career growth opportunities'
    ]
  },
  {
    id: 'physicist',
    label: 'Medical Physicist',
    emoji: '🔬',
    color: 'bg-purple-50',
    textColor: 'text-purple-600',
    description: 'Medical physics specialist',
    benefits: [
      'Specialized job listings',
      'Research opportunities',
      'Professional network access',
      'Conference & training updates'
    ]
  },
  {
    id: 'pharmacist',
    label: 'Pharmacist',
    emoji: '💊',
    color: 'bg-green-50',
    textColor: 'text-green-600',
    description: 'Pharmaceutical professional',
    benefits: [
      'Hospital & clinic positions',
      'Retail pharmacy jobs',
      'Clinical roles',
      'Professional development resources'
    ]
  },
  {
    id: 'hospital_owner',
    label: 'Hospital Owner / Manager',
    emoji: '🏥',
    color: 'bg-orange-50',
    textColor: 'text-orange-600',
    description: 'Healthcare facility administrator',
    benefits: [
      'Post unlimited job openings',
      'Search verified professionals',
      'Manage hiring pipeline',
      'Dedicated support team'
    ]
  }
]

export function RoleSelectionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromSignup = searchParams.get('from') === 'signup'
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const { currentUser, setCurrentUser } = useAppContext()

  const handleRoleSelect = async (roleId) => {
    setSelectedRole(roleId)
    setLoading(true)

    try {
      const isRecruiter = roleId === 'hospital_owner'
      const baseRole = isRecruiter ? 'recruiter' : 'employee'

      // Save the role to profile
      const userProfile = {
        healthcareRole: roleId,
        role: baseRole
      }
      saveUserProfile(userProfile)
      setCurrentUser({ ...currentUser, role: baseRole })

      // Redirect to main services page based on role category.
      if (isRecruiter) {
        navigate('/recruiter/services')
      } else {
        navigate('/services')
      }
    } catch (error) {
      console.error('Error saving role:', error)
      setLoading(false)
    }
  }

>>>>>>> Stashed changes
  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center p-6 bg-page-bg font-sans">
      <div className="max-w-[800px] w-full mt-10">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-5xl font-normal text-page-text mb-4">How would you like to use ReadyMD?</h1>
          <p className="text-[15px] text-page-text2">Select your profile type to personalise your experience.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Employee Card */}
          <Link to="/signup?role=employee" className="block p-8 bg-page-surface border-2 border-transparent hover:border-page-accent rounded-2xl shadow-sm hover:shadow-lg transition-all group">
            <div className="w-16 h-16 rounded-[14px] bg-teal-50 text-teal-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              👨‍⚕️
            </div>
            <h2 className="font-serif text-2xl font-medium text-page-text mb-3">I'm looking for a job</h2>
            <p className="text-[14px] text-page-text3 mb-8 min-h-[42px]">Create a professional profile, browse verified medical jobs, and apply with one tap.</p>
            <ul className="text-[13px] text-page-text2 space-y-3 font-medium">
              <li className="flex gap-2.5">
                <span className="text-page-accent">✓</span> Access 10,000+ hospital jobs
              </li>
              <li className="flex gap-2.5">
                <span className="text-page-accent">✓</span> Track application status
              </li>
              <li className="flex gap-2.5">
                <span className="text-page-accent">✓</span> Direct messaging with HR
              </li>
            </ul>
            <div className="mt-8 font-semibold text-page-accent group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
              Join as Professional <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>

          {/* Recruiter Card */}
          <Link to="/signup?role=recruiter" className="block p-8 bg-page-surface border-2 border-transparent hover:border-page-accent rounded-2xl shadow-sm hover:shadow-lg transition-all group">
            <div className="w-16 h-16 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🏥
            </div>
            <h2 className="font-serif text-2xl font-medium text-page-text mb-3">I'm looking to hire</h2>
            <p className="text-[14px] text-page-text3 mb-8 min-h-[42px]">Post job openings, search our verified candidate database, and manage interviews.</p>
            <ul className="text-[13px] text-page-text2 space-y-3 font-medium">
              <li className="flex gap-2.5">
                <span className="text-page-accent">✓</span> Verified medical professionals
              </li>
              <li className="flex gap-2.5">
                <span className="text-page-accent">✓</span> Advanced specialty filtering
              </li>
              <li className="flex gap-2.5">
                <span className="text-page-accent">✓</span> Applicant tracking system
              </li>
            </ul>
            <div className="mt-8 font-semibold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
              Join as Employer <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>
        </div>

        <div className="text-center text-[13px] text-page-text3">
          Already have an account? <Link to="/login" className="font-semibold text-page-accent hover:underline">Log in here</Link>
        </div>
      </div>
    </div>
  )
}
