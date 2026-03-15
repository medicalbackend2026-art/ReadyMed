import React, { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { getCompanyProfile } from '../../hooks/useUserProfile'
import { auth } from '../../firebase'

export function RecruiterDashboardPage() {
  const { jobs, applications, toggleJobStatus, removeJob, loadRecruiterData } = useAppContext()
  const navigate = useNavigate()
  const company = getCompanyProfile() || {}

  useEffect(() => { loadRecruiterData() }, [])

  const companyName = company.companyName || 'Your Company'
  const companyCity = company.city || ''
  const isVerified = !!company.regNumber || !!company.regCert

  const activeJobsCount = jobs.length
  const totalAppsCount = applications.length
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length
  const interviewingCount = applications.filter(a => a.status === 'Interviewing').length

  const recentJobs = jobs.slice(0, 4)
  const recentApps = applications.slice(0, 3)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-green-50 text-green-700'
      case 'Interviewing': return 'bg-amber-50 text-amber-700'
      case 'New': return 'bg-gray-100 text-gray-700'
      case 'Reviewed': return 'bg-blue-50 text-blue-700'
      default: return 'bg-pink-50 text-pink-700'
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-20 font-sans">
      
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-7 gap-4">
        <div>
          <h1 className="font-serif text-[26px] text-gray-900 leading-tight">Recruiter Dashboard</h1>
          <div className="text-sm text-gray-500 mt-1">
            {companyName}{companyCity ? ` · ${companyCity}` : ''}
            {isVerified && <span className="text-green-600 font-medium"> · ✓ Verified</span>}
          </div>
        </div>
        <Link to="/recruiter/post-job" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors text-center inline-block">
          + Post a new job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        <div className="bg-white border border-border rounded-xl p-[18px]">
          <div className="font-serif text-[28px] text-blue-600 leading-none mb-1">{activeJobsCount}</div>
          <div className="text-xs text-gray-500">Active job posts</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-[18px]">
          <div className="font-serif text-[28px] text-gray-900 leading-none mb-1">{totalAppsCount}</div>
          <div className="text-xs text-gray-500">Total applications</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-[18px]">
          <div className="font-serif text-[28px] text-green-600 leading-none mb-1">{shortlistedCount}</div>
          <div className="text-xs text-gray-500">Shortlisted</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-[18px]">
          <div className="font-serif text-[28px] text-amber-600 leading-none mb-1">{interviewingCount}</div>
          <div className="text-xs text-gray-500">Interviews this week</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* My Job Posts */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-white">
              <div className="text-[15px] font-semibold text-gray-900">My job posts</div>
              <Link to="/recruiter/post-job" className="text-[13px] font-medium text-blue-600 hover:underline">+ Post new</Link>
            </div>
            
            <div className="divide-y divide-border">
              {recentJobs.length > 0 ? recentJobs.map((job) => {
                const applicantsCount = applications.filter(a => a.jobTitle === job.title).length
                return (
                  <div key={job.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-0.5">{job.title}</div>
                      <div className="text-xs text-gray-500">{job.type} · {job.location} · {job.postedAt || 'Recently'}</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">{applicantsCount} applicants</span>
                      <span className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${job.status === 'draft' ? 'bg-gray-100 text-gray-500 border-gray-200' : job.paused ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                        {job.status === 'draft' ? 'Draft' : job.paused ? 'Paused' : 'Active'}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/recruiter/post-job?edit=${job.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5a2.121 2.121 0 013 3L5 15H1v-4L11.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Edit
                        </button>
                        <button onClick={() => toggleJobStatus(job.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${job.paused ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                          {job.paused ? (
                            <><svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2l11 6-11 6V2z"/></svg> Resume</>
                          ) : (
                            <><svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h3v12H4V2zm5 0h3v12H9V2z"/></svg> Pause</>
                          )}
                        </button>
                        <button onClick={() => {
                          if (window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
                            removeJob(job.id)
                          }
                        }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 hover:border-red-300 transition-colors">
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <div className="px-5 py-8 text-center text-sm text-gray-500">No active job posts.</div>
              )}
            </div>
          </div>

          {/* Recent Candidates */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-white">
              <div className="text-[15px] font-semibold text-gray-900">Recent candidates</div>
              <Link to="/recruiter/applications" className="text-[13px] font-medium text-blue-600 hover:underline">View pipeline &rarr;</Link>
            </div>
            
            <div className="divide-y divide-border">
              {recentApps.length > 0 ? recentApps.map(app => (
                <div key={app.id} onClick={() => navigate('/recruiter/applications')} className="p-3.5 sm:px-5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 bg-blue-100 text-blue-700`}>
                    {getInitials(app.candidateName || app.applicantName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{app.candidateName || app.applicantName || 'Applicant'}</div>
                    <div className="text-xs text-gray-500 truncate">Applied for: {app.jobTitle}</div>
                  </div>
                  <div className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${getStatusColor(app.status)}`}>
                    {app.status}
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm text-gray-500">No candidates have applied yet.</div>
              )}
            </div>
          </div>
          
        </div>

        {/* Side Column */}
        <div className="space-y-4">
          
          {/* Quick Actions */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-white">
              <div className="text-[15px] font-semibold text-gray-900">Quick actions</div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5">
              <Link to="/recruiter/post-job" className="p-4 border border-border rounded-lg text-center hover:border-blue-200 hover:bg-blue-50 transition-all hover:shadow-sm">
                <div className="text-[22px] mb-1.5">📝</div>
                <div className="text-[13px] font-semibold text-gray-700">Post a Job</div>
              </Link>
              <Link to="/recruiter/candidates" className="p-4 border border-border rounded-lg text-center hover:border-blue-200 hover:bg-blue-50 transition-all hover:shadow-sm">
                <div className="text-[22px] mb-1.5">🔍</div>
                <div className="text-[13px] font-semibold text-gray-700">Search Candidates</div>
              </Link>
              <Link to="/recruiter/applications" className="p-4 border border-border rounded-lg text-center hover:border-blue-200 hover:bg-blue-50 transition-all hover:shadow-sm">
                <div className="text-[22px] mb-1.5">📊</div>
                <div className="text-[13px] font-semibold text-gray-700">Manage Pipeline</div>
              </Link>
              <Link to="/recruiter/company-setup" className="p-4 border border-border rounded-lg text-center hover:border-blue-200 hover:bg-blue-50 transition-all hover:shadow-sm">
                <div className="text-[22px] mb-1.5">🏢</div>
                <div className="text-[13px] font-semibold text-gray-700">Edit Company</div>
              </Link>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-white">
              <div className="text-[15px] font-semibold text-gray-900">Notifications</div>
            </div>
            <div className="divide-y divide-border">
              {applications.length === 0 && jobs.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-400 text-center">No notifications yet.</div>
              ) : (
                <>
                  {applications.slice(0, 3).map(app => (
                    <div key={app.id} className="p-4 flex gap-2.5 items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-[5px] shrink-0"></div>
                      <div>
                        <div className="text-[13px] text-gray-700 leading-snug">
                          <span className="font-semibold text-gray-900">{app.candidateName || app.applicantName || 'Someone'}</span> applied for {app.jobTitle}.
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{app.date || 'Recently'}</div>
                      </div>
                    </div>
                  ))}
                  {applications.length > 0 && (
                    <div className="p-4 flex gap-2.5 items-start">
                      <div className="w-2 h-2 rounded-full bg-gray-200 mt-[5px] shrink-0"></div>
                      <div>
                        <div className="text-[13px] text-gray-700 leading-snug">
                          {applications.length} application{applications.length !== 1 ? 's' : ''} received across all listings.
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">Total</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
