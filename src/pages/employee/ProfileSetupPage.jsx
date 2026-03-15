import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { FormInput, FormSelect } from '../../components/FormElements'

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
  const [selectedProf, setSelectedProf] = useState('Doctor')
  const [skills, setSkills] = useState(['Internal Medicine', 'ICU / Critical Care', 'Emergency Medicine'])
  const [experiences, setExperiences] = useState([{ id: 1 }])
  const [qualifications, setQualifications] = useState([{ id: 1 }])
  const [certifications, setCertifications] = useState([{ id: 1 }])

  const addExperience = () => setExperiences([...experiences, { id: Date.now() }])
  const removeExperience = (id) => setExperiences(experiences.filter(exp => exp.id !== id))

  const addQualification = () => setQualifications([...qualifications, { id: Date.now() }])
  const removeQualification = (id) => setQualifications(qualifications.filter(q => q.id !== id))

  const addCertification = () => setCertifications([...certifications, { id: Date.now() }])
  const removeCertification = (id) => setCertifications(certifications.filter(c => c.id !== id))

  // Photo & Resume Mock State
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [resumeFilename, setResumeFilename] = useState(null)
  
  const photoInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  useEffect(() => {
    // Load persisted mock files
    const savedPhoto = localStorage.getItem('mockProfilePhoto')
    if (savedPhoto) setProfilePhoto(savedPhoto)

    const savedResume = localStorage.getItem('mockResumeFilename')
    if (savedResume) setResumeFilename(savedResume)

    const savedCerts = localStorage.getItem('mockCertifications')
    if (savedCerts) {
      try {
        setCertifications(JSON.parse(savedCerts))
      } catch (e) {
        // ignore parse error
      }
    }
  }, [])

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
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result
        setProfilePhoto(dataUrl)
        localStorage.setItem('mockProfilePhoto', dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFilename(file.name)
      localStorage.setItem('mockResumeFilename', file.name)
      // We could store the file data contents here if we needed to actually view the CV later
      // For now, storing the filename gives adequate feedback to the user that it uploaded
    }
  }

  const handleRemovePhoto = (e) => {
    e.stopPropagation()
    setProfilePhoto(null)
    localStorage.removeItem('mockProfilePhoto')
  }

  const handleRemoveResume = (e) => {
    e.stopPropagation()
    setResumeFilename(null)
    localStorage.removeItem('mockResumeFilename')
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }

  const handleCertificateUpload = (id, e) => {
    const file = e.target.files?.[0]
    if (file) {
      const newCerts = certifications.map(cert => 
        cert.id === id ? { ...cert, filename: file.name } : cert
      )
      setCertifications(newCerts)
      localStorage.setItem('mockCertifications', JSON.stringify(newCerts))
    }
  }

  const removeCertificateFile = (id, e) => {
    e.stopPropagation()
    const newCerts = certifications.map(cert => 
      cert.id === id ? { ...cert, filename: null } : cert
    )
    setCertifications(newCerts)
    localStorage.setItem('mockCertifications', JSON.stringify(newCerts))
    // Clear input value
    const input = document.getElementById(`cert-upload-${id}`)
    if (input) input.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/jobs')
  }

  // Calculate completion percentage mock based on whether files are attached
  const completionPercentage = (profilePhoto ? 7 : 0) + (resumeFilename ? 8 : 0) + 85

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
                <FormInput label="Job title / designation" defaultValue={index === 0 ? "Senior Resident" : ""} />
                <FormInput label="Hospital / clinic name" defaultValue={index === 0 ? "AIIMS Delhi" : ""} />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Department" defaultValue={index === 0 ? "Internal Medicine" : ""} />
                <FormSelect label="Employment type" options={[{label:'Full-time',value:'Full-time'}, {label:'Part-time',value:'Part-time'}, {label:'Contract',value:'Contract'}, {label:'Locum',value:'Locum'}]} />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Start date" type="month" defaultValue={index === 0 ? "2021-06" : ""} />
                <FormInput label="End date" type="month" hint="Leave empty if this is your current role" />
              </div>
              
              <div className="mb-0">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Brief duties description</label>
                <textarea 
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white transition-all outline-none focus:border-teal-200 focus:ring-3 focus:ring-teal-200/20" 
                  rows="2" 
                  defaultValue={index === 0 ? "Managing patient rounds in internal medicine ward, supervising junior residents." : ""}
                ></textarea>
              </div>
            </div>
          ))}
          <button type="button" onClick={addExperience} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">
            + Add another experience
          </button>
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
                <FormInput label="Degree / diploma" defaultValue={index === 0 ? "MBBS" : ""} />
                <FormInput label="Institution / university" defaultValue={index === 0 ? "AIIMS Delhi" : ""} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 [&>div]:mb-0">
                <FormInput label="Specialisation / stream" defaultValue={index === 0 ? "General Medicine" : ""} className="mb-0" />
                <FormInput label="Year of passing" type="number" defaultValue={index === 0 ? "2019" : ""} min="1960" max="2030" className="mb-0" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addQualification} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">
            + Add another qualification
          </button>
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
                <FormSelect label="License type" options={[{label:'NMC Registration',value:'NMC'}, {label:'State Medical Council',value:'State'}, {label:'Indian Nursing Council',value:'INC'}, {label:'Other',value:'Other'}]} />
                <FormInput label="Registration number" defaultValue={index === 0 ? "NMC/2019/74521" : ""} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormInput label="Issuing authority" defaultValue={index === 0 ? "National Medical Commission" : ""} />
                <FormInput label="Valid until" type="month" defaultValue={index === 0 ? "2029-06" : ""} />
              </div>
              
              <div className="mb-0">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Upload certificate (PDF or image)</label>
                
                <input 
                  type="file" 
                  accept=".pdf, image/jpeg, image/png" 
                  className="hidden" 
                  id={`cert-upload-${cert.id}`}
                  onChange={(e) => handleCertificateUpload(cert.id, e)}
                />

                <div 
                  onClick={() => document.getElementById(`cert-upload-${cert.id}`).click()}
                  className={`border-2 ${cert.filename ? 'border-solid border-teal-200 bg-teal-50' : 'border-dashed border-border hover:border-teal-200 hover:bg-teal-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}
                >
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
          <button type="button" onClick={addCertification} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">
            + Add another certification
          </button>
        </StepCard>

        {/* Step 4: Skills */}
        <StepCard id="step4" num="4" title="Skills & specialisations" desc="Select your areas of expertise and preferences">
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Select your skills (choose all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3.5 py-1.5 border rounded-full text-[13px] transition-colors ${
                    skills.includes(skill)
                      ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                      : 'border-border bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3.5">
            <FormSelect label="Preferred job type" options={[{label:'Full-time',value:'Full-time'}, {label:'Part-time',value:'Part-time'}, {label:'Contract / Locum',value:'Contract'}, {label:'Any',value:'Any'}]} />
            <FormInput label="Preferred city" defaultValue="Mumbai" />
          </div>
          <div className="mb-0 max-w-[200px]">
            <FormSelect label="Open to remote / teleconsultation?" options={[{label:'No',value:'No'}, {label:'Yes',value:'Yes'}]} className="mb-0" />
          </div>
        </StepCard>

        {/* Step 5: Salary */}
        <StepCard id="step5" num="5" title="Salary & preferences" desc="Helps us match you with jobs in your salary range" color="amber">
          <div className="grid sm:grid-cols-2 gap-3">
            <FormInput label="Current salary (₹ per year)" placeholder="e.g. 12,00,000" defaultValue="14,00,000" />
            <FormInput label="Expected salary (₹ per year)" placeholder="e.g. 18,00,000" defaultValue="20,00,000" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-1 [&>div]:mb-0">
            <FormSelect label="Notice period" options={[{label:'Immediate',value:'0'}, {label:'15 days',value:'15'}, {label:'30 days',value:'30'}, {label:'60 days',value:'60'}]} defaultValue="30" className="mb-0" />
            <FormSelect label="Open to relocation?" options={[{label:'Yes',value:'Yes'}, {label:'No',value:'No'}]} className="mb-0" />
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

        {/* Bottom Banner */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 md:p-5 flex items-center gap-3.5 mt-5">
          <div className="font-serif text-[28px] text-teal-700 shrink-0">{completionPercentage}%</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-teal-600 mb-1.5">{completionPercentage === 100 ? 'Profile fully complete! Great job.' : 'Profile completion — add photo & resume to reach 100%'}</div>
            <div className="h-1.5 w-full bg-teal-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-7 gap-4">
          <Button type="button" variant="ghost" to="/jobs">Skip remaining &rarr;</Button>
          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">Save & view job feed &rarr;</Button>
        </div>

      </form>
    </div>
  )
}
