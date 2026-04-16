import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useAppContext } from '../../context/AppContext'
import { getUserProfile, getProfileCompletion } from '../../hooks/useUserProfile'

export function DashboardPage() {
  const location = useLocation()
  const isLocumMode = location.pathname.startsWith('/locum')
  const jobsBasePath = isLocumMode ? '/locum/jobs' : '/jobs'

  const { myApplications, currentUser, loadMyApplications, savedJobs, toggleSaveJob, browseJobs, jobsLoading } = useAppContext()

  useEffect(() => { loadMyApplications() }, [])

  const profile = getUserProfile()
  const completionPercentage = getProfileCompletion(profile)
  const displayName = profile?.name || currentUser?.name || 'there'

  const isLocumApp = (app) => {
    const t = String(app?.jobType || app?.type || app?.employmentType || '').toLowerCase()
    if (t.includes('locum')) return true
    const job = browseJobs.find(j => String(j.id) === String(app?.jobId))
    const jt = String(job?.type || job?.employmentType || '').toLowerCase()
    return jt.includes('locum')
  }

  const myApps = isLocumMode
    ? myApplications.filter(isLocumApp)
    : myApplications.filter(a => !isLocumApp(a))

  // Build real notifications from application statuses
  const notifications = [
    ...myApps
      .filter(a => a.status && a.status !== 'New')
      .map(a => {
        const hospital = a.hospital || 'A hospital'
        const title = a.jobTitle || a.title || 'the role'
        const date = a.appliedAt ? new Date(a.appliedAt) : null
        const timeAgo = date ? (() => {
          const diff = Date.now() - date.getTime()
          const days = Math.floor(diff / 86400000)
          if (days === 0) return 'Today'
          if (days === 1) return 'Yesterday'
          return `${days} days ago`
        })() : 'Recently'
        const statusMap = {
          'Shortlisted': { text: <><strong className="text-gray-900">{hospital}</strong> shortlisted you for {title}.</>, isNew: true },
          'Interviewing': { text: <><strong className="text-gray-900">{hospital}</strong> scheduled an interview for {title}.</>, isNew: true },
          'Offer sent': { text: <><strong className="text-gray-900">{hospital}</strong> sent you an offer for {title}!</>, isNew: true },
          'Rejected': { text: <><strong className="text-gray-900">{hospital}</strong> has updated your application for {title}.</>, isNew: false },
          'Reviewed': { text: <><strong className="text-gray-900">{hospital}</strong> reviewed your application for {title}.</>, isNew: false },
        }
        const n = statusMap[a.status]
        if (!n) return null
        return { text: n.text, time: timeAgo, new: n.isNew }
      })
      .filter(Boolean),
    browseJobs.length > 0
      ? { text: <>{browseJobs.length} jobs are available on ReadyMed right now.</>, time: 'Now', new: false }
      : null,
    completionPercentage < 100
      ? { text: <>Complete your profile to improve matches — you're at {completionPercentage}%.</>, time: 'Tip', new: false }
      : null,
  ].filter(Boolean)

  // Recommended: jobs not already applied to
  const appliedJobIds = new Set(myApplications.map(a => String(a.jobId)))
  const recommendedJobs = browseJobs
    .filter(j => !appliedJobIds.has(String(j.id)))
    .filter(j => {
      const t = String(j?.type || j?.employmentType || '').toLowerCase()
      return isLocumMode ? t.includes('locum') : !t.includes('locum')
    })
    .slice(0, 3)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Offer sent': return 'bg-teal-50 text-teal-700 border-teal-100'
      case 'Shortlisted': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'Interviewing': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'New': 
      case 'Reviewed': return 'bg-gray-50 text-gray-700 border-border'
      case 'Rejected': return 'bg-pink-50 text-pink-700 border-pink-100'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-20 font-sans">
      
      {/* Welcome Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="font-serif text-[26px] text-gray-900 mb-1">Welcome back, {displayName}</h1>
          <div className="text-sm text-gray-500">Here's what's happening with your job search today.</div>
        </div>
        <Link
          to="/profile-setup"
          state={isLocumMode ? { editMode: true, mode: 'locum', redirectTo: '/locum/dashboard' } : { editMode: true }}
          className="px-4 py-2 rounded-lg border border-teal-300 bg-teal-50 text-teal-700 text-[13px] font-semibold hover:bg-teal-100 transition-colors"
        >
          {isLocumMode ? 'Edit locum profile' : 'Edit profile'}
        </Link>
      </div>

      {/* Profile Completion Banner — only shown when profile is incomplete */}
      {completionPercentage < 100 && (
        <div className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 rounded-[14px] p-5 md:p-6 flex flex-col md:flex-row items-center gap-[18px] mb-7">
          <div className="font-serif text-[36px] text-teal-700 leading-none">{completionPercentage}%</div>
          <div className="flex-1 w-full text-center md:text-left">
            <div className="text-sm font-semibold text-teal-700 mb-1.5">Profile completion</div>
            <div className="h-1.5 w-full bg-teal-100 rounded-full mb-1 overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
            </div>
            <div className="text-xs text-teal-600">
              Upload a photo and resume to reach 100% — complete profiles get 3× more views.
            </div>
          </div>
          <Button
            to="/profile-setup#step6"
            state={isLocumMode ? { editMode: true, mode: 'locum', redirectTo: '/locum/dashboard' } : undefined}
            variant="primary"
            size="sm"
            className="w-full md:w-auto shrink-0"
          >
            Complete profile &rarr;
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {[
          { label: 'Applications sent', value: myApps.length.toString(), color: 'gray-900' },
          { label: 'Shortlisted', value: myApps.filter(a => a.status === 'Shortlisted').length.toString(), color: 'teal-600' },
          { label: 'Interview scheduled', value: myApps.filter(a => a.status === 'Interviewing').length.toString(), color: 'blue-600' },
          { label: 'Saved jobs', value: savedJobs.length.toString(), color: 'amber-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-[18px]">
            <div className={`font-serif text-[28px] mb-0.5 text-${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        
        {/* Left Column */}
        <div className="space-y-5">
          {/* Applications */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">My applications</div>
            </div>
            
            <div className="divide-y divide-border">
              {myApps.length > 0 ? myApps.map((app, i) => {
                const title = app.jobTitle || app.title || 'Job Application'
                const hospital = app.hospital || ''
                const displayDate = app.date || (app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently')
                const matchScore = app.matchScore ? app.matchScore.toString().replace('%','') : null
                const jobLink = app.jobId ? `${jobsBasePath}/${app.jobId}` : null
                return (
                  <Link
                    key={app.id || i}
                    to={jobLink || '#'}
                    className="px-5 py-4 flex gap-3.5 items-start hover:bg-teal-50 transition-colors cursor-pointer group block"
                  >
                    <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 bg-blue-50 text-blue-700 group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                      {title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-0.5 truncate group-hover:text-teal-700 transition-colors">{title}</div>
                      <div className="text-xs text-gray-500 truncate">{hospital}{hospital && displayDate ? ' · ' : ''}{displayDate}</div>
                    </div>
                    <div className="text-right shrink-0 px-2">
                      <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(app.status)} mb-1`}>
                        {app.status || 'New'}
                      </span>
                      {matchScore && <div className="text-[11px] text-gray-400">{matchScore}% Match</div>}
                    </div>
                  </Link>
                )
              }) : (
                <div className="px-5 py-8 text-center text-sm text-gray-500">You haven't applied to any {isLocumMode ? 'locum shifts' : 'jobs'} yet. <Link to={jobsBasePath} className="text-teal-600 hover:underline font-medium">Browse {isLocumMode ? 'locum shifts' : 'jobs'} →</Link></div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">Recommended for you</div>
              <Link to={jobsBasePath} className="text-[13px] font-medium text-teal-600 hover:underline">Browse all &rarr;</Link>
            </div>
            <div className="divide-y divide-border">
              {jobsLoading ? (
                <div className="px-5 py-8 text-center text-sm text-gray-500">Loading jobs...</div>
              ) : recommendedJobs.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-500">No {isLocumMode ? 'locum shifts' : 'jobs'} available right now. <Link to={jobsBasePath} className="text-teal-600 hover:underline font-medium">Browse all →</Link></div>
              ) : recommendedJobs.map(job => {
                const initials = job.hospital?.substring(0, 2).toUpperCase() || '??'
                const colors = ['purple', 'green', 'blue', 'teal', 'amber']
                const color = colors[(job.hospital?.length || 0) % colors.length]
                return (
                  <Link key={job.id} to={`${jobsBasePath}/${job.id}`} className="px-5 py-4 flex gap-3.5 items-center hover:bg-gray-50 transition-colors block">
                    <div className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 bg-${color}-50 text-${color}-700`}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{job.title}</div>
                      <div className="text-xs text-gray-500 truncate">{job.hospital}{job.location ? ` · ${job.location}` : ''}{job.salary ? ` · ${job.salary}` : ''}</div>
                    </div>
                    <span className="text-[12px] text-teal-600 font-medium shrink-0">View →</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Notifications */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">Notifications</div>
            </div>
            <div className="divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-500">No notifications yet. Apply to jobs to get updates here.</div>
              ) : notifications.map((n, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-2.5 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.new ? 'bg-teal-400' : 'bg-gray-200'}`} />
                  <div>
                    <div className="text-[13px] text-gray-700 leading-snug mb-0.5">{n.text}</div>
                    <div className="text-[11px] text-gray-400">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Jobs */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">Saved jobs ({savedJobs.length})</div>
              <Link to={jobsBasePath} className="text-[13px] font-medium text-teal-600 hover:underline">Browse more →</Link>
            </div>
            <div className="divide-y divide-border">
              {savedJobs.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-500">No saved {isLocumMode ? 'locum shifts' : 'jobs'} yet. <Link to={jobsBasePath} className="text-teal-600 hover:underline font-medium">Browse {isLocumMode ? 'locum shifts' : 'jobs'} →</Link></div>
              ) : savedJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="text-[14px] font-semibold text-gray-900 mb-0.5">{job.title}</div>
                  <div className="text-xs text-gray-500 mb-2.5">{job.hospital}{job.location ? ` · ${job.location}` : ''}{job.salary ? ` · ${job.salary}` : ''}</div>
                  <div className="flex gap-2">
                    <Button to={`${jobsBasePath}/${job.id}`} variant="primary" size="sm" className="py-1 px-3 text-xs">View →</Button>
                    <button onClick={() => toggleSaveJob(job)} className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">✕ Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
