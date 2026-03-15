import React from 'react'
import { Link } from 'react-router-dom'

export function RoleSelectionPage() {
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
