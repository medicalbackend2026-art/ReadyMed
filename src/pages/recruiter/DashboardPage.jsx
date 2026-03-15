import React from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

export function RecruiterDashboardPage() {
  const { jobs, applications } = useAppContext()

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

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-20 font-sans">
      
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-7 gap-4">
        <div>
          <h1 className="font-serif text-[26px] text-gray-900 leading-tight">Recruiter Dashboard</h1>
          <div className="text-sm text-gray-500 mt-1">Apollo Hospitals · Delhi NCR · <span className="text-green-600 font-medium">✓ Verified</span></div>
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
                      <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100">Active</span>
                      <div className="flex gap-1">
                        <button className="w-7 h-7 rounded-md border border-border text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-700 transition-colors" title="Edit">✎</button>
                        <button className="w-7 h-7 rounded-md border border-border text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-700 transition-colors" title="Pause">⏸</button>
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
                <div key={app.id} className="p-3.5 sm:px-5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 bg-blue-100 text-blue-700`}>
                    {getInitials(app.candidateName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{app.candidateName}</div>
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
              <Link to="/recruiter/search" className="p-4 border border-border rounded-lg text-center hover:border-blue-200 hover:bg-blue-50 transition-all hover:shadow-sm">
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
              
              <div className="p-4 flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-[5px] shrink-0"></div>
                <div>
                  <div className="text-[13px] text-gray-700 leading-snug"><span className="font-semibold text-gray-900">Dr. Sneha Kulkarni</span> applied for Consultant — Internal Medicine.</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">1 hour ago</div>
                </div>
              </div>
              
              <div className="p-4 flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-[5px] shrink-0"></div>
                <div>
                  <div className="text-[13px] text-gray-700 leading-snug"><span className="font-semibold text-gray-900">Dr. Vikram Singh</span> accepted your invite to apply.</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">3 hours ago</div>
                </div>
              </div>
              
              <div className="p-4 flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-[5px] shrink-0"></div>
                <div>
                  <div className="text-[13px] text-gray-700 leading-snug">Your job post <span className="font-semibold text-gray-900">"ICU Staff Nurse"</span> expires in 3 days.</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Yesterday</div>
                </div>
              </div>

              <div className="p-4 flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-gray-200 mt-[5px] shrink-0"></div>
                <div>
                  <div className="text-[13px] text-gray-700 leading-snug">5 new applications received this week across all listings.</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">2 days ago</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
