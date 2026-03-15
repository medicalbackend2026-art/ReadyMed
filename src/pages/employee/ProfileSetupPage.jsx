import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { FormInput, FormSelect } from '../../components/FormElements'
import { getUserProfile, saveUserProfile, getProfileCompletion } from '../../hooks/useUserProfile'
import { registerAsCandidate } from '../../context/AppContext'

// Helper component for steps
function StepCard({ id, num, title, desc, required = false, children, color = 'coral' }) {
  return (
    <div id={id} className="bg-white border border-border rounded-2xl p-7 mb-5">
      <div className="flex items-center gap-3.5 mb-5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 bg-${color}-50 text-${color}-700`}>
          {num}
        </div>
        <div>
          <div className="text-[17px] font-semibold flex items-center">
            {title}
            {required ? (
              <span className="inline-block text-[9px] font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">Required</span>
            ) : (
              <span className="inline-block text-[9px] font-semibold bg-gray-50 text-gray-500 border border-border px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">Optional</span>
            )}
          </div>
          <div className="text-[13px] text-gray-500 mt-0.5">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const profile = getUserProfile() || {}

  const [selectedProf, setSelectedProf] = useState(profile.profession || '')
  const [skills, setSkills] = useState(profile.skills || [])
  const [experiences, setExperiences] = useState(
    profile.experiences?.length ? profile.experiences : [{ id: 1, jobTitle: '', hospital: '', department: '', employmentType: 'Full-time', startDate: '', endDate: '', duties: '' }]
  )
  const [qualifications, setQualifications] = useState(
    profile.qualifications?.length ? profile.qualifications : [{ id: 1, degree: '', institution: '', specialisation: '', yearOfPassing: '' }]
  )
  const [certifications, setCertifications] = useState(
    profile.certifications?.length ? profile.certifications : [{ id: 1, licenseType: 'NMC', regNumber: '', issuingAuthority: '', validUntil: '', filename: null }]
  )
  const [preferredJobType, setPreferredJobType] = useState(profile.preferredJobType || 'Full-time')
  const [preferredCity, setPreferredCity] = useState(profile.preferredCity || '')
  const [openToRemote, setOpenToRemote] = useState(profile.openToRemote || 'No')
  const [currentSalary, setCurrentSalary] = useState(profile.currentSalary || '')
  const [expectedSalary, setExpectedSalary] = useState(profile.expectedSalary || '')
  const [noticePeriod, setNoticePeriod] = useState(profile.noticePeriod || '30')
  const [openToRelocation, setOpenToRelocation] = useState(profile.openToRelocation || 'Yes')
  const [profilePhoto, setProfilePhoto] = useState(profile.photo || null)
  const [resumeFilename, setResumeFilename] = useState(profile.resumeFilename || null)

  const photoInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  const professions = [
    { icon: '🩺', name: 'Doctor' },
    { icon: '👩‍⚕️', name: 'Nurse' },
    { icon: '💊', name: 'Pharmacist' },
    { icon: '🔬', name: 'Lab Technician' },
    { icon: '🦴', name: 'Physiotherapist' },
    { icon: '📡', name: 'Radiologist' },
    { icon: '🚑', name: 'Paramedic' },
    { icon: '🏢', name: 'Hospital Admin' }
  ]

  const availableSkills = [
    'Internal Medicine', 'ICU / Critical Care', 'Paediatrics', 'Emergency Medicine',
    'Cardiology', 'Orthopaedics', 'Neurology', 'Oncology', 'Dermatology',
    'OT Assist', 'Gynaecology', 'Radiology'
  ]

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  // Experience helpers
  const addExperience = () => setExperiences(prev => [...prev, { id: Date.now(), jobTitle: '', hospital: '', department: '', employmentType: 'Full-time', startDate: '', endDate: '', duties: '' }])
  const removeExperience = (id) => setExperiences(prev => prev.filter(e => e.id !== id))
  const updateExperience = (id, field, value) => setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))

  // Qualification helpers
  const addQualification = () => setQualifications(prev => [...prev, { id: Date.now(), degree: '', institution: '', specialisation: '', yearOfPassing: '' }])
  const removeQualification = (id) => setQualifications(prev => prev.filter(q => q.id !== id))
  const updateQualification = (id, field, value) => setQualifications(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))

  // Certification helpers
  const addCertification = () => setCertifications(prev => [...prev, { id: Date.now(), licenseType: 'NMC', regNumber: '', issuingAuthority: '', validUntil: '', filename: null }])
  const removeCertification = (id) => setCertifications(prev => prev.filter(c => c.id !== id))
  const updateCertification = (id, field, value) => setCertifications(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result)
        saveUserProfile({ photo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = (e) => {
    e.stopPropagation()
    setProfilePhoto(null)
    saveUserProfile({ photo: null })
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFilename(file.name)
      saveUserProfile({ resumeFilename: file.name })
    }
  }

  const handleRemoveResume = (e) => {
    e.stopPropagation()
    setResumeFilename(null)
    saveUserProfile({ resumeFilename: null })
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  const handleCertificateUpload = (id, e) => {
    const file = e.target.files?.[0]
    if (file) updateCertification(id, 'filename', file.name)
  }

  const removeCertificateFile = (id, e) => {
    e.stopPropagation()
    updateCertification(id, 'filename', null)
    const input = document.getElementById(`cert-upload-${id}`)
    if (input) input.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveUserProfile({
      profession: selectedProf,
      skills,
      experiences,
      qualifications,
      certifications,
      preferredJobType,
      preferredCity,
      openToRemote,
      currentSalary,
      expectedSalary,
      noticePeriod,
      openToRelocation,
    })
    navigate('/dashboard')
  }

  const currentProfile = {
    profession: selectedProf, skills, experiences, qualifications,
    certifications, preferredJobType, preferredCity, openToRemote,
    currentSalary, expectedSalary, noticePeriod, openToRelocation,
    photo: profilePhoto, resumeFilename,
  }
  const completionPercentage = getProfileCompletion(currentProfile)

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10 pb-20 font-sans">
      
      <div className="text-center mb-9">
        <h1 className="font-serif text-[28px] text-gray-900 mb-1.5">Complete your profile</h1>
        <p className="text-sm text-gray-500">Tell us about your medical career. Only Step 0 is required — everything else improves your job matches.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Profile completion</span>
          <span>Step 5 of 7</span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          <div className="flex-1 rounded-full bg-teal-600"></div>
          <div className="flex-1 rounded-full bg-teal-600"></div>
          <div className="flex-1 rounded-full bg-teal-600"></div>
          <div className="flex-1 rounded-full bg-teal-600"></div>
          <div className="flex-1 rounded-full bg-teal-600"></div>
          <div className="flex-1 rounded-full bg-teal-600"></div>
          <div className="flex-1 rounded-full bg-border"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Step 0: Profession */}
        <StepCard id="step0" num="0" title="Select your profession" desc="Choose one — this determines your job feed and matching" required color="pink">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {professions.map(prof => (
              <button
                key={prof.name}
                type="button"
                onClick={() => setSelectedProf(prof.name)}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  selectedProf === prof.name 
                    ? 'border-pink-600 bg-pink-50' 
                    : 'border-border hover:border-pink-200 hover:bg-pink-50'
                }`}
              >
                <div className="text-[26px] mb-1.5">{prof.icon}</div>
                <div className="text-[13px] font-semibold text-gray-900">{prof.name}</div>
              </button>
            ))}
          </div>
        </StepCard>

        {/* Step 1: Work Experience */}
        <StepCard id="step1" num="1" title="Work experience" desc="Add your medical work history — multiple entries supported">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="bg-gray-50 border border-border rounded-xl p-[18px] mb-3 relative">
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[11px] font-semibold text-coral-600 uppercase tracking-[0.05em]">Experience {index + 1}</span>
                {experiences.length > 1 && (
                  <button type="button" onClick={() => removeExperience(exp.id)} className="text-xs text-gray-400 hover:text-coral-600">✕ Remove</button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Job title / designation" value={exp.jobTitle} onChange={e => updateExperience(exp.id, 'jobTitle', e.target.value)} />
                <FormInput label="Hospital / clinic name" value={exp.hospital} onChange={e => updateExperience(exp.id, 'hospital', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Department" value={exp.department} onChange={e => updateExperience(exp.id, 'department', e.target.value)} />
                <FormSelect label="Employment type" value={exp.employmentType} onChange={e => updateExperience(exp.id, 'employmentType', e.target.value)} options={[{label:'Full-time',value:'Full-time'},{label:'Part-time',value:'Part-time'},{label:'Contract',value:'Contract'},{label:'Locum',value:'Locum'}]} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Start date" type="month" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                <FormInput label="End date" type="month" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} hint="Leave empty if this is your current role" />
              </div>
              <div className="mb-0">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Brief duties description</label>
                <textarea className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-teal-200 focus:ring-3 focus:ring-teal-200/20" rows="2" value={exp.duties} onChange={e => updateExperience(exp.id, 'duties', e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" onClick={addExperience} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">+ Add another experience</button>
        </StepCard>

        {/* Step 2: Education */}
        <StepCard id="step2" num="2" title="Education" desc="Add your degrees, diplomas and qualifications">
          {qualifications.map((qual, index) => (
            <div key={qual.id} className="bg-gray-50 border border-border rounded-xl p-[18px] mb-3 relative">
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[11px] font-semibold text-coral-600 uppercase tracking-[0.05em]">Qualification {index + 1}</span>
                {qualifications.length > 1 && (
                  <button type="button" onClick={() => removeQualification(qual.id)} className="text-xs text-gray-400 hover:text-coral-600">✕ Remove</button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Degree / diploma" value={qual.degree} onChange={e => updateQualification(qual.id, 'degree', e.target.value)} />
                <FormInput label="Institution / university" value={qual.institution} onChange={e => updateQualification(qual.id, 'institution', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 [&>div]:mb-0">
                <FormInput label="Specialisation / stream" value={qual.specialisation} onChange={e => updateQualification(qual.id, 'specialisation', e.target.value)} className="mb-0" />
                <FormInput label="Year of passing" type="number" value={qual.yearOfPassing} onChange={e => updateQualification(qual.id, 'yearOfPassing', e.target.value)} min="1960" max="2030" className="mb-0" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addQualification} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">+ Add another qualification</button>
        </StepCard>

        {/* Step 3: Certifications */}
        <StepCard id="step3" num="3" title="Certifications & licenses" desc="Add your medical licenses and certifications">
          {certifications.map((cert, index) => (
            <div key={cert.id} className="bg-gray-50 border border-border rounded-xl p-[18px] mb-3 relative">
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[11px] font-semibold text-coral-600 uppercase tracking-[0.05em]">License {index + 1}</span>
                {certifications.length > 1 && (
                  <button type="button" onClick={() => removeCertification(cert.id)} className="text-xs text-gray-400 hover:text-coral-600">✕ Remove</button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormSelect label="License type" value={cert.licenseType} onChange={e => updateCertification(cert.id, 'licenseType', e.target.value)} options={[{label:'NMC Registration',value:'NMC'},{label:'State Medical Council',value:'State'},{label:'Indian Nursing Council',value:'INC'},{label:'Other',value:'Other'}]} />
                <FormInput label="Registration number" value={cert.regNumber} onChange={e => updateCertification(cert.id, 'regNumber', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Issuing authority" value={cert.issuingAuthority} onChange={e => updateCertification(cert.id, 'issuingAuthority', e.target.value)} />
                <FormInput label="Valid until" type="month" value={cert.validUntil} onChange={e => updateCertification(cert.id, 'validUntil', e.target.value)} />
              </div>
              <div className="mb-0">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Upload certificate (PDF or image)</label>
                <input type="file" accept=".pdf, image/jpeg, image/png" className="hidden" id={`cert-upload-${cert.id}`} onChange={(e) => handleCertificateUpload(cert.id, e)} />
                <div onClick={() => document.getElementById(`cert-upload-${cert.id}`).click()} className={`border-2 ${cert.filename ? 'border-solid border-teal-200 bg-teal-50' : 'border-dashed border-border hover:border-teal-200 hover:bg-teal-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}>
                  {cert.filename ? (
                    <div className="flex flex-col items-center justify-center min-h-[50px]">
                      <div className="text-sm font-semibold text-teal-700">{cert.filename}</div>
                      <div className="text-xs text-teal-600 mt-1">✓ Attached successfully</div>
                      <button type="button" onClick={(e) => removeCertificateFile(cert.id, e)} className="text-xs text-red-500 hover:underline mt-2 absolute top-2 right-3">Remove</button>
                    </div>
                  ) : (
                    <>
                      <div className="text-[32px] mb-2 opacity-60">📄</div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">Click to upload or drag and drop</div>
                      <div className="text-xs text-gray-400">PDF, JPG or PNG · Max 10MB</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addCertification} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">+ Add another certification</button>
        </StepCard>

        {/* Step 4: Skills */}
        <StepCard id="step4" num="4" title="Skills & specialisations" desc="Select your areas of expertise and preferences">
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Select your skills (choose all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)} className={`px-3.5 py-1.5 border rounded-full text-[13px] transition-colors ${skills.includes(skill) ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium' : 'border-border bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3.5">
            <FormSelect label="Preferred job type" value={preferredJobType} onChange={e => setPreferredJobType(e.target.value)} options={[{label:'Full-time',value:'Full-time'},{label:'Part-time',value:'Part-time'},{label:'Contract / Locum',value:'Contract'},{label:'Any',value:'Any'}]} />
            <FormInput label="Preferred city" value={preferredCity} onChange={e => setPreferredCity(e.target.value)} />
          </div>
          <div className="mb-0 max-w-[200px]">
            <FormSelect label="Open to remote / teleconsultation?" value={openToRemote} onChange={e => setOpenToRemote(e.target.value)} options={[{label:'No',value:'No'},{label:'Yes',value:'Yes'}]} className="mb-0" />
          </div>
        </StepCard>

        {/* Step 5: Salary */}
        <StepCard id="step5" num="5" title="Salary & preferences" desc="Helps us match you with jobs in your salary range" color="amber">
          <div className="grid sm:grid-cols-2 gap-3">
            <FormInput label="Current salary (₹ per year)" placeholder="e.g. 12,00,000" value={currentSalary} onChange={e => setCurrentSalary(e.target.value)} />
            <FormInput label="Expected salary (₹ per year)" placeholder="e.g. 18,00,000" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-1 [&>div]:mb-0">
            <FormSelect label="Notice period" value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} options={[{label:'Immediate',value:'0'},{label:'15 days',value:'15'},{label:'30 days',value:'30'},{label:'60 days',value:'60'}]} className="mb-0" />
            <FormSelect label="Open to relocation?" value={openToRelocation} onChange={e => setOpenToRelocation(e.target.value)} options={[{label:'Yes',value:'Yes'},{label:'No',value:'No'}]} className="mb-0" />
          </div>
        </StepCard>

        {/* Step 6: Photo & Resume */}
        <StepCard id="step6" num="6" title="Photo & resume upload" desc="A complete profile gets 3× more recruiter views">
          <div className="grid sm:grid-cols-2 gap-3 [&>div]:mb-0">
            <div className="mb-0 relative">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Profile photo</label>
              
              <input 
                type="file" 
                accept="image/jpeg, image/png" 
                className="hidden" 
                ref={photoInputRef}
                onChange={handlePhotoUpload}
              />
              
              <div 
                onClick={() => photoInputRef.current?.click()}
                className={`border-2 ${profilePhoto ? 'border-solid border-teal-200 bg-teal-50' : 'border-dashed border-border hover:border-teal-200 hover:bg-teal-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}
              >
                {profilePhoto ? (
                  <div className="flex flex-col items-center">
                    <img src={profilePhoto} alt="Profile preview" className="w-16 h-16 rounded-full object-cover shadow-sm mb-3 border border-white" />
                    <div className="text-sm font-semibold text-teal-700">Photo attached</div>
                    <button type="button" onClick={handleRemovePhoto} className="text-xs text-red-500 hover:underline mt-1 absolute top-3 right-3">Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="text-[32px] mb-2 opacity-60">📷</div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Upload your photo</div>
                    <div className="text-xs text-gray-400">JPG or PNG · Max 5MB</div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-0 relative">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Resume / CV</label>
              
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                ref={resumeInputRef}
                onChange={handleResumeUpload}
              />

              <div 
                onClick={() => resumeInputRef.current?.click()}
                className={`border-2 ${resumeFilename ? 'border-solid border-teal-200 bg-teal-50' : 'border-dashed border-border hover:border-teal-200 hover:bg-teal-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}
              >
                {resumeFilename ? (
                  <div className="flex flex-col items-center justify-center min-h-[105px]">
                    <div className="w-10 h-10 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center text-teal-600 mb-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div className="text-sm font-semibold text-teal-700 max-w-[150px] truncate">{resumeFilename}</div>
                    <button type="button" onClick={handleRemoveResume} className="text-xs text-red-500 hover:underline mt-1 absolute top-3 right-3">Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="text-[32px] mb-2 opacity-60">📋</div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Upload your CV</div>
                    <div className="text-xs text-gray-400">PDF only · Max 10MB</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </StepCard>

        {/* Bottom Banner — only shown when profile is incomplete */}
        {completionPercentage < 100 && (
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 md:p-5 flex items-center gap-3.5 mt-5">
            <div className="font-serif text-[28px] text-teal-700 shrink-0">{completionPercentage}%</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-teal-700 mb-1.5">Profile completion</div>
              <div className="h-1.5 w-full bg-teal-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-teal-600 mt-1">Add photo &amp; resume to reach 100%</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-7 gap-4">
          <Button type="button" variant="ghost" to="/jobs">Skip remaining &rarr;</Button>
          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">Save & view job feed &rarr;</Button>
        </div>

      </form>
    </div>
  )
}
