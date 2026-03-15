import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { FormInput, FormSelect } from '../../components/FormElements'
import { useAppContext } from '../../context/AppContext'

// Helper component for steps
function StepCard({ id, num, title, desc, children }) {
  return (
    <div id={id} className="bg-white border border-border rounded-2xl p-7 mb-5">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 bg-coral-50 text-coral-700">
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
  const [skills, setSkills] = useState(['Internal Medicine', 'ICU / Critical Care', 'General Medicine'])

  const availableSkills = [
    'Internal Medicine', 'ICU / Critical Care', 'Emergency Medicine', 
    'Cardiology', 'Nephrology', 'General Medicine', 
    'Infectious Disease', 'Rheumatology'
  ]

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Extract form data
    const formData = new FormData(e.target)
    
    const salaryMin = formData.get('salaryMin') || '18,00,000'
    const salaryMax = formData.get('salaryMax') || '24,00,000'
    const expYears = formData.get('experience') || '5'
    
    const newJob = {
      title: formData.get('title') || 'Consultant — Internal Medicine',
      hospital: 'Apollo Hospitals', // Mock company context
      location: formData.get('location') || 'Delhi NCR',
      type: formData.get('type') || 'Full-time',
      salary: `₹${(parseInt(salaryMin.replace(/,/g, ''))/100000).toFixed(0)}L - ₹${(parseInt(salaryMax.replace(/,/g, ''))/100000).toFixed(0)}L / year`,
      specialisation: formData.get('department') || 'Internal Medicine',
      description: formData.get('description') || 'No description provided.',
      requirements: [
        formData.get('qualification') || 'MD / DNB Internal Medicine',
        `Minimum ${expYears} years of experience`,
        formData.get('certs') || 'Valid License'
      ]
    }

    // Add to context mock DB
    addJob(newJob)
    
    // Navigate back to dashboard with success message (or just go to dashboard)
    navigate('/recruiter/dashboard')
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10 pb-20 font-sans">
      
      <div className="text-center mb-9">
        <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Post a new job</h1>
        <p className="text-sm text-gray-500">Create your listing in 3 simple steps. Published jobs are instantly visible to matched candidates.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Job post</span>
          <span>Step 2 of 3</span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          <div className="flex-1 rounded-full bg-blue-600"></div>
          <div className="flex-1 rounded-full bg-blue-600"></div>
          <div className="flex-1 rounded-full bg-border"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Step 1: Job Basics */}
        <StepCard id="step1" num="1" title="Job basics" desc="Define the position you're hiring for">
          <FormInput label="Job title / designation" name="title" defaultValue="Consultant — Internal Medicine" />
          
          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormSelect 
              label="Profession required" 
              name="profession"
              options={[
                {label:'Doctor',value:'Doctor'}, {label:'Nurse',value:'Nurse'},
                {label:'Pharmacist',value:'Pharmacist'}, {label:'Lab Technician',value:'Lab Technician'},
                {label:'Physiotherapist',value:'Physiotherapist'}, {label:'Radiologist',value:'Radiologist'},
                {label:'Paramedic',value:'Paramedic'}, {label:'Hospital Admin',value:'Hospital Admin'}
              ]}
              defaultValue="Doctor" className="mb-0" 
            />
            <FormInput label="Department" name="department" defaultValue="Internal Medicine" className="mb-0" />
          </div>
          
          <div className="grid sm:grid-cols-3 gap-3 [&>div]:mb-0">
            <FormSelect 
              label="Employment type" 
              name="type"
              options={[
                {label:'Full-time',value:'Full-time'}, {label:'Part-time',value:'Part-time'},
                {label:'Contract',value:'Contract'}, {label:'Locum',value:'Locum'}
              ]}
            />
            <FormInput label="Number of openings" name="openings" type="number" defaultValue="1" min="1" />
            <FormInput label="Job location" name="location" defaultValue="Delhi NCR" />
          </div>
        </StepCard>

        {/* Step 2: Requirements & Salary */}
        <StepCard id="step2" num="2" title="Requirements & salary" desc="Define what you're looking for in candidates">
          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Minimum years of experience" name="experience" type="number" defaultValue="5" min="0" className="mb-0" />
            <FormInput label="Required qualification" name="qualification" defaultValue="MD / DNB Internal Medicine" className="mb-0" />
          </div>
          
          <FormInput label="Required certifications" name="certs" defaultValue="NMC Registration, Valid State Medical Council License" />
          
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
                      ? 'border-coral-600 bg-coral-50 text-coral-700 font-medium'
                      : 'border-border bg-white text-gray-700 hover:border-coral-200 hover:bg-coral-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Salary range — min (₹/year)" name="salaryMin" defaultValue="18,00,000" className="mb-0" />
            <FormInput label="Salary range — max (₹/year)" name="salaryMax" defaultValue="24,00,000" className="mb-0" />
          </div>
          
          <div className="max-w-[250px] mb-0">
            <FormSelect 
              label="Acceptable notice period" 
              name="notice"
              options={[
                {label:'Immediate only',value:'0'}, {label:'Up to 15 days',value:'15'},
                {label:'Up to 30 days',value:'30'}, {label:'Up to 60 days',value:'60'},
                {label:'Up to 90 days',value:'90'}
              ]}
              defaultValue="30" className="mb-0" 
            />
          </div>
        </StepCard>

        {/* Step 3: Description, Preview & Publish */}
        <StepCard id="step3" num="3" title="Description, preview & publish" desc="Write your job description and publish">
          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Full job description</label>
            <textarea 
              name="description"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-blue-200 focus:ring-3 focus:ring-blue-200/20" 
              rows="6" 
              defaultValue={`We are looking for an experienced Consultant in Internal Medicine to join our multi-speciality team at Fortis Healthcare, Delhi NCR.

The ideal candidate will have a strong clinical background in general medicine with additional competencies in critical care management. You will be responsible for outpatient consultations, inpatient management, and collaborating with specialists across departments.

Key responsibilities:
• Manage outpatient clinics and inpatient rounds
• Supervise junior residents and interns
• Participate in academic and CME activities
• Handle emergency medicine duties in rotation`}
            ></textarea>
          </div>
          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Benefits offered (optional)</label>
            <textarea 
              name="benefits"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-blue-200 focus:ring-3 focus:ring-blue-200/20" 
              rows="3" 
              defaultValue="Competitive salary with performance incentives, medical insurance for self and family, CME allowance, annual conference sponsorship, relocation assistance if required."
            ></textarea>
          </div>
          <div className="max-w-[250px] mb-0">
            <FormInput label="Application deadline" name="deadline" type="date" defaultValue="2026-04-15" className="mb-0" />
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
            <Button type="submit" variant="blue" size="lg" className="flex-1 sm:flex-none">Publish job &rarr;</Button>
          </div>
        </div>

      </form>
    </div>
  )
}
