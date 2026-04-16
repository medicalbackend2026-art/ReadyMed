import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { FormInput, FormSelect } from '../../components/FormElements'
import { useAppContext } from '../../context/AppContext'
import { getCompanyProfile } from '../../hooks/useUserProfile'
import { auth } from '../../firebase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function StepCard({ id, num, title, desc, children }) {
  return (
    <div id={id} className="bg-white border border-border rounded-2xl p-7 mb-5">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 bg-blue-50 text-blue-700">
          {num}
        </div>
        <div>
          <div className="text-[17px] font-semibold">{title}</div>
          <div className="text-[13px] text-gray-500 mt-0.5">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

export function PostJobPage() {
  const navigate = useNavigate()
  const locationRouter = useLocation()
  const isLocumMode = locationRouter.pathname.startsWith('/recruiter/locum')
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { addJob, jobs, removeJob } = useAppContext()
  const company = getCompanyProfile() || {}

  const editJob = editId ? jobs.find(j => j.id === editId || j.id === Number(editId)) : null

  const [title, setTitle] = useState(editJob?.title || '')
  const [profession, setProfession] = useState(editJob?.profession || 'Doctor')
  const [department, setDepartment] = useState(editJob?.department || '')
  const [employmentType, setEmploymentType] = useState(isLocumMode ? 'Locum' : (editJob?.type || 'Full-time'))
  const [openings, setOpenings] = useState(editJob?.openings || '1')
  const [location, setLocation] = useState(editJob?.location || company.city || '')
  const [experience, setExperience] = useState(editJob?.experience || '')
  const [qualification, setQualification] = useState(editJob?.qualification || '')
  const [certs, setCerts] = useState(editJob?.certs || '')
  const [skills, setSkills] = useState(editJob?.skills || [])
  const [salaryMin, setSalaryMin] = useState(editJob?.salaryMin || '')
  const [salaryMax, setSalaryMax] = useState(editJob?.salaryMax || '')
  const [notice, setNotice] = useState(editJob?.notice || '30')
  const [description, setDescription] = useState(editJob?.description || '')
  const [benefits, setBenefits] = useState(editJob?.benefits || '')
  const [deadline, setDeadline] = useState(editJob?.deadline || '')

  const [locumHoursPerDay, setLocumHoursPerDay] = useState(editJob?.locumHoursPerDay || editJob?.locumHoursPerWeek || '')
  const [locumShiftStart, setLocumShiftStart] = useState(editJob?.locumShiftStart || '')
  const [locumShiftEnd, setLocumShiftEnd] = useState(editJob?.locumShiftEnd || '')
  const [locumDaysOfWeek, setLocumDaysOfWeek] = useState(Array.isArray(editJob?.locumDaysOfWeek) ? editJob.locumDaysOfWeek : [])

  const availableSkills = [
    'Internal Medicine', 'ICU / Critical Care', 'Emergency Medicine',
    'Cardiology', 'Nephrology', 'General Medicine',
    'Infectious Disease', 'Rheumatology'
  ]

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  const toggleLocumDay = (day) => {
    setLocumDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!isLocumMode) return
    if (profession !== 'Doctor' && profession !== 'Nurse') setProfession('Doctor')
  }, [isLocumMode, profession])

  const buildJobData = (status = 'active') => {
    const minNum = parseInt(String(salaryMin).replace(/,/g, '')) || 0
    const maxNum = parseInt(String(salaryMax).replace(/,/g, '')) || 0
    const salaryStr = minNum && maxNum
      ? `₹${(minNum / 100000).toFixed(0)}L - ₹${(maxNum / 100000).toFixed(0)}L / year`
      : salaryMin || 'Negotiable'
    return {
      ...(editJob || {}),
      title,
      profession,
      department,
      type: isLocumMode ? 'Locum' : employmentType,
      employmentType: isLocumMode ? 'Locum' : employmentType,
      ...(isLocumMode
        ? {
            locumHoursPerDay: locumHoursPerDay ? Number(locumHoursPerDay) : null,
            locumHoursPerWeek: null,
            locumShiftStart,
            locumShiftEnd,
            locumDaysOfWeek,
          }
        : {}),
      openings: parseInt(openings) || 1,
      location,
      experience,
      qualification,
      certs,
      skills,
      salaryMin: minNum,
      salaryMax: maxNum,
      salary: salaryStr,
      notice,
      description,
      benefits,
      deadline,
      status,
      paused: status === 'draft',
      hospital: company.companyName || 'Your Company',
      specialisation: department,
      requirements: [
        qualification,
        experience ? `Minimum ${experience} years of experience` : '',
        certs,
      ].filter(Boolean),
      createdAt: editJob?.createdAt || new Date().toISOString(),
    }
  }

  const handleSaveDraft = async () => {
    setSaveError('')
    const jobData = buildJobData('draft')
    if (editJob) removeJob(editJob.id)
    addJob(jobData)
    setSavingDraft(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        const url = editJob ? `${API}/api/jobs/${editJob.id}` : `${API}/api/jobs`
        const method = editJob ? 'PUT' : 'POST'
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(jobData),
        })
      }
      navigate(isLocumMode ? '/recruiter/locum/dashboard' : '/recruiter/dashboard')
    } catch {
      setTimeout(() => navigate(isLocumMode ? '/recruiter/locum/dashboard' : '/recruiter/dashboard'), 1500)
    } finally {
      setSavingDraft(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError('')
    const jobData = buildJobData('active')

    // If editing, remove old entry then add updated
    if (editJob) removeJob(editJob.id)
    addJob(jobData)

    // Sync to Firestore via backend
    setSaving(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        const url = editJob ? `${API}/api/jobs/${editJob.id}` : `${API}/api/jobs`
        const method = editJob ? 'PUT' : 'POST'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(jobData),
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed') }
      }
      navigate(isLocumMode ? '/recruiter/locum/dashboard' : '/recruiter/dashboard')
    } catch (err) {
      console.error('Job sync error:', err)
      setSaveError('Job posted locally but could not sync to cloud.')
      setTimeout(() => navigate(isLocumMode ? '/recruiter/locum/dashboard' : '/recruiter/dashboard'), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10 pb-20 font-sans">

      <div className="text-center mb-9">
        <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">
          {editJob ? (isLocumMode ? 'Edit locum post' : 'Edit job post') : (isLocumMode ? 'Post a locum shift' : 'Post a new job')}
        </h1>
        <p className="text-sm text-gray-500">
          {isLocumMode
            ? 'Create a locum requirement (Doctors and Nurses only) with hours and shift timings.'
            : (editJob ? 'Update the details of your job listing.' : 'Create your listing in 3 simple steps. Published jobs are instantly visible to matched candidates.')}
        </p>
        {isLocumMode && (
          <div className="mt-4 flex justify-center">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/recruiter/locum/candidates')}>
              Search locum Doctors / Nurses
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>

        {/* Step 1: Job Basics */}
        <StepCard id="step1" num="1" title="Job basics" desc="Define the position you're hiring for">
          <FormInput label="Job title / designation" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Consultant — Internal Medicine" />

          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormSelect
              label="Profession required"
              value={profession}
              onChange={e => setProfession(e.target.value)}
              options={isLocumMode
                ? [
                    {label:'Doctor',value:'Doctor'},{label:'Nurse',value:'Nurse'},
                  ]
                : [
                    {label:'Doctor',value:'Doctor'},{label:'Nurse',value:'Nurse'},
                    {label:'Pharmacist',value:'Pharmacist'},{label:'Lab Technician',value:'Lab Technician'},
                    {label:'Physiotherapist',value:'Physiotherapist'},{label:'Radiologist',value:'Radiologist'},
                    {label:'Paramedic',value:'Paramedic'},{label:'Hospital Admin',value:'Hospital Admin'}
                  ]
              }
              className="mb-0"
            />
            <FormInput label="Department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Internal Medicine" className="mb-0" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 [&>div]:mb-0">
            {isLocumMode ? (
              <FormInput label="Employment type" value="Locum" disabled />
            ) : (
              <FormSelect
                label="Employment type"
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value)}
                options={[
                  {label:'Full-time',value:'Full-time'},{label:'Part-time',value:'Part-time'},
                  {label:'Contract',value:'Contract'}
                ]}
              />
            )}
            <FormInput label="Number of openings" type="number" value={openings} onChange={e => setOpenings(e.target.value)} min="1" />
            <FormInput label="Job location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Delhi NCR" />
          </div>

          {isLocumMode && (
            <div className="mt-1">
              <div className="grid sm:grid-cols-3 gap-3 [&>div]:mb-0">
                <FormInput
                  label="Hours per day"
                  type="number"
                  min="1"
                  value={locumHoursPerDay}
                  onChange={e => setLocumHoursPerDay(e.target.value)}
                  placeholder="e.g. 8"
                />
                <FormInput
                  label="Shift start time"
                  type="time"
                  value={locumShiftStart}
                  onChange={e => setLocumShiftStart(e.target.value)}
                />
                <FormInput
                  label="Shift end time"
                  type="time"
                  value={locumShiftEnd}
                  onChange={e => setLocumShiftEnd(e.target.value)}
                />
              </div>

              <div className="mb-[18px]">
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Days of week</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleLocumDay(day)}
                      className={`px-3.5 py-1.5 border rounded-full text-[13px] transition-colors ${
                        locumDaysOfWeek.includes(day)
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                          : 'border-border bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </StepCard>

        {/* Step 2: Requirements & Salary */}
        <StepCard id="step2" num="2" title="Requirements & salary" desc="Define what you're looking for in candidates">
          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Minimum years of experience" type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 5" min="0" className="mb-0" />
            <FormInput label="Required qualification" value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. MD / DNB Internal Medicine" className="mb-0" />
          </div>

          <FormInput label="Required certifications" value={certs} onChange={e => setCerts(e.target.value)} placeholder="e.g. NMC Registration, Valid State Medical Council License" />

          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Required skills (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3.5 py-1.5 border rounded-full text-[13px] transition-colors ${
                    skills.includes(skill)
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                      : 'border-border bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Salary range — min (₹/year)" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="e.g. 18,00,000" className="mb-0" />
            <FormInput label="Salary range — max (₹/year)" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="e.g. 24,00,000" className="mb-0" />
          </div>

          <div className="max-w-[250px] mb-0">
            <FormSelect
              label="Acceptable notice period"
              value={notice}
              onChange={e => setNotice(e.target.value)}
              options={[
                {label:'Immediate only',value:'0'},{label:'Up to 15 days',value:'15'},
                {label:'Up to 30 days',value:'30'},{label:'Up to 60 days',value:'60'},
                {label:'Up to 90 days',value:'90'}
              ]}
              className="mb-0"
            />
          </div>
        </StepCard>

        {/* Step 3: Description, Preview & Publish */}
        <StepCard id="step3" num="3" title="Description, preview & publish" desc="Write your job description and publish">
          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Full job description</label>
            <textarea
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-blue-200 focus:ring-3 focus:ring-blue-200/20"
              rows="6"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and what makes this a great opportunity..."
            />
          </div>
          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Benefits offered (optional)</label>
            <textarea
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-blue-200 focus:ring-3 focus:ring-blue-200/20"
              rows="3"
              value={benefits}
              onChange={e => setBenefits(e.target.value)}
              placeholder="e.g. Medical insurance, CME allowance, performance incentives..."
            />
          </div>
          <div className="max-w-[250px] mb-0">
            <FormInput label="Application deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mb-0" />
          </div>
        </StepCard>

        {/* Preview Banner */}
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 rounded-[14px] p-6 text-center mb-5">
          <div className="text-base font-semibold text-blue-700 mb-1">📋 Preview your listing</div>
          <div className="text-[13px] text-gray-500">This is how candidates will see your job post on their feed. Review and publish when ready.</div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-7 gap-4">
          {saveError && <p className="text-sm text-amber-600">{saveError}</p>}
          <Button type="button" variant="ghost" onClick={handleSaveDraft} disabled={savingDraft}>
            {savingDraft ? 'Saving…' : 'Save as draft'}
          </Button>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <Button type="button" variant="ghost" to={isLocumMode ? '/recruiter/locum/dashboard' : '/recruiter/dashboard'} className="flex-1 sm:flex-none">Cancel</Button>
            <Button type="submit" variant="blue" size="lg" className="flex-1 sm:flex-none" disabled={saving}>
              {saving ? (editJob ? 'Saving…' : 'Publishing…') : (editJob ? 'Save changes →' : 'Publish job →')}
            </Button>
          </div>
        </div>

      </form>
    </div>
  )
}