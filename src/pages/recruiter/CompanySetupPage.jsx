import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormInput, FormSelect } from '../../components/FormElements'
import { Button } from '../../components/Button'
import { getCompanyProfile, saveCompanyProfile } from '../../hooks/useUserProfile'

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
  const saved = getCompanyProfile() || {}

  const [orgType, setOrgType] = useState(saved.orgType || '')
  const [companyName, setCompanyName] = useState(saved.companyName || '')
  const [city, setCity] = useState(saved.city || '')
  const [website, setWebsite] = useState(saved.website || '')
  const [regNumber, setRegNumber] = useState(saved.regNumber || '')
  const [description, setDescription] = useState(saved.description || '')
  const [numBeds, setNumBeds] = useState(saved.numBeds || '')
  const [estYear, setEstYear] = useState(saved.estYear || '')
  const [specialities, setSpecialities] = useState(saved.specialities || '')
  const [contactName, setContactName] = useState(saved.contactName || '')
  const [contactDesignation, setContactDesignation] = useState(saved.contactDesignation || 'HR')
  const [contactPhone, setContactPhone] = useState(saved.contactPhone || '')
  const [contactEmail, setContactEmail] = useState(saved.contactEmail || '')
  const [logo, setLogo] = useState(saved.logo || null)
  const [regCert, setRegCert] = useState(saved.regCert || null)

  const logoRef = useRef(null)
  const certRef = useRef(null)

  const types = [
    { icon: '🏥', name: 'Hospital' },
    { icon: '🏢', name: 'Multi-speciality' },
    { icon: '🩺', name: 'Clinic' },
    { icon: '🔬', name: 'Diagnostic Lab' }
  ]

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogo(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleCertUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) setRegCert(file.name)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveCompanyProfile({
      orgType, companyName, city, website, regNumber,
      description, numBeds, estYear, specialities,
      contactName, contactDesignation, contactPhone, contactEmail,
      logo, regCert,
    })
    navigate('/recruiter/dashboard')
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 py-10 pb-20 font-sans">

      <div className="text-center mb-9">
        <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Set up your company profile</h1>
        <p className="text-sm text-gray-500">Complete these 4 steps to start posting jobs and searching candidates.</p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Step 1: Company Basics */}
        <StepCard num="1" title="Company basics" desc="Tell us about your organisation">
          <FormInput label="Hospital / company name" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Apollo Hospitals" />

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
            <FormInput label="City / location" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Delhi NCR" className="mb-0" />
            <FormInput label="Website (optional)" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourhospital.com" className="mb-0" />
          </div>

          <FormInput
            label="Company registration number (optional)"
            value={regNumber}
            onChange={e => setRegNumber(e.target.value)}
            placeholder="For verified badge on your listings"
            hint='Companies with registration numbers get a "Verified" badge visible to candidates.'
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
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your organisation, its mission, and what makes it a great place to work..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Number of beds" type="number" value={numBeds} onChange={e => setNumBeds(e.target.value)} placeholder="e.g. 500" className="mb-0" />
            <FormInput label="Established year" type="number" value={estYear} onChange={e => setEstYear(e.target.value)} placeholder="e.g. 2001" className="mb-0" />
          </div>

          <FormInput
            label="Medical specialities offered"
            value={specialities}
            onChange={e => setSpecialities(e.target.value)}
            placeholder="e.g. Cardiology, Orthopaedics, Neurology"
            hint="Comma-separated list of specialities"
            className="mb-0"
          />
        </StepCard>

        {/* Step 3: Contact Person */}
        <StepCard num="3" title="Contact person" desc="Primary hiring contact details">
          <div className="grid sm:grid-cols-2 gap-3 mb-[18px]">
            <FormInput label="Full name" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="e.g. Amit Khanna" className="mb-0" />
            <FormSelect
              label="Designation"
              value={contactDesignation}
              onChange={e => setContactDesignation(e.target.value)}
              options={[
                {label:'HR Manager',value:'HR'},{label:'Admin',value:'Admin'},
                {label:'Director',value:'Director'},{label:'Talent Acquisition Lead',value:'TA'}
              ]}
              className="mb-0"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-0">
            <FormInput label="Direct phone number" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+91 98765 12345" className="mb-0" />
            <FormInput label="Direct email address" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="hr@yourhospital.com" className="mb-0" />
          </div>
        </StepCard>

        {/* Step 4: Logo & Verification */}
        <StepCard num="4" title="Logo & verification" desc="Build trust with candidates">
          <div className="grid sm:grid-cols-2 gap-3 mb-4 [&>div]:mb-0">
            <div className="mb-0">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company logo</label>
              <input type="file" accept="image/png, image/jpeg" className="hidden" ref={logoRef} onChange={handleLogoUpload} />
              <div
                onClick={() => logoRef.current?.click()}
                className={`border-2 ${logo ? 'border-solid border-blue-200 bg-blue-50' : 'border-dashed border-border hover:border-blue-200 hover:bg-blue-50'} rounded-xl p-7 text-center cursor-pointer transition-colors`}
              >
                {logo ? (
                  <div className="flex flex-col items-center">
                    <img src={logo} alt="logo" className="w-16 h-16 object-contain rounded-lg mb-2 border border-white shadow-sm" />
                    <div className="text-sm font-semibold text-blue-700">Logo uploaded</div>
                  </div>
                ) : (
                  <>
                    <div className="text-[32px] mb-2 opacity-60">🏢</div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Upload logo</div>
                    <div className="text-xs text-gray-400">PNG or JPG · Square recommended</div>
                  </>
                )}
              </div>
            </div>
            <div className="mb-0">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Registration certificate</label>
              <input type="file" accept=".pdf, image/*" className="hidden" ref={certRef} onChange={handleCertUpload} />
              <div
                onClick={() => certRef.current?.click()}
                className={`border-2 ${regCert ? 'border-solid border-blue-200 bg-blue-50' : 'border-dashed border-border hover:border-blue-200 hover:bg-blue-50'} rounded-xl p-7 text-center cursor-pointer transition-colors`}
              >
                {regCert ? (
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-semibold text-blue-700">{regCert}</div>
                    <div className="text-xs text-blue-600 mt-1">✓ Attached</div>
                  </div>
                ) : (
                  <>
                    <div className="text-[32px] mb-2 opacity-60">📋</div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Upload certificate</div>
                    <div className="text-xs text-gray-400">PDF or image · Optional</div>
                  </>
                )}
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
          <Button type="submit" variant="blue" size="lg">Save & go to dashboard →</Button>
        </div>

      </form>
    </div>
  )
}
