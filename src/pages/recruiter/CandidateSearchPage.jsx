import React, { useState } from 'react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { useAppContext } from '../../context/AppContext'

// Custom Modal Component for Candidate Profile
function CandidateProfileModal({ isOpen, onClose, candidate, onInvite, isInvited }) {
  if (!isOpen || !candidate) return null

  // Helper colors
  const colorOptions = ['teal', 'blue', 'amber', 'pink', 'coral', 'purple']
  const color = colorOptions[candidate.id % colorOptions.length]
  const initials = candidate.name.split(' ').map(n => n[0]).join('')
  const salary = `₹${Math.floor(Math.random() * 15 + 10)} LPA`
  const notice = '30 days'

  return (
    <div 
      className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-[18px] p-8 max-w-[580px] w-full max-h-[80vh] overflow-y-auto shadow-xl">
        
        <div className="flex justify-between items-start mb-5">
          <div className="flex gap-3.5 items-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 bg-${color}-50 text-${color}-700`}>
              {initials}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{candidate.name}</div>
              <div className="text-[13px] text-gray-500">{candidate.profession} · {candidate.location}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-700 p-1">&times;</button>
        </div>

        <div className="mb-[18px]">
          <div className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-border">Work experience</div>
          <div className="text-[14px] font-semibold mb-0.5">{candidate.profession}</div>
          <div className="text-[13px] text-gray-500 mb-3">Apollo Hospitals · Jun 2021 – Present · Full-time</div>
          <div className="text-[13px] text-gray-700 leading-[1.6]">Managing patient care, supervising junior staff, handling specialized cases and consultations.</div>
        </div>

        <div className="mb-[18px]">
          <div className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-border">Education</div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Degree</span><span className="font-medium text-gray-900">Highest Degree</span></div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Institution</span><span className="font-medium text-gray-900">Medical University</span></div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Specialisation</span><span className="font-medium text-gray-900">{candidate.profession}</span></div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Year</span><span className="font-medium text-gray-900">2019</span></div>
        </div>

        <div className="mb-[18px]">
          <div className="text-sm font-semibold text-gray-900 mb-2 pb-1.5 border-b border-border">Salary & preferences</div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Expected salary</span><span className="font-medium text-gray-900">{salary}</span></div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Notice period</span><span className="font-medium text-gray-900">{notice}</span></div>
          <div className="flex justify-between py-1 text-[13px]"><span className="text-gray-500">Open to relocation</span><span className="font-medium text-gray-900">Yes</span></div>
        </div>

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
  const { candidates } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [invitedIds, setInvitedIds] = useState(new Set())
  const [filters, setFilters] = useState({
    profession: [],
    location: []
  })

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
    const searchMatch = !searchTerm ||
      cand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cand.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const profMatch = filters.profession.length === 0 || filters.profession.some(prof => 
      cand.profession.toLowerCase().includes(prof.toLowerCase())
    )

    const locMatch = filters.location.length === 0 || filters.location.some(loc => 
      cand.location.toLowerCase().includes(loc.toLowerCase())
    )
    
    return searchMatch && profMatch && locMatch
  })

  const handleInvite = (id) => {
    setInvitedIds(prev => new Set(prev).add(id))
    setSelectedCandidate(null)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] min-h-[calc(100vh-64px)] font-sans bg-page-bg">
      
      {/* SIDEBAR FILTERS */}
      <aside className="hidden md:block bg-white border-r border-border p-5 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
        <div className="mb-5">
          <input 
            type="text" 
            placeholder="Search by name, profession..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-[13px] bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-200"
          />
        </div>

        {/* Profession Filter */}
        <div className="mb-[22px]">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-gray-500 mb-2.5">Profession</div>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.profession.includes('doctor') || filters.profession.includes('surgeon') || filters.profession.includes('cardiologist') || filters.profession.includes('pediatrician')} onChange={() => { toggleArrayFilter('profession', 'doctor'); toggleArrayFilter('profession', 'surgeon'); toggleArrayFilter('profession', 'cardiologist'); toggleArrayFilter('profession', 'pediatrician'); }} className="w-[15px] h-[15px] accent-blue-600" /> Doctor / Surgeon
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.profession.includes('nurse')} onChange={() => toggleArrayFilter('profession', 'nurse')} className="w-[15px] h-[15px] accent-blue-600" /> Nurse
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.profession.includes('pharmacist')} onChange={() => toggleArrayFilter('profession', 'pharmacist')} className="w-[15px] h-[15px] accent-blue-600" /> Pharmacist
          </label>
        </div>

        {/* Location Filter */}
        <div className="mb-[22px]">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-gray-500 mb-2.5">Location</div>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('mumbai')} onChange={() => toggleArrayFilter('location', 'mumbai')} className="w-[15px] h-[15px] accent-blue-600" /> Mumbai
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('delhi')} onChange={() => toggleArrayFilter('location', 'delhi')} className="w-[15px] h-[15px] accent-blue-600" /> Delhi NCR
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('bangalore')} onChange={() => toggleArrayFilter('location', 'bangalore')} className="w-[15px] h-[15px] accent-blue-600" /> Bangalore
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('hyderabad')} onChange={() => toggleArrayFilter('location', 'hyderabad')} className="w-[15px] h-[15px] accent-blue-600" /> Hyderabad
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('chennai')} onChange={() => toggleArrayFilter('location', 'chennai')} className="w-[15px] h-[15px] accent-blue-600" /> Chennai
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('pune')} onChange={() => toggleArrayFilter('location', 'pune')} className="w-[15px] h-[15px] accent-blue-600" /> Pune
          </label>
        </div>

        {/* Salary Range */}
        <div className="mb-[22px]">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-gray-500 mb-2.5">Expected Salary (₹ LPA)</div>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" defaultValue="8" className="w-full px-2.5 py-1.5 border border-border rounded-md text-xs" />
            <span className="text-xs text-gray-400">to</span>
            <input type="number" placeholder="Max" defaultValue="25" className="w-full px-2.5 py-1.5 border border-border rounded-md text-xs" />
          </div>
        </div>
      </aside>

      {/* CANDIDATE LISTINGS */}
      <main className="p-5 md:py-7 md:px-8">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-normal text-gray-900">Search candidates</h2>
            <div className="text-[13px] text-gray-500 mt-1">Showing {filteredCandidates.length} professional matching your criteria</div>
          </div>
          <select className="px-3 py-2 border border-border rounded-lg text-[13px] bg-white text-gray-700 outline-none w-full sm:w-auto">
            <option>Best match</option>
            <option>Experience: High to low</option>
          </select>
        </div>

        <div className="space-y-[14px]">
          {filteredCandidates.length === 0 ? (
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
                      <div className="text-sm text-gray-500 mb-2 truncate">{cand.profession} · {cand.location}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-gray-50 rounded-lg p-2.5 mb-3">
                    <div><div className="text-[10px] uppercase tracking-[0.05em] text-gray-400 mb-0.5">Experience</div><div className="text-[13px] font-semibold text-gray-900">{cand.experience}</div></div>
                    <div><div className="text-[10px] uppercase tracking-[0.05em] text-gray-400 mb-0.5">Location</div><div className="text-[13px] font-semibold text-gray-900">{cand.location}</div></div>
                    <div><div className="text-[10px] uppercase tracking-[0.05em] text-gray-400 mb-0.5">Match Score</div><div className="text-[13px] font-semibold text-green-600">{cand.match}</div></div>
                  </div>
                  
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
