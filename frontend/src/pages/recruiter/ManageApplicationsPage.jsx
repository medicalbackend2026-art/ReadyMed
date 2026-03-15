import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

export function ManageApplicationsPage() {
  const { jobs, applications, loadRecruiterData } = useAppContext()
  const navigate = useNavigate()

  useEffect(() => { loadRecruiterData() }, [])

  const getApplicantCount = (jobId, jobTitle) =>
    applications.filter(a => String(a.jobId) === String(jobId) || a.jobTitle === jobTitle).length

  const getStatusBreakdown = (jobId, jobTitle) => {
    const apps = applications.filter(a => String(a.jobId) === String(jobId) || a.jobTitle === jobTitle)
    return {
      New: apps.filter(a => a.status === 'New').length,
      Shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
      Interviewing: apps.filter(a => a.status === 'Interviewing').length,
      'Offer sent': apps.filter(a => a.status === 'Offer sent').length,
    }
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 pb-20 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-7 gap-2">
        <div>
          <h1 className="font-serif text-[26px] text-gray-900 leading-tight">Applications</h1>
          <p className="text-[13px] text-gray-500 mt-1">Click on a job to review candidates and manage the pipeline.</p>
        </div>
        <Link to="/recruiter/post-job" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors text-center">
          + Post new job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <div className="text-3xl mb-3">📋</div>
          <div className="text-sm font-semibold text-gray-700 mb-1">No job posts yet</div>
          <div className="text-xs text-gray-400 mb-4">Post a job to start receiving applications.</div>
          <Link to="/recruiter/post-job" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Post a job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const count = getApplicantCount(job.id, job.title)
            const breakdown = getStatusBreakdown(job.id, job.title)
            return (
              <div
                key={job.id}
                onClick={() => navigate(`/recruiter/applications/${job.id}`)}
                className="bg-white border border-border rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold text-gray-900">{job.title}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        job.status === 'draft' ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : job.paused ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        {job.status === 'draft' ? 'Draft' : job.paused ? 'Paused' : 'Active'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{job.type} · {job.location} · {job.department || job.profession}</div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {count > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{count} applicant{count !== 1 ? 's' : ''}</span>
                        <div className="hidden sm:flex gap-1.5 text-[11px]">
                          {breakdown.New > 0 && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{breakdown.New} new</span>}
                          {breakdown.Shortlisted > 0 && <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{breakdown.Shortlisted} shortlisted</span>}
                          {breakdown.Interviewing > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{breakdown.Interviewing} interviewing</span>}
                          {breakdown['Offer sent'] > 0 && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700">{breakdown['Offer sent']} offer</span>}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-gray-400">No applicants yet</span>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

