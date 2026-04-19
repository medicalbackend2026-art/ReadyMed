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

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-start pt-8 pb-20 px-4 md:px-8 bg-page-bg font-sans overflow-x-hidden">
      <div className="max-w-[1240px] w-full">
        
        {/* Back button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-page-border2 bg-white text-[13px] font-medium text-page-text2 hover:text-page-text hover:border-page-accent hover:shadow-sm transition-all group"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-serif text-[28px] md:text-4xl font-normal text-page-text mb-3">
            {fromSignup ? 'Welcome to ReadyMed! What\'s your role?' : 'Select Your Healthcare Role'}
          </h1>
          <p className="text-sm text-page-text2">
            Choose your profession to get started with a personalized experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {HEALTHCARE_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              disabled={loading && selectedRole !== role.id}
              className="block p-5 bg-page-surface border-2 border-transparent hover:border-page-accent rounded-2xl shadow-sm hover:shadow-lg transition-all group text-left disabled:opacity-50"
            >
              <div className={`w-12 h-12 rounded-[12px] ${role.color} ${role.textColor} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {role.emoji}
              </div>
              <h2 className="font-serif text-[19px] font-medium text-page-text mb-1.5">{role.label}</h2>
              <p className="text-xs text-page-text3 mb-4 min-h-[36px]">{role.description}</p>
              <ul className="text-[11px] text-page-text2 space-y-1.5 font-medium">
                {role.benefits.slice(0, 2).map((benefit, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-page-accent flex-shrink-0">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 font-semibold text-page-accent group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 text-sm">
                {loading && selectedRole === role.id ? 'Setting up...' : <>Continue <span aria-hidden="true">&rarr;</span></>}
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
