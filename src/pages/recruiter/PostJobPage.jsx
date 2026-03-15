import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { FormInput, FormSelect } from '../../components/FormElements'
import { useAppContext } from '../../context/AppContext'
import { getCompanyProfile } from '../../hooks/useUserProfile'

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
  const { addJob } = useAppContext()
  const company = getCompanyProfile() || {}

  const [title, setTitle] = useState('')
  const [profession, setProfession] = useState('Doctor')
  const [department, setDepartment] = useState('')
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [openings, setOpenings] = useState('1')
  const [location, setLocation] = useState(company.city || '')
  const [experience, setExperience] = useState('')
  const [qualification, setQualification] = useState('')
  const [certs, setCerts] = useState('')
  const [skills, setSkills] = useState([])
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [notice, setNotice] = useState('30')
  const [description, setDescription] = useState('')
  const [benefits, setBenefits] = useState('')
  const [deadline, setDeadline] = useState('')

  const availableSkills = [
    'Internal Medicine', 'ICU / Critical Care', 'Emergency Medicine',
    'Cardiology', 'Nephrology', 'General Medicine',
    'Infectious Disease', 'Rheumatology'
  ]

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const minNum = parseInt(salaryMin.replace(/,/g, '')) || 0
    const maxNum = parseInt(salaryMax.replace(/,/g, '')) || 0
    const salaryStr = minNum && maxNum
      ? `₹${(minNum / 100000).toFixed(0)}L - ₹${(maxNum / 100000).toFixed(0)}L / year`
      : salaryMin || 'Negotiable'

    addJob({
      title,
      hospital: company.companyName || 'Your Company',
      location,
      type: employmentType,
      salary: salaryStr,
      specialisation: department,
      description,
      requirements: [
        qualification,
        experience ? `Minimum ${experience} years of experience` : '',
        certs,
      ].filter(Boolean),
    })
    navigate('/recruiter/dashboard')
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10 pb-20 font-sans">

      <div className="text-center mb-9">
        <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Post a new job</h1>
        <p className="text-sm text-gray-500">Create your listing in 3 simple steps. Published jobs are instantly visible to matched candidates.</p>
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
              options={[
                {label:'Doctor',value:'Doctor'},{label:'Nurse',value:'Nurse'},
                {label:'Pharmacist',value:'Pharmacist'},{label:'Lab Technician',value:'Lab Technician'},
                {label:'Physiotherapist',value:'Physiotherapist'},{label:'Radiologist',value:'Radiologist'},
                {label:'Paramedic',value:'Paramedic'},{label:'Hospital Admin',value:'Hospital Admin'}
              ]}
              className="mb-0"
            />
            <FormInput label="Department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Internal Medicine" className="mb-0" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 [&>div]:mb-0">
            <FormSelect
              label="Employment type"
              value={employmentType}
              onChange={e => setEmploymentType(e.target.value)}
              options={[
                {label:'Full-time',value:'Full-time'},{label:'Part-time',value:'Part-time'},
                {label:'Contract',value:'Contract'},{label:'Locum',value:'Locum'}
              ]}
            />
            <FormInput label="Number of openings" type="number" value={openings} onChange={e => setOpenings(e.target.value)} min="1" />
            <FormInput label="Job location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Delhi NCR" />
          </div>
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
          <Button type="button" variant="ghost">Save as draft</Button>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <Button type="button" variant="ghost" to="/recruiter/dashboard" className="flex-1 sm:flex-none">Cancel</Button>
            <Button type="submit" variant="blue" size="lg" className="flex-1 sm:flex-none">Publish job →</Button>
          </div>
        </div>

      </form>
    </div>
  )
}