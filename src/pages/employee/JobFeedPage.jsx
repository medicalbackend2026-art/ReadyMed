import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { useAppContext } from '../../context/AppContext'

export function JobFeedPage() {
  const { jobs } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    profession: [],
    location: [],
    experience: ''
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

  // Filter functionality
  const filteredJobs = jobs.filter(job => {
    // Keyword match
    const searchMatch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.specialisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.hospital.toLowerCase().includes(searchTerm.toLowerCase())

    // Profession match
    const profMatch = filters.profession.length === 0 || filters.profession.some(prof => 
      job.title.toLowerCase().includes(prof.toLowerCase()) || 
      job.specialisation.toLowerCase().includes(prof.toLowerCase()) ||
      job.description.toLowerCase().includes(prof.toLowerCase())
    )

    // Location match
    const locMatch = filters.location.length === 0 || filters.location.some(loc => 
      job.location.toLowerCase().includes(loc.toLowerCase())
    )

    return searchMatch && profMatch && locMatch
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
      <aside className="hidden md:block bg-white border-r border-border p-6 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
        <div className="mb-5">
          <input 
            type="text" 
            placeholder="Search by keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-[13px] bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-200"
          />
        </div>

        <div className="mb-[22px]">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2.5">Profession</div>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.profession.includes('doctor') || filters.profession.includes('surgeon') || filters.profession.includes('cardiologist') || filters.profession.includes('pediatrician')} onChange={() => { toggleArrayFilter('profession', 'doctor'); toggleArrayFilter('profession', 'surgeon'); toggleArrayFilter('profession', 'cardiologist'); toggleArrayFilter('profession', 'pediatrician'); }} className="w-[15px] h-[15px] accent-teal-600" /> Doctor / Surgeon
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.profession.includes('nurse')} onChange={() => toggleArrayFilter('profession', 'nurse')} className="w-[15px] h-[15px] accent-teal-600" /> Nurse
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.profession.includes('pharmacist')} onChange={() => toggleArrayFilter('profession', 'pharmacist')} className="w-[15px] h-[15px] accent-teal-600" /> Pharmacist
          </label>
        </div>

        <div className="mb-[22px]">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2.5">Location</div>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('mumbai')} onChange={() => toggleArrayFilter('location', 'mumbai')} className="w-[15px] h-[15px] accent-teal-600" /> Mumbai
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('delhi')} onChange={() => toggleArrayFilter('location', 'delhi')} className="w-[15px] h-[15px] accent-teal-600" /> Delhi NCR
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('bangalore')} onChange={() => toggleArrayFilter('location', 'bangalore')} className="w-[15px] h-[15px] accent-teal-600" /> Bangalore
          </label>
          <label className="flex items-center gap-2 py-1 text-[13px] text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.location.includes('hyderabad')} onChange={() => toggleArrayFilter('location', 'hyderabad')} className="w-[15px] h-[15px] accent-teal-600" /> Hyderabad
          </label>
        </div>
      </aside>

      {/* JOB LISTINGS */}
      <main className="p-5 md:py-7 md:px-8">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-serif text-2xl font-normal text-gray-900">Matched jobs for you</h2>
            <div className="text-[13px] text-gray-500 mt-1">Showing {filteredJobs.length} results based on your criteria</div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 ml-4">
            <select className="px-3.5 py-1.5 border border-border rounded-lg text-[13px] bg-white text-gray-700 outline-none">
              <option>Most relevant</option>
              <option>Newest first</option>
              <option>Salary: High to low</option>
            </select>
          </div>
        </div>

        <div className="space-y-3.5">
          {filteredJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white border border-border rounded-xl">
              No jobs found matching your criteria. Try adjusting your search.
            </div>
          ) : filteredJobs.map((job) => {
            const logo = getLogoStyle(job.hospital)
            const matchScore = Math.floor(Math.random() * (98 - 70) + 70) // Mock random match score between 70-98

            return (
              <div key={job.id} className="bg-white border border-border rounded-xl p-5 transition-all hover:border-teal-200 hover:shadow-md hover:-translate-y-px flex gap-4 relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 bg-${logo.color}-50 text-${logo.color}-700`}>
                  {logo.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate pr-4">
                      <Link to={`/jobs/${job.id}`} className="hover:text-teal-600">{job.title}</Link>
                    </h3>
                    <button 
                      className={`text-lg transition-colors p-1 text-gray-200 hover:text-amber-200 mt-[-4px]`}
                      onClick={toggleSaved}
                    >
                      ☆
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
                      <Button to={`/jobs/${job.id}`} variant="primary" size="sm">Apply &rarr;</Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
