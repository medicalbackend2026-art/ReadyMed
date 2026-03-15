import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormInput, FormSelect } from '../../components/FormElements'
import { Button } from '../../components/Button'

// Helper Step Component
function StepCard({ num, title, desc, children }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-7 mb-5">
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

export function CompanySetupPage() {
  const navigate = useNavigate()
  const [orgType, setOrgType] = useState('Multi-speciality')

  const types = [
    { icon: '🏥', name: 'Hospital' },
    { icon: '🏢', name: 'Multi-speciality' },
    { icon: '🩺', name: 'Clinic' },
    { icon: '🔬', name: 'Diagnostic Lab' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/recruiter/dashboard')
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 py-10 pb-20 font-sans">
      
      <div className="text-center mb-9">
        <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Set up your company profile</h1>
        <p className="text-sm text-gray-500">Complete these 4 steps to start posting jobs and searching candidates.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Company setup</span>
          <span>Step 2 of 4</span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          <div className="flex-1 rounded-full bg-blue-600"></div>
          <div className="flex-1 rounded-full bg-blue-600"></div>
          <div className="flex-1 rounded-full bg-border"></div>
          <div className="flex-1 rounded-full bg-border"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Step 1: Company Basics */}
        <StepCard num="1" title="Company basics" desc="Tell us about your organisation">
          <FormInput label="Hospital / company name" defaultValue="Fortis Healthcare" />
          
          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Organisation type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {types.map(t => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setOrgType(t.name)}
                  className={`p-3.5 border-2 rounded-[10px] text-center transition-all text-[13px] font-medium ${
                    orgType === t.name 
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-border text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{t.icon}</div>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="City / location" defaultValue="Delhi NCR" className="mb-0" />
            <FormInput label="Website (optional)" type="url" defaultValue="https://fortishealthcare.com" className="mb-0" />
          </div>

          <FormInput 
            label="Company registration number (optional)" 
            placeholder="For verified badge on your listings" 
            hint="Companies with registration numbers get a &quot;Verified&quot; badge visible to candidates." 
            className="mb-0"
          />
        </StepCard>

        {/* Step 2: About */}
        <StepCard num="2" title="About your company" desc="Help candidates understand what you do">
          <div className="mb-[18px]">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company description</label>
            <textarea 
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-blue-200 focus:ring-3 focus:ring-blue-200/20" 
              rows="3" 
              defaultValue="Fortis Healthcare is one of India's leading multi-speciality hospital chains, operating 27 hospitals across the country with over 4,100 beds and 400+ speciality services."
            ></textarea>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Number of beds" type="number" defaultValue="500" className="mb-0" />
            <FormInput label="Established year" type="number" defaultValue="2001" className="mb-0" />
          </div>

          <FormInput 
            label="Medical specialities offered" 
            defaultValue="Cardiology, Orthopaedics, Neurology, Oncology, Paediatrics, Emergency Medicine" 
            hint="Comma-separated list of specialities" 
            className="mb-0"
          />
        </StepCard>

        {/* Step 3: Contact Person */}
        <StepCard num="3" title="Contact person" desc="Primary hiring contact details">
          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Full name" defaultValue="Amit Khanna" className="mb-0" />
            <FormSelect 
              label="Designation" 
              options={[
                {label:'HR Manager',value:'HR'}, {label:'Admin',value:'Admin'},
                {label:'Director',value:'Director'}, {label:'Talent Acquisition Lead',value:'TA'}
              ]}
              className="mb-0"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-0">
            <FormInput label="Direct phone number" type="tel" defaultValue="+91 98765 12345" className="mb-0" />
            <FormInput label="Direct email address" type="email" defaultValue="amit.k@fortis.com" className="mb-0" />
          </div>
        </StepCard>

        {/* Step 4: Logo & Verification */}
        <StepCard num="4" title="Logo & verification" desc="Build trust with candidates">
          <div className="grid sm:grid-cols-2 gap-3 mb-4 [&>div]:mb-0">
            <div className="mb-0">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company logo</label>
              <div className="border-2 border-dashed border-border rounded-xl p-7 text-center cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-colors">
                <div className="text-[32px] mb-2 opacity-60">🏢</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">Upload logo</div>
                <div className="text-xs text-gray-400">PNG or JPG · Square recommended</div>
              </div>
            </div>
            <div className="mb-0">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Registration certificate</label>
              <div className="border-2 border-dashed border-border rounded-xl p-7 text-center cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-colors">
                <div className="text-[32px] mb-2 opacity-60">📋</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">Upload certificate</div>
                <div className="text-xs text-gray-400">PDF or image · Optional</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-[10px] p-3 text-[13px] text-blue-700 flex items-center gap-2 mt-3.5">
            <span className="shrink-0 bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">✓</span>
            Uploading your registration certificate earns a "Verified" badge — candidates are 2× more likely to apply to verified employers.
          </div>
        </StepCard>

        {/* Actions */}
        <div className="flex justify-between items-center mt-7">
          <Button type="button" variant="ghost" to="/">Back</Button>
          <Button type="submit" variant="blue" size="lg">Save & go to dashboard &rarr;</Button>
        </div>

      </form>
    </div>
  )
}
