import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { useAppContext } from '../../context/AppContext'

export function JobFeedPage() {
  const navigate = useNavigate()
  const { browseJobs: jobs, toggleSaveJob, isJobSaved } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    profession: [],
    location: [],
    jobType: [],
    experience: [],
    salary: '',
    posted: '',
  })
  const [openSections, setOpenSections] = useState({ profession: false, location: false, jobType: false, experience: false })
  const [sortBy, setSortBy] = useState('relevant')

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleArrayFilter = (field, value) => {
    setFilters(prev => {
      const current = prev[field]
      return { ...prev, [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] }
    })
  }

  const clearAll = () => setFilters({ profession: [], location: [], jobType: [], experience: [], salary: '', posted: '' })

  const activeFilterCount = filters.profession.length + filters.location.length + filters.jobType.length + filters.experience.length + (filters.salary ? 1 : 0) + (filters.posted ? 1 : 0)

  // Filter functionality
  const filteredJobs = jobs.filter(job => {
    const searchMatch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (job.specialisation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.hospital.toLowerCase().includes(searchTerm.toLowerCase())

    const profMatch = filters.profession.length === 0 || filters.profession.some(prof => 
      job.title.toLowerCase().includes(prof.toLowerCase()) || 
      (job.specialisation || '').toLowerCase().includes(prof.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(prof.toLowerCase())
    )

    const locMatch = filters.location.length === 0 || filters.location.some(loc => 
      (job.location || '').toLowerCase().includes(loc.toLowerCase())
    )

    const typeMatch = filters.jobType.length === 0 || filters.jobType.some(t =>
      (job.type || '').toLowerCase().includes(t.toLowerCase())
    )

    const expMatch = filters.experience.length === 0 || filters.experience.some(e => {
      const exp = parseInt(job.experience) || 0
      if (e === '0-2') return exp <= 2
      if (e === '3-5') return exp >= 3 && exp <= 5
      if (e === '6-10') return exp >= 6 && exp <= 10
      if (e === '10+') return exp > 10
      return true
    })

    return searchMatch && profMatch && locMatch && typeMatch && expMatch
  })

  // Sort
  const userProfile = (() => { try { return JSON.parse(localStorage.getItem('rm_user_profile') || '{}') } catch { return {} } })()
  const userProfession = (userProfile.profession || userProfile.specialization || '').toLowerCase()

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return db2 - da
    }
    if (sortBy === 'salary') {
      const sa = Number(a.salaryMax) || Number(a.salaryMin) || 0
      const sb = Number(b.salaryMax) || Number(b.salaryMin) || 0
      return sb - sa
    }
    // Most relevant: score by profession/title match with user's profile
    if (sortBy === 'relevant' && userProfession) {
      const score = (job) => {
        const haystack = `${job.title} ${job.profession} ${job.specialisation} ${job.description}`.toLowerCase()
        return userProfession.split(' ').filter(w => w.length > 2 && haystack.includes(w)).length
      }
      return score(b) - score(a)
    }
    return 0
  })

  const toggleSaved = (e) => {
    e.preventDefault()
    e.target.classList.toggle('text-amber-400')
    e.target.classList.toggle('text-gray-200')
  }

  // Helper to generate a dummy initials logo with colors based on hospital name length
  const getLogoStyle = (hospitalName) => {
    const initials = hospitalName.substring(0, 2).toUpperCase()
    const colorOptions = ['teal', 'blue', 'amber', 'pink', 'coral', 'purple']
    const color = colorOptions[hospitalName.length % colorOptions.length]
    return { initials, color }
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
              placeholder="Search jobs, hospitals..." 
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
              items: [
                { label: 'Doctor / Surgeon', value: 'doctor' },
                { label: 'Nurse', value: 'nurse' },
                { label: 'Pharmacist', value: 'pharmacist' },
                { label: 'Dentist', value: 'dentist' },
                { label: 'Physiotherapist', value: 'physiotherapist' },
                { label: 'Radiologist', value: 'radiologist' },
                { label: 'Lab Technician', value: 'lab' },
                { label: 'Admin / Management', value: 'admin' },
              ]
            },
            {
              key: 'location', label: 'Location',
              items: [
                { label: 'Mumbai', value: 'mumbai' },
                { label: 'Delhi NCR', value: 'delhi' },
                { label: 'Bangalore', value: 'bangalore' },
                { label: 'Hyderabad', value: 'hyderabad' },
                { label: 'Chennai', value: 'chennai' },
                { label: 'Pune', value: 'pune' },
                { label: 'Kolkata', value: 'kolkata' },
                { label: 'Ahmedabad', value: 'ahmedabad' },
              ]
            },
            {
              key: 'jobType', label: 'Job Type',
              items: [
                { label: 'Full-time', value: 'full-time' },
                { label: 'Part-time', value: 'part-time' },
                { label: 'Contract', value: 'contract' },
                { label: 'Consulting', value: 'consulting' },
                { label: 'Locum / Temporary', value: 'locum' },
              ]
            },
            {
              key: 'experience', label: 'Experience',
              items: [
                { label: '0–2 yrs (Fresher)', value: '0-2' },
                { label: '3–5 years', value: '3-5' },
                { label: '6–10 years', value: '6-10' },
                { label: '10+ years (Senior)', value: '10+' },
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

      {/* JOB LISTINGS */}
      <main className="p-5 md:py-7 md:px-8">
        
        <button 
          onClick={() => navigate('/services')}
          className="mb-6 inline-flex items-center gap-2 px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium text-sm"
        >
          ← Back to Services
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-serif text-2xl font-normal text-gray-900">Matched jobs for you</h2>
            <div className="text-[13px] text-gray-500 mt-1">Showing {sortedJobs.length} results based on your criteria</div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 ml-4">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3.5 py-1.5 border border-border rounded-lg text-[13px] bg-white text-gray-700 outline-none cursor-pointer">
              <option value="relevant">Most relevant</option>
              <option value="newest">Newest first</option>
              <option value="salary">Salary: High to low</option>
            </select>
          </div>
        </div>

        <div className="space-y-3.5">
          {sortedJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white border border-border rounded-xl">
              No jobs found matching your criteria. Try adjusting your search.
            </div>
          ) : sortedJobs.map((job) => {
            const logo = getLogoStyle(job.hospital)
            const matchScore = Math.floor(Math.random() * (98 - 70) + 70) // Mock random match score between 70-98

            return (
              <Link key={job.id} to={`/jobs/${job.id}`} className="block bg-white border border-border rounded-xl p-5 transition-all hover:border-teal-200 hover:shadow-md hover:-translate-y-px flex gap-4 relative cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 bg-${logo.color}-50 text-${logo.color}-700`}>
                  {logo.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate pr-4 hover:text-teal-600">
                      {job.title}
                    </h3>
                    <button 
                      className={`text-lg transition-colors p-1 mt-[-4px] ${isJobSaved(job.id) ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
                      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleSaveJob(job) }}
                    >
                      {isJobSaved(job.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mb-2.5 truncate">{job.hospital} · {job.location}</div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="teal">{job.salary}</Badge>
                    <Badge variant="outline">{job.type}</Badge>
                    <Badge variant="pink">{job.specialisation}</Badge>
                    {job.tags && job.tags.map(tag => (
                      <Badge key={tag} variant="amber">{tag}</Badge>
                    ))}
                  </div>
                  
                  <div className="text-[13px] text-gray-500 leading-[1.6] mb-3 line-clamp-2">
                    {job.description}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-xs text-gray-400">{job.posted} · {Math.floor(Math.random() * 30 + 1)} applicants</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {matchScore}% match
                      </span>
                      <Button to={`/jobs/${job.id}`} variant="primary" size="sm" onClick={e => e.stopPropagation()}>Apply &rarr;</Button>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
