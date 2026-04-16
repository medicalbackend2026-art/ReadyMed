import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { FormInput, FormSelect } from '../../components/FormElements'
import { getUserProfile, saveUserProfile, getProfileCompletion } from '../../hooks/useUserProfile'
import { registerAsCandidate } from '../../context/AppContext'
import { auth } from '../../firebase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // Only auto-redirect on first login (not when user explicitly edits profile)
  const isFirstLogin = !location.state?.editMode
  const profile = getUserProfile() || {}

  const getRoleMapping = (roleId) => {
    switch (roleId) {
      case 'doctor': return 'Doctor'
      case 'nurse': return 'Nurse'
      case 'physicist': return 'Medical Physicist'
      case 'pharmacist': return 'Pharmacist'
      case 'hospital_owner': return 'Hospital Admin'
      default: return roleId ? roleId.charAt(0).toUpperCase() + roleId.slice(1) : ''
    }
  }
  const defaultProf = profile.profession || getRoleMapping(profile.healthcareRole)
  const [selectedProf, setSelectedProf] = useState(defaultProf)
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
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [loadingFromCloud, setLoadingFromCloud] = useState(!profile.profession)

  const photoInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  // Fetch from Firestore on mount to restore data even if localStorage was cleared
  useEffect(() => {
    const fetchFromCloud = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) { setLoadingFromCloud(false); return }
        const res = await fetch(`${API}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) { setLoadingFromCloud(false); return }
        const { profile: p } = await res.json()
        if (p) {
          saveUserProfile(p)
          if (p.profession) {
            setSelectedProf(p.profession)
          } else if (p.healthcareRole) {
            // Cloud healthcareRole is the source of truth (saved when user selected their role)
            setSelectedProf(getRoleMapping(p.healthcareRole))
          }
          if (p.skills?.length) setSkills(p.skills)
          if (p.experiences?.length) setExperiences(p.experiences)
          if (p.qualifications?.length) setQualifications(p.qualifications)
          if (p.certifications?.length) setCertifications(p.certifications)
          if (p.preferredJobType) setPreferredJobType(p.preferredJobType)
          if (p.preferredCity) setPreferredCity(p.preferredCity)
          if (p.openToRemote) setOpenToRemote(p.openToRemote)
          if (p.currentSalary) setCurrentSalary(p.currentSalary)
          if (p.expectedSalary) setExpectedSalary(p.expectedSalary)
          if (p.noticePeriod) setNoticePeriod(p.noticePeriod)
          if (p.openToRelocation) setOpenToRelocation(p.openToRelocation)
          if (p.resumeFilename) setResumeFilename(p.resumeFilename)
          if (p.resumeUrl) setResumeUrl(p.resumeUrl)

          // Auto-redirect only on first login (not when user explicitly edits their profile)
          const checks = [
            !!p.profession,
            !!(p.experiences?.length > 0 && p.experiences[0].jobTitle),
            !!(p.qualifications?.length > 0 && p.qualifications[0].degree),
            !!(p.certifications?.length > 0 && p.certifications[0].regNumber),
            !!(p.skills?.length > 0),
            !!(p.currentSalary || p.expectedSalary),
            !!(p.photo || p.resumeFilename),
          ]
          const pct = Math.round((checks.filter(Boolean).length / 7) * 100)
          if (pct >= 75 && isFirstLogin) {
            const redirectTo = location.state?.redirectTo || '/services'
            navigate(redirectTo)
            return
          }
        }
      } catch (err) {
        console.warn('Could not fetch profile from cloud:', err)
      } finally {
        setLoadingFromCloud(false)
      }
    }
    fetchFromCloud()
  }, [])

  const professions = [
    { icon: '🩺', name: 'Doctor' },
    { icon: '👩‍⚕️', name: 'Nurse' },
    { icon: '💊', name: 'Pharmacist' },
    { icon: '🔬', name: 'Medical Physicist' },
    { icon: '🧪', name: 'Lab Technician' },
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

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('File too large. Max 10MB.'); return }
    setResumeFilename(file.name)
    setResumeUploading(true)
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      console.log('Cloudinary response:', data)
      if (data.secure_url) {
        setResumeUrl(data.secure_url)
        saveUserProfile({ resumeFilename: file.name, resumeUrl: data.secure_url })
        // Immediately persist to Firestore so recruiter can see it right away
        try {
          const token = await auth.currentUser?.getIdToken()
          if (token) {
            await fetch(`${API}/api/users/profile`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ resumeFilename: file.name, resumeUrl: data.secure_url }),
            })
          }
        } catch { }
      } else {
        console.error('Cloudinary upload failed:', data)
        saveUserProfile({ resumeFilename: file.name })
      }
    } catch (err) {
      console.error('Resume upload error:', err)
      saveUserProfile({ resumeFilename: file.name })
    } finally {
      setResumeUploading(false)
    }
  }

  const handleRemoveResume = (e) => {
    e.stopPropagation()
    setResumeFilename(null)
    setResumeUrl(null)
    saveUserProfile({ resumeFilename: null, resumeUrl: null })
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

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setSaveError('')

    const profileData = {
      name: profile.name || '',
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
      resumeFilename: resumeFilename || null,
      resumeUrl: resumeUrl || null,
    }

    // Always persist locally
    saveUserProfile(profileData)

    // Sync to Firebase via backend
    setSaving(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        const res = await fetch(`${API}/api/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Save failed')
        }
      }
      navigate('/dashboard')
    } catch (err) {
      console.error('Profile sync error:', err)
      setSaveError('Profile saved locally but could not sync to cloud. You can continue.')
      // Still navigate after a short delay so user isn't blocked
      setTimeout(() => navigate('/dashboard'), 2000)
    } finally {
      setSaving(false)
    }
  }

  // ─── Accordion state ────────────────────────────────────────────────────────
  // Compute which sections are complete to determine default open section
  const sectionComplete = [
    !!selectedProf,
    !!(experiences[0]?.jobTitle),
    !!(qualifications[0]?.degree),
    !!(certifications[0]?.regNumber),
    skills.length > 0,
    !!(currentSalary || expectedSalary),
    !!(profilePhoto || resumeFilename),
  ]

  const firstIncomplete = sectionComplete.findIndex(c => !c)
  const [activeSection, setActiveSection] = useState(firstIncomplete === -1 ? 0 : firstIncomplete)

  const toggleSection = (idx) => setActiveSection(prev => prev === idx ? -1 : idx)

  const saveSection = (idx) => {
    saveUserProfile({
      profession: selectedProf, skills, experiences, qualifications,
      certifications, preferredJobType, preferredCity, openToRemote,
      currentSalary, expectedSalary, noticePeriod, openToRelocation,
    })
    if (idx < 6) setActiveSection(idx + 1)
    else setActiveSection(-1)
  }

  const deleteSection = (idx) => {
    if (!window.confirm('Clear all data in this section?')) return
    if (idx === 0) { setSelectedProf(''); saveUserProfile({ profession: '' }) }
    else if (idx === 1) { const e = [{ id: Date.now(), jobTitle: '', hospital: '', department: '', employmentType: 'Full-time', startDate: '', endDate: '', duties: '' }]; setExperiences(e); saveUserProfile({ experiences: e }) }
    else if (idx === 2) { const q = [{ id: Date.now(), degree: '', institution: '', specialisation: '', yearOfPassing: '' }]; setQualifications(q); saveUserProfile({ qualifications: q }) }
    else if (idx === 3) { const c = [{ id: Date.now(), licenseType: 'NMC', regNumber: '', issuingAuthority: '', validUntil: '', filename: null }]; setCertifications(c); saveUserProfile({ certifications: c }) }
    else if (idx === 4) { setSkills([]); setPreferredCity(''); saveUserProfile({ skills: [], preferredCity: '' }) }
    else if (idx === 5) { setCurrentSalary(''); setExpectedSalary(''); saveUserProfile({ currentSalary: '', expectedSalary: '' }) }
    else if (idx === 6) { setProfilePhoto(null); setResumeFilename(null); saveUserProfile({ photo: null, resumeFilename: null }) }
  }

  // Summary text per section (shown when collapsed)
  const sectionSummary = [
    selectedProf || 'Not selected',
    `${experiences.filter(e => e.jobTitle).length} experience(s) added`,
    qualifications[0]?.degree ? `${qualifications[0].degree}${qualifications[0].yearOfPassing ? ' · ' + qualifications[0].yearOfPassing : ''}` : 'Not added',
    `${certifications.filter(c => c.regNumber).length} license(s) added`,
    `${skills.length} skill${skills.length !== 1 ? 's' : ''} · ${preferredJobType}`,
    `₹${currentSalary || '—'} → ₹${expectedSalary || '—'}`,
    [profilePhoto && 'Photo', resumeFilename && 'Resume'].filter(Boolean).join(' & ') || 'Not uploaded',
  ]

  const sections = [
    { title: 'Profession', required: true },
    { title: 'Work Experience', required: false },
    { title: 'Education', required: false },
    { title: 'Certifications', required: false },
    { title: 'Skills & Preferences', required: false },
    { title: 'Salary', required: false },
    { title: 'Photo & Resume', required: false },
  ]

  const currentProfile = {
    profession: selectedProf, skills, experiences, qualifications,
    certifications, preferredJobType, preferredCity, openToRemote,
    currentSalary, expectedSalary, noticePeriod, openToRelocation,
    photo: profilePhoto, resumeFilename, resumeUrl,
  }

  // ─── Recompute sectionComplete reactively for render ────────────────────────
  const liveComplete = [
    !!selectedProf,
    !!(experiences[0]?.jobTitle),
    !!(qualifications[0]?.degree),
    !!(certifications[0]?.regNumber),
    skills.length > 0,
    !!(currentSalary || expectedSalary),
    !!(profilePhoto || resumeFilename),
  ]

  const completionPercentage = Math.round((liveComplete.filter(Boolean).length / 7) * 100)
  const completedCount = liveComplete.filter(Boolean).length

  if (loadingFromCloud) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-gray-400 gap-2">
        <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
        Loading your profile…
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 pb-20 font-sans">

      {/* Back button */}
      <button
        onClick={() => navigate('/services')}
        className="mb-6 inline-flex items-center gap-2 px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium text-sm"
      >
        ← Back to Services
      </button>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-serif text-[26px] text-gray-900 mb-1">Complete your profile</h1>
        <p className="text-sm text-gray-500">Tell us about your medical career. Only Profession is required — everything else improves your job matches.</p>
      </div>

      <div className="flex gap-7 items-start">

        {/* ── Left sticky nav (desktop) ─────────────────────────────────────── */}
        <aside className="hidden lg:block w-[240px] shrink-0">
          <div className="sticky top-6 bg-white border border-border rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Profile Sections</p>
            <nav className="space-y-1">
              {sections.map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSection(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm ${activeSection === idx
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {/* Circle indicator */}
                  {liveComplete[idx] ? (
                    <span className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  ) : activeSection === idx ? (
                    <span className="w-5 h-5 rounded-full border-2 border-teal-600 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                  <span className="flex-1 leading-tight">{sec.title}</span>
                  {idx === 0 && (
                    <span className="text-[9px] font-bold bg-pink-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">Req</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Completion bar */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Completion</span>
                <span className="font-semibold text-teal-700">{completionPercentage}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{completedCount} of 7 sections done</p>
            </div>

            {/* Save & Finish */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save & Finish'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </aside>

        {/* ── Mobile top nav strip ──────────────────────────────────────────── */}
        <div className="lg:hidden w-full mb-4 -mx-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((sec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSection(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${activeSection === idx
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : liveComplete[idx]
                      ? 'border-teal-200 bg-teal-50 text-teal-600'
                      : 'border-border bg-white text-gray-600'
                  }`}
              >
                {liveComplete[idx] && <span className="text-teal-600">✓</span>}
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right content area ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* 7-segment progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Profile completion — {completionPercentage}%</span>
              <span>{completedCount} of 7 sections</span>
            </div>
            <div className="flex gap-1.5 h-1.5">
              {liveComplete.map((done, i) => (
                <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${done ? 'bg-teal-600' : 'bg-border'}`} />
              ))}
            </div>
          </div>

          {/* Error banner */}
          {saveError && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">{saveError}</div>
          )}

          {/* Accordion sections */}
          {sections.map((sec, idx) => {
            const isOpen = activeSection === idx
            const isDone = liveComplete[idx]

            return (
              <div key={idx} className="bg-white border border-border rounded-2xl mb-4 overflow-hidden">

                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => toggleSection(idx)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* Step circle */}
                  {isDone ? (
                    <span className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  ) : (
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-sm font-bold ${isOpen ? 'border-teal-600 text-teal-600' : 'border-gray-300 text-gray-400'}`}>
                      {idx}
                    </span>
                  )}

                  {/* Title + summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[15px] font-semibold ${isOpen ? 'text-gray-900' : isDone ? 'text-gray-900' : 'text-gray-700'}`}>
                        {sec.title}
                      </span>
                      {idx === 0 && (
                        <span className="text-[9px] font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Required</span>
                      )}
                      {!idx === 0 && !sec.required && (
                        <span className="text-[9px] font-semibold bg-gray-50 text-gray-500 border border-border px-2 py-0.5 rounded-full uppercase tracking-wide">Optional</span>
                      )}
                    </div>
                    {!isOpen && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{sectionSummary[idx]}</p>
                    )}
                  </div>

                  {/* Edit button or chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isOpen && isDone && (
                      <span className="text-xs font-semibold text-teal-600 border border-teal-200 bg-teal-50 px-3 py-1 rounded-lg hover:bg-teal-100 transition-colors">
                        Edit
                      </span>
                    )}
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-border">

                    {/* ── Section 0: Profession ─────────────────────────── */}
                    {idx === 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                        {professions.map(prof => (
                          <button
                            key={prof.name}
                            type="button"
                            onClick={() => setSelectedProf(prof.name)}
                            className={`p-4 border-2 rounded-xl text-center transition-all ${selectedProf === prof.name
                                ? 'border-pink-600 bg-pink-50'
                                : 'border-border hover:border-pink-200 hover:bg-pink-50'
                              }`}
                          >
                            <div className="text-[26px] mb-1.5">{prof.icon}</div>
                            <div className="text-[13px] font-semibold text-gray-900">{prof.name}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ── Section 1: Work Experience ────────────────────── */}
                    {idx === 1 && (
                      <div className="mt-4">
                        {experiences.map((exp, index) => (
                          <div key={exp.id} className="bg-gray-50 border border-border rounded-xl p-[18px] mb-3 relative">
                            <div className="flex justify-between items-center mb-3.5">
                              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.05em]">Experience {index + 1}</span>
                              <button type="button" onClick={() => {
                                if (experiences.length === 1) { setExperiences([{ id: Date.now(), jobTitle: '', hospital: '', department: '', employmentType: 'Full-time', startDate: '', endDate: '', duties: '' }]) }
                                else removeExperience(exp.id)
                              }} className="text-xs text-gray-400 hover:text-red-500">🗑 Delete</button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <FormInput label="Job title / designation" value={exp.jobTitle} onChange={e => updateExperience(exp.id, 'jobTitle', e.target.value)} />
                              <FormInput label="Hospital / clinic name" value={exp.hospital} onChange={e => updateExperience(exp.id, 'hospital', e.target.value)} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <FormInput label="Department" value={exp.department} onChange={e => updateExperience(exp.id, 'department', e.target.value)} />
                              <FormSelect label="Employment type" value={exp.employmentType} onChange={e => updateExperience(exp.id, 'employmentType', e.target.value)} options={[{ label: 'Full-time', value: 'Full-time' }, { label: 'Part-time', value: 'Part-time' }, { label: 'Contract', value: 'Contract' }, { label: 'Locum', value: 'Locum' }]} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <FormInput label="Start date" type="month" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                              <FormInput label="End date" type="month" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} hint="Leave empty if current role" />
                            </div>
                            <div className="mb-0">
                              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Brief duties description</label>
                              <textarea className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-200/20 transition-all" rows="2" value={exp.duties} onChange={e => updateExperience(exp.id, 'duties', e.target.value)} />
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={addExperience} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">+ Add another experience</button>
                      </div>
                    )}

                    {/* ── Section 2: Education ──────────────────────────── */}
                    {idx === 2 && (
                      <div className="mt-4">
                        {qualifications.map((qual, index) => (
                          <div key={qual.id} className="bg-gray-50 border border-border rounded-xl p-[18px] mb-3 relative">
                            <div className="flex justify-between items-center mb-3.5">
                              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.05em]">Qualification {index + 1}</span>
                              <button type="button" onClick={() => {
                                if (qualifications.length === 1) { setQualifications([{ id: Date.now(), degree: '', institution: '', specialisation: '', yearOfPassing: '' }]) }
                                else removeQualification(qual.id)
                              }} className="text-xs text-gray-400 hover:text-red-500">🗑 Delete</button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <FormInput label="Degree / diploma" value={qual.degree} onChange={e => updateQualification(qual.id, 'degree', e.target.value)} />
                              <FormInput label="Institution / university" value={qual.institution} onChange={e => updateQualification(qual.id, 'institution', e.target.value)} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3 [&>div]:mb-0">
                              <FormInput label="Specialisation / stream" value={qual.specialisation} onChange={e => updateQualification(qual.id, 'specialisation', e.target.value)} />
                              <FormInput label="Year of passing" type="number" value={qual.yearOfPassing} onChange={e => updateQualification(qual.id, 'yearOfPassing', e.target.value)} min="1960" max="2030" />
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={addQualification} className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-600 py-2 hover:text-teal-700">+ Add another qualification</button>
                      </div>
                    )}

                    {/* ── Section 3: Certifications ─────────────────────── */}
                    {idx === 3 && (
                      <div className="mt-4">
                        {certifications.map((cert, index) => (
                          <div key={cert.id} className="bg-gray-50 border border-border rounded-xl p-[18px] mb-3 relative">
                            <div className="flex justify-between items-center mb-3.5">
                              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.05em]">License {index + 1}</span>
                              <button type="button" onClick={() => {
                                if (certifications.length === 1) { setCertifications([{ id: Date.now(), licenseType: 'NMC', regNumber: '', issuingAuthority: '', validUntil: '', filename: null }]) }
                                else removeCertification(cert.id)
                              }} className="text-xs text-gray-400 hover:text-red-500">🗑 Delete</button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <FormSelect label="License type" value={cert.licenseType} onChange={e => updateCertification(cert.id, 'licenseType', e.target.value)} options={[{ label: 'NMC Registration', value: 'NMC' }, { label: 'State Medical Council', value: 'State' }, { label: 'Indian Nursing Council', value: 'INC' }, { label: 'Other', value: 'Other' }]} />
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
                      </div>
                    )}

                    {/* ── Section 4: Skills & Preferences ──────────────── */}
                    {idx === 4 && (
                      <div className="mt-4">
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
                          <FormSelect label="Preferred job type" value={preferredJobType} onChange={e => setPreferredJobType(e.target.value)} options={[{ label: 'Full-time', value: 'Full-time' }, { label: 'Part-time', value: 'Part-time' }, { label: 'Contract / Locum', value: 'Contract' }, { label: 'Any', value: 'Any' }]} />
                          <FormInput label="Preferred city" value={preferredCity} onChange={e => setPreferredCity(e.target.value)} />
                        </div>
                        <div className="mb-0 max-w-[220px]">
                          <FormSelect label="Open to remote / teleconsultation?" value={openToRemote} onChange={e => setOpenToRemote(e.target.value)} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]} />
                        </div>
                      </div>
                    )}

                    {/* ── Section 5: Salary ─────────────────────────────── */}
                    {idx === 5 && (
                      <div className="mt-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <FormInput label="Current salary (₹ per year)" placeholder="e.g. 12,00,000" value={currentSalary} onChange={e => setCurrentSalary(e.target.value)} />
                          <FormInput label="Expected salary (₹ per year)" placeholder="e.g. 18,00,000" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 mt-1 [&>div]:mb-0">
                          <FormSelect label="Notice period" value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} options={[{ label: 'Immediate', value: '0' }, { label: '15 days', value: '15' }, { label: '30 days', value: '30' }, { label: '60 days', value: '60' }]} />
                          <FormSelect label="Open to relocation?" value={openToRelocation} onChange={e => setOpenToRelocation(e.target.value)} options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} />
                        </div>
                      </div>
                    )}

                    {/* ── Section 6: Photo & Resume ─────────────────────── */}
                    {idx === 6 && (
                      <div className="mt-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="relative">
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Profile photo</label>
                            <input type="file" accept="image/jpeg, image/png" className="hidden" ref={photoInputRef} onChange={handlePhotoUpload} />
                            <div onClick={() => photoInputRef.current?.click()} className={`border-2 ${profilePhoto ? 'border-solid border-teal-200 bg-teal-50' : 'border-dashed border-border hover:border-teal-200 hover:bg-teal-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}>
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
                          <div className="relative">
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Resume / CV</label>
                            <input type="file" accept="application/pdf" className="hidden" ref={resumeInputRef} onChange={handleResumeUpload} />
                            <div onClick={() => !resumeUploading && resumeInputRef.current?.click()} className={`border-2 ${resumeFilename ? 'border-solid border-teal-200 bg-teal-50' : 'border-dashed border-border hover:border-teal-200 hover:bg-teal-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}>
                              {resumeUploading ? (
                                <div className="flex flex-col items-center justify-center min-h-[105px]">
                                  <svg className="animate-spin w-8 h-8 text-teal-500 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                  <div className="text-sm text-teal-600 font-medium">Uploading to cloud…</div>
                                  <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate">{resumeFilename}</div>
                                </div>
                              ) : resumeFilename ? (
                                <div className="flex flex-col items-center justify-center min-h-[105px]">
                                  <div className="w-10 h-10 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center text-teal-600 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                  </div>
                                  <div className="text-sm font-semibold text-teal-700 max-w-[150px] truncate">{resumeFilename}</div>
                                  {resumeUrl && (
                                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline mt-1">View uploaded PDF ↗</a>
                                  )}
                                  {!resumeUrl && <div className="text-[11px] text-amber-500 mt-1">⚠ Not synced to cloud yet</div>}
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
                      </div>
                    )}

                    {/* Save & Continue button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => saveSection(idx)}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        {idx < 6 ? 'Save & Continue →' : 'Save & Finish ✓'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Mobile final submit */}
          <div className="lg:hidden mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save & Finish'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Skip for now →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
