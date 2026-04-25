import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { getAuth } from 'firebase/auth'
import { BackButton } from '../../components/BackButton'

// Custom Modal Component for Candidate Profile
function CandidateProfileModal({ isOpen, onClose, candidate, onInvite, isInvited }) {
  if (!isOpen || !candidate) return null

  const initials = candidate.name.split(' ').map(n => n[0]).join('')

  return (
    <div 
      className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-[18px] p-8 max-w-[580px] w-full max-h-[80vh] overflow-y-auto shadow-xl">
        
        <div className="flex justify-between items-start mb-5">
          <div className="flex gap-3.5 items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 bg-blue-50 text-blue-700">
              {initials}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{candidate.name}</div>
              <div className="text-[13px] text-gray-500">{candidate.profession || '—'}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-700 p-1">&times;</button>
        </div>

        {/* Skills */}
        {candidate.skills?.length > 0 && (
          <div className="mb-[18px]">
            <div className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-border">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {candidate.experiences?.length > 0 && (
          <div className="mb-[18px]">
            <div className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-border">Work experience</div>
            {candidate.experiences.map((exp, i) => (
              <div key={i} className="mb-2">
                <div className="text-[14px] font-semibold">{exp.jobTitle}</div>
                <div className="text-[13px] text-gray-500">{exp.hospital} · {exp.startDate} – {exp.currentJob ? 'Present' : exp.endDate} · {exp.employmentType}</div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {candidate.qualifications?.length > 0 && (
          <div className="mb-[18px]">
            <div className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-border">Education</div>
            {candidate.qualifications.map((q, i) => (
              <div key={i} className="mb-2">
                <div className="text-[13px] font-medium">{q.degree} {q.specialization ? `— ${q.specialization}` : ''}</div>
                <div className="text-[13px] text-gray-500">{q.institution} · {q.yearOfCompletion}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-[18px]">
          <div className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-border">Preferences</div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Current salary</span><span className="font-medium text-gray-900">{candidate.currentSalary || '—'}</span></div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Expected salary</span><span className="font-medium text-gray-900">{candidate.expectedSalary || '—'}</span></div>
          {candidate.noticePeriod && <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Notice period</span><span className="font-medium text-gray-900">{candidate.noticePeriod}</span></div>}
          {candidate.preferredJobType && <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Job type</span><span className="font-medium text-gray-900">{candidate.preferredJobType}</span></div>}
          {candidate.openToRelocation && <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Open to relocation</span><span className="font-medium text-gray-900">{candidate.openToRelocation}</span></div>}
        </div>

        {candidate.resumeUrl && (
          <div className="mb-4">
            <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline">📄 View Resume ↗</a>
          </div>
        )}

        <div className="bg-gray-50 border border-border rounded-lg px-3.5 py-2.5 text-xs text-gray-500 flex items-center gap-2 mb-4">
          <span className="text-sm">🔒</span> Phone and email are hidden until the candidate applies or accepts your invite.
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-700 mb-2.5">Interested in this candidate? Send an invite — they'll be notified and can choose to share their contact details.</p>
          <Button variant="blue" size="sm" onClick={() => onInvite(candidate.id)} disabled={isInvited}>
            {isInvited ? '✓ Invited' : 'Send invite to apply'}
          </Button>
        </div>

      </div>
    </div>
  )
}

export function CandidateSearchPage() {
  const navigate = useNavigate()
  const locationRouter = useLocation()
  const isLocumMode = locationRouter.pathname.startsWith('/recruiter/locum')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [invitedIds, setInvitedIds] = useState(new Set())
  const [filters, setFilters] = useState({
    profession: [],
    jobType: [],
    noticePeriod: [],
  })
  const [openSections, setOpenSections] = useState({ profession: false, jobType: false, noticePeriod: false })

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const clearAll = () => setFilters({ profession: [], jobType: [], noticePeriod: [] })
  const activeFilterCount = filters.profession.length + filters.jobType.length + filters.noticePeriod.length

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const auth = getAuth()
        const token = await auth.currentUser?.getIdToken()
        if (!token) {
          setLoading(false)
          return
        }
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const url = `${baseUrl}/api/users${isLocumMode ? '?locumOnly=true' : ''}`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          console.error('Backend error:', res.status, await res.text())
          setLoading(false)
          return
        }
        const data = await res.json()
        setCandidates((data.users || []).map((u, i) => ({ ...u, id: i })))
      } catch (err) {
        console.error('Failed to fetch candidates:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [isLocumMode])

  const toggleArrayFilter = (field, value) => {
    setFilters(prev => {
      const current = prev[field]
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const filteredCandidates = candidates.filter(cand => {
    if (isLocumMode) {
      if (!cand.locumEligible) return false
      const p = String(cand.profession || '').toLowerCase()
      const allowed = p.includes('doctor') || p.includes('nurse')
      if (!allowed) return false
    }

    const searchMatch = !searchTerm ||
      cand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (cand.profession || '').toLowerCase().includes(searchTerm.toLowerCase())

    const profMatch = filters.profession.length === 0 || filters.profession.some(prof => 
      (cand.profession || '').toLowerCase().includes(prof.toLowerCase())
    )

    const jobTypeMatch = filters.jobType.length === 0 || filters.jobType.some(jt =>
      (cand.preferredJobType || '').toLowerCase().includes(jt.toLowerCase())
    )

    const noticeMatch = filters.noticePeriod.length === 0 || filters.noticePeriod.some(np =>
      (cand.noticePeriod || '').toLowerCase().includes(np.toLowerCase())
    )

    return searchMatch && profMatch && jobTypeMatch && noticeMatch
  })

  const handleInvite = (id) => {
    setInvitedIds(prev => new Set(prev).add(id))
    setSelectedCandidate(null)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] min-h-[calc(100vh-64px)] font-sans">
      
      {/* SIDEBAR FILTERS */}
      <aside className="hidden md:block bg-white border-r border-border sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
        {/* Search */}
        <div className="px-4 pt-5 pb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search candidates, profession..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-50 transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFilterCount > 0 && (
          <div className="mx-4 mb-3 px-3 py-2 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between">
            <span className="text-[12px] text-teal-700 font-medium">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            <button onClick={clearAll} className="text-[11px] text-teal-600 hover:text-red-500 font-semibold transition-colors">Clear all ×</button>
          </div>
        )}

        {/* Collapsible Filter Sections */}
        <div className="px-2 pb-6">
          {[
            {
              key: 'profession', label: 'Profession',
              items: isLocumMode
                ? [
                    { label: 'Doctor / Surgeon', value: 'doctor' },
                    { label: 'Nurse', value: 'nurse' },
                  ]
                : [
                    { label: 'Doctor / Surgeon', value: 'doctor' },
                    { label: 'Nurse', value: 'nurse' },
                    { label: 'Pharmacist', value: 'pharmacist' },
                    { label: 'Lab Technician', value: 'lab' },
                    { label: 'Physiotherapist', value: 'physio' },
                    { label: 'Radiologist', value: 'radiolog' },
                    { label: 'Paramedic', value: 'paramedic' },
                    { label: 'Hospital Admin', value: 'admin' },
                  ]
            },
            {
              key: 'jobType', label: 'Job Type',
              items: [
                { label: 'Full-time', value: 'full-time' },
                { label: 'Part-time', value: 'part-time' },
                { label: 'Contract', value: 'contract' },
                { label: 'Locum / Temporary', value: 'locum' },
                { label: 'Remote', value: 'remote' },
              ]
            },
            {
              key: 'noticePeriod', label: 'Notice Period',
              items: [
                { label: 'Immediate joiner', value: 'immediate' },
                { label: '15 days', value: '15 days' },
                { label: '30 days', value: '30 days' },
                { label: '60 days', value: '60 days' },
                { label: '90 days', value: '90 days' },
              ]
            },
          ].map(section => (
            <div key={section.key} className="mb-1">
              <button
                onClick={() => toggleSection(section.key)}
                className={`w-full px-3 py-2.5 flex items-center justify-between text-left rounded-xl transition-colors ${openSections[section.key] ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-semibold ${openSections[section.key] ? 'text-teal-700' : 'text-gray-700'}`}>
                    {section.label}
                  </span>
                  {filters[section.key]?.length > 0 && (
                    <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{filters[section.key].length}</span>
                  )}
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${openSections[section.key] ? 'rotate-180 text-teal-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSections[section.key] && (
                <div className="px-3 pt-1 pb-2 space-y-0.5">
                  {section.items.map(item => {
                    const checked = filters[section.key].includes(item.value)
                    return (
                      <div
                        key={item.value}
                        onClick={() => toggleArrayFilter(section.key, item.value)}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors select-none ${checked ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        <div className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        {item.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* CANDIDATE LISTINGS */}
      <main className="p-5 md:py-7 md:px-8">
        
        <BackButton
          onClick={() => navigate(isLocumMode ? '/recruiter/locum/post' : '/recruiter/services')}
          label={`Back to ${isLocumMode ? 'Locum posting' : 'Services'}`}
          className="mb-6"
        />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-normal text-gray-900">{isLocumMode ? 'Locum candidates' : 'Search candidates'}</h2>
            <div className="text-[13px] text-gray-500 mt-1">Showing {filteredCandidates.length} professional matching your criteria</div>
          </div>
        </div>

        <div className="space-y-[14px]">
          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white border border-border rounded-[14px]">
              Loading candidates...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white border border-border rounded-[14px]">
              No candidates found matching your criteria.
            </div>
          ) : filteredCandidates.map((cand) => {
            const isInvited = invitedIds.has(cand.id);
            const colorOptions = ['teal', 'blue', 'amber', 'pink', 'coral', 'purple'];
            const color = colorOptions[cand.id % colorOptions.length];
            const initials = cand.name.split(' ').map(n => n[0]).join('');
            
            return (
              <div key={cand.id} className="bg-white border border-border rounded-[14px] p-5 transition-all hover:border-blue-200 hover:shadow-md hover:-translate-y-[1px] flex gap-4 items-start">
                
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[19px] font-bold shrink-0 bg-${color}-50 text-${color}-700`}>
                  {initials}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="text-base font-semibold text-gray-900 truncate">{cand.name}</div>
                      <div className="text-sm text-gray-500 mb-2 truncate">{cand.profession || '—'}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 rounded-lg p-2.5 mb-3">
                    <div><div className="text-[10px] uppercase tracking-[0.05em] text-gray-400 mb-0.5">Experience</div><div className="text-[13px] font-semibold text-gray-900">{cand.experience || '—'}</div></div>
                    <div><div className="text-[10px] uppercase tracking-[0.05em] text-gray-400 mb-0.5">Current Salary</div><div className="text-[13px] font-semibold text-gray-900">{cand.currentSalary || '—'}</div></div>
                    <div><div className="text-[10px] uppercase tracking-[0.05em] text-gray-400 mb-0.5">Expected Salary</div><div className="text-[13px] font-semibold text-gray-900">{cand.expectedSalary || '—'}</div></div>
                    <div><div className="text-[10px] uppercase tracking-[0.05em] text-gray-400 mb-0.5">Notice Period</div><div className="text-[13px] font-semibold text-gray-900">{cand.noticePeriod || '—'}</div></div>
                  </div>
                  {cand.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {cand.skills.slice(0,5).map((s,i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-medium">{s}</span>
                      ))}
                      {cand.skills.length > 5 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px]">+{cand.skills.length - 5} more</span>}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <span className="text-xs text-gray-400 italic shrink-0">📱 Contact details hidden until invite accepted</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(cand)}>View profile</Button>
                      <Button 
                        variant="blue" size="sm" 
                        onClick={() => handleInvite(cand.id)}
                        disabled={isInvited}
                      >
                        {isInvited ? '✓ Invited' : 'Invite to apply'}
                      </Button>
                    </div>
                  </div>
                </div>
                
              </div>
            )
          })}
        </div>

      </main>

      <CandidateProfileModal 
        isOpen={!!selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
        candidate={selectedCandidate}
        onInvite={handleInvite}
        isInvited={selectedCandidate ? invitedIds.has(selectedCandidate.id) : false}
      />

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-700 text-white px-6 py-3.5 rounded-xl text-sm font-medium shadow-lg z-[600]">
          ✓ Invite sent! The candidate will be notified on their dashboard.
        </div>
      )}

    </div>
  )
}
