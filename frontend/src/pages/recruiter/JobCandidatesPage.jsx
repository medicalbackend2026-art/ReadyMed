import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { auth } from '../../firebase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const STAGES = ['New', 'Reviewed', 'Shortlisted', 'Interviewing', 'Offer sent', 'Rejected']

const stageColors = {
  New: 'bg-gray-100 text-gray-700',
  Reviewed: 'bg-blue-50 text-blue-700',
  Shortlisted: 'bg-teal-50 text-teal-700',
  Interviewing: 'bg-amber-50 text-amber-700',
  'Offer sent': 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-600',
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function formatDate(iso) {
  if (!iso) return 'Recently'
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return 'Recently' }
}

export function JobCandidatesPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { jobs, applications, updateApplicationStatus, loadRecruiterData } = useAppContext()

  const [jobApps, setJobApps] = useState([])
  const [candidateProfiles, setCandidateProfiles] = useState({}) // uid → profile
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('candidates') // 'candidates' | 'pipeline'
  const [expandedCard, setExpandedCard] = useState(null)

  const job = jobs.find(j => String(j.id) === String(jobId))

  useEffect(() => {
    loadRecruiterData()
    fetchJobApplications()
  }, [jobId])

  const fetchJobApplications = async () => {
    setLoading(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        const res = await fetch(`${API}/api/applications/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const { applications: apps } = await res.json()
          setJobApps(apps || [])
          // Fetch candidate profiles
          const uids = [...new Set(apps.map(a => a.applicantUid).filter(Boolean))]
          fetchCandidateProfiles(uids, token)
          return
        }
      }
    } catch {}
    // Fallback: filter from context
    const filtered = applications.filter(a => String(a.jobId) === String(jobId) || a.jobTitle === job?.title)
    setJobApps(filtered)
    setLoading(false)
  }

  const fetchCandidateProfiles = async (uids, token) => {
    const profiles = {}
    await Promise.all(
      uids.map(async uid => {
        try {
          const res = await fetch(`${API}/api/users/${uid}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const { profile } = await res.json()
            if (profile) profiles[uid] = profile
          }
        } catch {}
      })
    )
    setCandidateProfiles(profiles)
    setLoading(false)
  }

  const handleStatusChange = (appId, newStatus) => {
    updateApplicationStatus(appId, newStatus)
    setJobApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
  }

  const getNextActions = (status, appId) => {
    const btn = (label, next, color) => (
      <button
        key={next}
        onClick={() => handleStatusChange(appId, next)}
        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${color}`}
      >
        {label}
      </button>
    )
    switch (status) {
      case 'New': return [btn('✓ Review', 'Reviewed', 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'), btn('✕ Reject', 'Rejected', 'border-red-100 bg-white text-red-600 hover:bg-red-50')]
      case 'Reviewed': return [btn('Shortlist →', 'Shortlisted', 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'), btn('Pass', 'Rejected', 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50')]
      case 'Shortlisted': return [btn('Schedule Interview', 'Interviewing', 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100')]
      case 'Interviewing': return [btn('Extend Offer', 'Offer sent', 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'), btn('Reject', 'Rejected', 'border-red-100 bg-white text-red-600 hover:bg-red-50')]
      default: return []
    }
  }

  // Pipeline grouped by status
  const pipeline = {
    New: jobApps.filter(a => a.status === 'New'),
    Reviewed: jobApps.filter(a => a.status === 'Reviewed'),
    Shortlisted: jobApps.filter(a => a.status === 'Shortlisted'),
    Interviewing: jobApps.filter(a => a.status === 'Interviewing'),
    Decision: jobApps.filter(a => ['Offer sent', 'Rejected'].includes(a.status)),
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-20 font-sans">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/recruiter/applications')} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to all jobs
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-serif text-[24px] text-gray-900 leading-tight">{job?.title || 'Job Applications'}</h1>
            {job && <div className="text-[13px] text-gray-500 mt-0.5">{job.type} · {job.location} · {job.department || job.profession}</div>}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">{jobApps.length} applicant{jobApps.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${activeTab === 'candidates' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Candidates {jobApps.length > 0 && <span className="ml-1.5 text-[11px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{jobApps.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${activeTab === 'pipeline' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pipeline
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading candidates…</div>
      ) : jobApps.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-sm font-semibold text-gray-700 mb-1">No applications yet</div>
          <div className="text-xs text-gray-400">Candidates who apply for this job will appear here.</div>
        </div>
      ) : activeTab === 'candidates' ? (
        /* ── Candidates List ── */
        <div className="space-y-4">
          {jobApps.map(app => {
            const profile = candidateProfiles[app.applicantUid] || {}
            const name = app.candidateName || app.applicantName || 'Applicant'
            const isExpanded = expandedCard === app.id
            const exp = profile.experiences?.[0]
            const qual = profile.qualifications?.[0]

            return (
              <div key={app.id} className="bg-white border border-border rounded-xl overflow-hidden hover:border-blue-200 transition-colors">
                {/* Card Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[15px] font-bold shrink-0">
                    {getInitials(name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold text-gray-900">{name}</span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${stageColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-[13px] text-gray-600 mb-1">
                      {profile.profession || app.candidateRole || 'Healthcare Professional'}
                      {exp?.hospital && <span className="text-gray-400"> · {exp.hospital}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-[12px] text-gray-500">
                      {app.applicantEmail && <span>✉ {app.applicantEmail}</span>}
                      {profile.preferredCity && <span>📍 {profile.preferredCity}</span>}
                      {profile.expectedSalary && <span>💰 ₹{profile.expectedSalary} expected</span>}
                      <span>Applied {formatDate(app.appliedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div className="flex flex-wrap gap-1.5">
                      {getNextActions(app.status, app.id)}
                    </div>
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : app.id)}
                      className="text-[12px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide profile' : 'View full profile'}
                      <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Profile */}
                {isExpanded && (
                  <div className="border-t border-border bg-gray-50 p-5 space-y-4">
                    {/* Skills */}
                    {profile.skills?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</div>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.skills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-border rounded-full text-[12px] text-gray-700">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Experience */}
                      {profile.experiences?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Experience</div>
                          <div className="space-y-2">
                            {profile.experiences.map((e, i) => (
                              <div key={i} className="bg-white border border-border rounded-lg p-3">
                                <div className="text-[13px] font-semibold text-gray-800">{e.jobTitle}</div>
                                <div className="text-[12px] text-gray-500">{e.hospital}{e.department ? ` · ${e.department}` : ''}</div>
                                <div className="text-[11px] text-gray-400 mt-0.5">{e.startDate}{e.endDate ? ` → ${e.endDate}` : ' → Present'}</div>
                                {e.duties && <div className="text-[12px] text-gray-600 mt-1 line-clamp-2">{e.duties}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {profile.qualifications?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Education</div>
                          <div className="space-y-2">
                            {profile.qualifications.map((q, i) => (
                              <div key={i} className="bg-white border border-border rounded-lg p-3">
                                <div className="text-[13px] font-semibold text-gray-800">{q.degree}</div>
                                <div className="text-[12px] text-gray-500">{q.institution}</div>
                                {q.specialisation && <div className="text-[12px] text-gray-400">{q.specialisation}</div>}
                                {q.yearOfPassing && <div className="text-[11px] text-gray-400 mt-0.5">Passed {q.yearOfPassing}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cover Note */}
                    {app.coverNote && (
                      <div>
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Cover Note</div>
                        <div className="bg-white border border-border rounded-lg p-3 text-[13px] text-gray-700 italic">"{app.coverNote}"</div>
                      </div>
                    )}

                    {/* Resume */}
                    <div>
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Resume</div>
                      {profile.resumeUrl ? (
                        <a
                          href={profile.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 bg-white border border-teal-200 rounded-lg p-3 hover:border-teal-400 hover:bg-teal-50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-red-50 border border-red-100 rounded flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6l-4-4H4v16zm8-14l2 2h-2V4zM6 10h8v1H6v-1zm0 2h8v1H6v-1zm0 2h5v1H6v-1z"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-gray-700 truncate">{profile.resumeFilename || 'Resume.pdf'}</div>
                            <div className="text-[11px] text-teal-600">Click to view PDF ↗</div>
                          </div>
                          <svg className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      ) : profile.resumeFilename ? (
                        <div className="flex items-center gap-2.5 bg-white border border-border rounded-lg p-3">
                          <div className="w-8 h-8 bg-red-50 border border-red-100 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6l-4-4H4v16zm8-14l2 2h-2V4zM6 10h8v1H6v-1zm0 2h8v1H6v-1zm0 2h5v1H6v-1z"/></svg>
                          </div>
                          <span className="text-[13px] text-gray-700">{profile.resumeFilename}</span>
                          <span className="text-[11px] text-amber-500 ml-auto">⚠ File not linked</span>
                        </div>
                      ) : (
                        <div className="text-[12px] text-gray-400 italic">No resume uploaded</div>
                      )}
                    </div>

                    {/* Preferences */}
                    {(profile.preferredJobType || profile.noticePeriod || profile.openToRelocation) && (
                      <div>
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Preferences</div>
                        <div className="flex flex-wrap gap-2 text-[12px]">
                          {profile.preferredJobType && <span className="px-2.5 py-1 bg-white border border-border rounded-full text-gray-600">Prefers {profile.preferredJobType}</span>}
                          {profile.noticePeriod && <span className="px-2.5 py-1 bg-white border border-border rounded-full text-gray-600">{profile.noticePeriod} days notice</span>}
                          {profile.openToRelocation === 'Yes' && <span className="px-2.5 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-700">Open to relocation</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Pipeline View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-start">
          {Object.entries(pipeline).map(([stage, apps]) => (
            <div key={stage} className="bg-gray-50 border border-border rounded-xl p-3.5 min-h-[260px]">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[13px] font-semibold text-gray-700">{stage === 'Decision' ? 'Decision' : stage}</div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  stage === 'New' ? 'bg-gray-200 text-gray-600'
                  : stage === 'Reviewed' ? 'bg-blue-50 text-blue-700'
                  : stage === 'Shortlisted' ? 'bg-teal-50 text-teal-700'
                  : stage === 'Interviewing' ? 'bg-amber-50 text-amber-700'
                  : 'bg-pink-50 text-pink-700'
                }`}>{apps.length}</span>
              </div>
              <div className="space-y-2">
                {apps.map(app => {
                  const name = app.candidateName || app.applicantName || 'Applicant'
                  return (
                    <div key={app.id} className="bg-white border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">{getInitials(name)}</div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-gray-900 truncate">{name}</div>
                          <div className="text-[10px] text-gray-400">{formatDate(app.appliedAt)}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getNextActions(app.status, app.id).slice(0, 2)}
                      </div>
                    </div>
                  )
                })}
                {apps.length === 0 && <div className="text-[11px] text-gray-400 text-center py-4">Empty</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-center">
        <span className="text-[13px] text-blue-700">ℹ️ Status changes reflect live on the candidate's <strong>My Applications</strong> dashboard.</span>
      </div>
    </div>
  )
}
