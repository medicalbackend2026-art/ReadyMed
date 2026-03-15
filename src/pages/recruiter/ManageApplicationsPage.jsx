import React, { useState } from 'react'
import { Badge } from '../../components/Badge'
import { useAppContext } from '../../context/AppContext'

export function ManageApplicationsPage() {
  const { applications, jobs, updateApplicationStatus } = useAppContext()
  const [selectedJob, setSelectedJob] = useState(null)

  // Get unique jobs that have applications
  const activeJobs = [...new Set(applications.map(app => app.jobTitle))]

  // If no job is selected, select the first one by default
  const currentJobTitle = selectedJob || activeJobs[0]

  // Filter applications for the selected job
  const jobApps = applications.filter(app => app.jobTitle === currentJobTitle)

  // Group applications by status
  const groupedApps = {
    'New': jobApps.filter(app => app.status === 'New'),
    'Reviewed': jobApps.filter(app => app.status === 'Reviewed'),
    'Shortlisted': jobApps.filter(app => app.status === 'Shortlisted'),
    'Interviewing': jobApps.filter(app => app.status === 'Interviewing'),
    'Decisions': jobApps.filter(app => ['Offer sent', 'Rejected'].includes(app.status))
  }

  // Count active jobs for the selector
  const activeJobCounts = activeJobs.map(title => ({
    title,
    count: applications.filter(app => app.status !== 'Rejected' && app.jobTitle === title).length
  }))

  const handleStatusChange = (appId, newStatus) => {
    updateApplicationStatus(appId, newStatus)
  }

  // Helper colors
  const colorOptions = ['teal', 'blue', 'amber', 'pink', 'coral', 'purple']
  
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('')
  const getColor = (id) => colorOptions[id % colorOptions.length]

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 pb-20 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
        <div>
          <h1 className="font-serif text-[26px] text-gray-900 leading-tight">Manage applications</h1>
          <div className="text-[13px] text-gray-500 mt-1">Use the action buttons on each card to move candidates across stages.</div>
        </div>
      </div>

      {/* Job Selector */}
      {activeJobCounts.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeJobCounts.map(job => (
            <button
              key={job.title}
              onClick={() => setSelectedJob(job.title)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border ${
                currentJobTitle === job.title 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-white border-border text-gray-500 hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              {job.title} 
              <span className={`text-[11px] font-bold px-1.5 py-px rounded-full ml-1.5 ${
                currentJobTitle === job.title ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {job.count}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 text-gray-500 rounded-xl border border-border">No standard applications received yet.</div>
      )}

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-start overflow-x-auto pb-4">
        
        {/* Applied Col */}
        <div className="bg-gray-50 border border-border rounded-xl p-3.5 min-h-[300px]">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[13px] font-semibold text-gray-700">Applied</div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{groupedApps['New']?.length || 0}</span>
          </div>
          
          <div className="space-y-2.5">
            {groupedApps['New']?.map(app => (
              <div key={app.id} className="bg-white border border-border rounded-lg p-3.5 hover:shadow-sm transition-shadow">
                <div className="flex gap-2.5 items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-${getColor(app.id)}-100 text-${getColor(app.id)}-700`}>{getInitials(app.candidateName)}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{app.candidateName}</div>
                    <div className="text-[11px] text-gray-500 truncate">{app.candidateRole}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="green" size="sm">{app.matchScore} match</Badge>
                  <span className="text-[11px] text-gray-400">{app.date}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleStatusChange(app.id, 'Reviewed')} className="flex-1 py-1 rounded-md text-[11px] font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">✓ Review</button>
                  <button onClick={() => handleStatusChange(app.id, 'Rejected')} className="flex-1 py-1 rounded-md text-[11px] font-semibold border border-coral-100 bg-white text-coral-700 hover:bg-coral-50 transition-colors">✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviewed Col */}
        <div className="bg-gray-50 border border-border rounded-xl p-3.5 min-h-[300px]">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[13px] font-semibold text-gray-700">Reviewed</div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{groupedApps['Reviewed']?.length || 0}</span>
          </div>
          
          <div className="space-y-2.5">
            {groupedApps['Reviewed']?.map(app => (
              <div key={app.id} className="bg-white border border-border rounded-lg p-3.5 hover:shadow-sm transition-shadow">
                <div className="flex gap-2.5 items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-${getColor(app.id)}-100 text-${getColor(app.id)}-700`}>{getInitials(app.candidateName)}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{app.candidateName}</div>
                    <div className="text-[11px] text-gray-500 truncate">{app.candidateRole}</div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-3">
                  <span>{app.matchScore} match</span><span>{app.date}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleStatusChange(app.id, 'Shortlisted')} className="flex-1 py-1 rounded-md text-[11px] font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Shortlist &rarr;</button>
                  <button onClick={() => handleStatusChange(app.id, 'Rejected')} className="flex-1 py-1 rounded-md text-[11px] font-semibold border border-border bg-white text-gray-600 hover:bg-gray-50 transition-colors">Pass</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shortlisted Col */}
        <div className="bg-gray-50 border border-border rounded-xl p-3.5 min-h-[300px]">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[13px] font-semibold text-gray-700">Shortlisted</div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{groupedApps['Shortlisted']?.length || 0}</span>
          </div>
          
          <div className="space-y-2.5">
            {groupedApps['Shortlisted']?.map(app => (
              <div key={app.id} className="bg-white border border-border rounded-lg p-3.5 hover:shadow-sm transition-shadow">
                <div className="flex gap-2.5 items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-${getColor(app.id)}-100 text-${getColor(app.id)}-700`}>{getInitials(app.candidateName)}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{app.candidateName}</div>
                    <div className="text-[11px] text-gray-500 truncate">{app.candidateRole}</div>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  <button onClick={() => handleStatusChange(app.id, 'Interviewing')} className="w-full py-1.5 rounded-md text-[11px] font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Schedule interview</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Col */}
        <div className="bg-gray-50 border border-border rounded-xl p-3.5 min-h-[300px]">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[13px] font-semibold text-gray-700">Interviewing</div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{groupedApps['Interviewing']?.length || 0}</span>
          </div>
          
          <div className="space-y-2.5">
            {groupedApps['Interviewing']?.map(app => (
              <div key={app.id} className="bg-white border border-border rounded-lg p-3.5 hover:shadow-sm transition-shadow">
                <div className="flex gap-2.5 items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-${getColor(app.id)}-100 text-${getColor(app.id)}-700`}>{getInitials(app.candidateName)}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{app.candidateName}</div>
                    <div className="text-[11px] text-gray-500 truncate">{app.candidateRole}</div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-100 rounded-md p-2 text-[11px] color-amber-700 mb-2 mt-2">
                  <strong className="text-amber-800">📅 Pending invite...</strong>
                </div>

                <div className="flex gap-1 mt-2">
                  <button onClick={() => handleStatusChange(app.id, 'Offer sent')} className="flex-1 py-1 rounded-md text-[11px] font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Extend offer</button>
                  <button onClick={() => handleStatusChange(app.id, 'Rejected')} className="flex-1 py-1 rounded-md text-[11px] font-semibold border border-coral-100 bg-white text-coral-700 hover:bg-coral-50 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Col */}
        <div className="bg-gray-50 border border-border rounded-xl p-3.5 min-h-[300px]">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[13px] font-semibold text-gray-700">Decision</div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">{groupedApps['Decisions']?.length || 0}</span>
          </div>
          
          <div className="space-y-2.5">
            {groupedApps['Decisions']?.map(app => (
              <div key={app.id} className="bg-white border border-border rounded-lg p-3.5 hover:shadow-sm transition-shadow">
                <div className="flex gap-2.5 items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-${getColor(app.id)}-100 text-${getColor(app.id)}-700`}>{getInitials(app.candidateName)}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{app.candidateName}</div>
                    <div className="text-[11px] text-gray-500 truncate">{app.candidateRole}</div>
                  </div>
                </div>
                
                {app.status === 'Offer sent' ? (
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 bg-teal-50 text-teal-700">✓ Offer extended</span>
                ) : (
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 bg-coral-50 text-coral-700">✕ Rejected</span>
                )}
                
                {app.status !== 'Rejected' && (
                  <div className="text-[11px] text-gray-500 italic pt-1.5 border-t border-dashed border-border mt-2">
                    Awaiting candidate response.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mt-5 flex items-center justify-center gap-2.5 text-center">
        <span className="text-sm">ℹ️</span>
        <span className="text-[13px] text-blue-700">All status changes reflect live on the candidate's <strong>My Applications</strong> dashboard.</span>
      </div>

    </div>
  )
}
