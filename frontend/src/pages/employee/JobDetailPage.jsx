import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Avatar } from '../../components/Avatar'
import { FormInput } from '../../components/FormElements'
import { useAppContext } from '../../context/AppContext'

// Custom Modal Component for Apply
function ApplyModal({ isOpen, onClose, job, currentUser, onApply }) {
  const [showToast, setShowToast] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [trackingId, setTrackingId] = useState('')

  if (!isOpen && !showToast) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const success = await onApply(job.id, { applicantName: currentUser?.name, coverNote })
    setSubmitting(false)
    if (success !== false) {
      setTrackingId(`RMD-${Math.floor(Math.random() * 1000000)}`)
      onClose()
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    }
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="bg-white rounded-[18px] p-8 max-w-[480px] w-full shadow-xl">
          <h2 className="font-serif text-2xl mb-1.5">Apply for this job</h2>
          <p className="text-sm text-gray-500 mb-5">Your saved profile will be sent to {job?.hospital}.</p>
          
          <div className="bg-gray-50 border border-border rounded-lg p-3.5 mb-4 flex items-center gap-3">
            <Avatar size="lg" variant="teal">{currentUser?.name?.substring(0, 2).toUpperCase()}</Avatar>
            <div>
              <div className="text-sm font-semibold text-gray-900">{currentUser?.name}</div>
              <div className="text-xs text-gray-500">Professional · {currentUser?.email}</div>
            </div>
          </div>

          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cover note (optional)</label>
            <textarea 
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-teal-200 focus:ring-3 focus:ring-teal-200/20 placeholder:text-gray-400" 
              rows="3" 
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              placeholder="Add a brief note explaining why you're a good fit for this role..."
            ></textarea>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-lg p-2.5 text-xs text-teal-700 flex items-center gap-2 mb-5">
            <span className="shrink-0 text-sm">📋</span>
            <span>Your resume (uploaded_cv.pdf) will be attached automatically.</span>
          </div>

          <div className="flex gap-2.5">
            <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit application →'}
            </Button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-teal-700 text-white px-6 py-3.5 rounded-xl text-sm font-medium shadow-lg z-[600] flex items-center gap-2 animate-[pulse-dot_0.3s_ease-out]">
          ✓ Application submitted! Tracking ID: #{trackingId}
        </div>
      )}
    </>
  )
}

export function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isLocumMode = location.pathname.startsWith('/locum')
  const jobsBasePath = isLocumMode ? '/locum/jobs' : '/jobs'

  const { browseJobs: jobs, myApplications, applyForJob, currentUser, toggleSaveJob, isJobSaved } = useAppContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fetchedJob, setFetchedJob] = useState(null)
  const [loading, setLoading] = useState(true)

  const jobFromContext = jobs.find(j => j.id?.toString() === id)

  useEffect(() => {
    if (jobFromContext) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.job) setFetchedJob(data.job) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, jobFromContext])

  const job = jobFromContext || fetchedJob

  // Check if current user has already applied for this role
  const hasApplied = !!(job && myApplications.some(app =>
    String(app.jobId) === String(job.id) ||
    (app.jobTitle === job.title && (app.applicantUid || app.candidateName) === (currentUser?.uid || currentUser?.name))
  ))

  if (loading) {
    return (
      <div className="max-w-[920px] mx-auto px-6 py-20 text-center font-sans">
        <div className="text-gray-400 text-sm animate-pulse">Loading job details…</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-[920px] mx-auto px-6 py-20 text-center font-sans">
        <h2 className="text-2xl font-serif mb-4">Job Not Found</h2>
        <p className="text-gray-500 mb-6">The job you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate(jobsBasePath)} variant="primary">Back to {isLocumMode ? 'Locum jobs' : 'Jobs'}</Button>
      </div>
    )
  }

  const getLogoStyle = (hospitalName) => {
    const name = hospitalName || 'XX'
    const initials = name.substring(0, 2).toUpperCase()
    const colorOptions = ['teal', 'blue', 'amber', 'pink', 'purple']
    const color = colorOptions[name.length % colorOptions.length]
    return { initials, color }
  }
  const logo = getLogoStyle(job?.hospital)

  return (
    <div className="max-w-[920px] mx-auto px-6 py-8 pb-20 font-sans">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-6">
        <Link to={jobsBasePath} className="text-gray-500 hover:text-teal-600">{isLocumMode ? 'Locum shifts' : 'Jobs'}</Link>
        <span>›</span>
        <span className="truncate">{job.title} — {job.hospital}</span>
      </div>

      {/* Header */}
      <div className="flex gap-[18px] items-start mb-6">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 bg-${logo.color}-50 text-${logo.color}-700`}>
          {logo.initials}
        </div>
        <div>
          <h1 className="font-serif text-[28px] text-gray-900 mb-1 font-normal leading-tight">{job.title}</h1>
          <div className="text-[15px] text-gray-500 mb-2.5">
            <Link to="#" className="text-teal-600 font-medium hover:underline">{job.hospital}</Link> · {job.location} · {job.posted}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="teal">{job.salary}</Badge>
            <Badge variant="outline">{job.type}</Badge>
            {job.requirements && <Badge variant="outline">{job.requirements[1] || 'Experience required'}</Badge>}
            <Badge variant="pink">{job.specialisation}</Badge>
            {job.tags && job.tags.map(t => <Badge key={t} variant="green">{t}</Badge>)}
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex gap-2.5 mb-8">
        {hasApplied ? (
          <Button variant="primary" size="lg" disabled className="opacity-70 cursor-not-allowed bg-teal-800">✓ Applied</Button>
        ) : (
          <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>Apply now</Button>
        )}
        <Button variant="secondary" onClick={() => toggleSaveJob(job)}>
          {isJobSaved(job.id) ? '★ Saved' : '☆ Save job'}
        </Button>
        <Button variant="ghost">Share</Button>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-[2fr_1fr] gap-6">
        
        {/* Main Content */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-3.5 pb-2.5 border-b border-border">Job description</h3>
            <div className="text-sm text-gray-700 leading-[1.7] space-y-4">
              <p>{job.description}</p>
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-3.5 pb-2.5 border-b border-border">Requirements</h3>
            <ul className="list-disc pl-[18px] text-sm text-gray-700 leading-[1.7] space-y-1.5 marker:text-gray-400">
              {job.requirements ? job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              )) : (
                <li>No specific requirements listed.</li>
              )}
            </ul>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-3.5 pb-2.5 border-b border-border">Benefits</h3>
            <ul className="list-disc pl-[18px] text-sm text-gray-700 leading-[1.7] space-y-1.5 marker:text-gray-400">
              <li>Competitive salary with performance incentives</li>
              <li>Medical insurance for self and family</li>
              <li>Continuing medical education (CME) allowance</li>
              <li>Conference and research funding</li>
              <li>Relocation assistance available</li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-3.5 pb-2.5 border-b border-border">Key information</h3>
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { label: 'Salary range', value: job.salary },
                { label: 'Department', value: job.specialisation },
                { label: 'Employment type', value: job.type },
                { label: 'Location', value: job.location },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">About {job.hospital}</h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-[13px]"><span className="text-gray-500">Type</span><span className="font-semibold text-gray-900">Hospital</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-gray-500">Location</span><span className="font-semibold text-gray-900">{job.location.split(',')[0]}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-gray-500">Verified</span><span className="font-semibold text-green-600">✓ Yes</span></div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-1 pt-1">Similar openings</h3>
            <div className="divide-y divide-border">
              {jobs.filter(j => j.id !== job.id && j.specialisation === job.specialisation).slice(0, 3).map(simJob => (
                <Link key={simJob.id} to={`${jobsBasePath}/${simJob.id}`} className="block py-3 group">
                  <div className="text-[13px] font-semibold text-gray-900 mb-0.5 group-hover:text-teal-600 transition-colors">{simJob.title}</div>
                  <div className="text-xs text-gray-500">{simJob.hospital} · {simJob.location.split(',')[0]} · {simJob.salary.split(' ')[0]}</div>
                </Link>
              ))}
              {jobs.filter(j => j.id !== job.id && j.specialisation === job.specialisation).length === 0 && (
                <div className="py-3 text-xs text-gray-500">No similar jobs found right now.</div>
              )}
            </div>
          </Card>
        </div>

      </div>

      <ApplyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        job={job}
        currentUser={currentUser}
        onApply={applyForJob}
      />
    </div>
  )
}
