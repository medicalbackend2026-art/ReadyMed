import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormInput, FormSelect } from '../../components/FormElements'
import { getCompanyProfile, saveCompanyProfile, getCompanyCompletion } from '../../hooks/useUserProfile'
import { auth } from '../../firebase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loadingFromCloud, setLoadingFromCloud] = useState(!saved.companyName)

  // On mount: fetch from Firestore to restore data even if localStorage was cleared
  useEffect(() => {
    const fetchFromCloud = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) { setLoadingFromCloud(false); return }
        const res = await fetch(`${API}/api/companies/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) { setLoadingFromCloud(false); return }
        const { profile } = await res.json()
        if (profile) {
          saveCompanyProfile(profile)
          setOrgType(profile.orgType || '')
          setCompanyName(profile.companyName || '')
          setCity(profile.city || '')
          setWebsite(profile.website || '')
          setRegNumber(profile.regNumber || '')
          setDescription(profile.description || '')
          setNumBeds(profile.numBeds || '')
          setEstYear(profile.estYear || '')
          setSpecialities(profile.specialities || '')
          setContactName(profile.contactName || '')
          setContactDesignation(profile.contactDesignation || 'HR')
          setContactPhone(profile.contactPhone || '')
          setContactEmail(profile.contactEmail || '')
          setRegCert(profile.regCert || null)
        }
      } catch (err) {
        console.warn('Could not fetch company from cloud:', err)
      } finally {
        setLoadingFromCloud(false)
      }
    }
    fetchFromCloud()
  }, [])

  const logoRef = useRef(null)
  const certRef = useRef(null)

  const types = [
    { icon: '🏥', name: 'Hospital' },
    { icon: '🏢', name: 'Multi-speciality' },
    { icon: '🩺', name: 'Clinic' },
    { icon: '🔬', name: 'Diagnostic Lab' },
  ]

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => { setLogo(reader.result); saveCompanyProfile({ logo: reader.result }) }
      reader.readAsDataURL(file)
    }
  }

  const handleCertUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) { setRegCert(file.name); saveCompanyProfile({ regCert: file.name }) }
  }

  const handleRemoveLogo = (e) => { e.stopPropagation(); setLogo(null); saveCompanyProfile({ logo: null }) }
  const handleRemoveCert = (e) => { e.stopPropagation(); setRegCert(null); if (certRef.current) certRef.current.value = ''; saveCompanyProfile({ regCert: null }) }

  // Section completion
  const liveComplete = [
    !!(companyName && orgType),
    !!description,
    !!contactName,
    !!logo,
  ]

  const firstIncomplete = liveComplete.findIndex(c => !c)
  const [activeSection, setActiveSection] = useState(firstIncomplete === -1 ? 0 : firstIncomplete)

  const toggleSection = (idx) => setActiveSection(prev => prev === idx ? -1 : idx)

  const currentCompany = { companyName, orgType, city, website, regNumber, description, numBeds, estYear, specialities, contactName, contactDesignation, contactPhone, contactEmail, logo, regCert }
  const completionPct = getCompanyCompletion(currentCompany)
  const completedCount = liveComplete.filter(Boolean).length

  const sections = [
    { title: 'Company Basics', desc: 'Name, type and location' },
    { title: 'About', desc: 'Description & specialities' },
    { title: 'Contact Person', desc: 'Primary hiring contact' },
    { title: 'Logo & Verification', desc: 'Build trust with candidates' },
  ]

  const sectionSummary = [
    companyName ? `${companyName}${orgType ? ' · ' + orgType : ''}${city ? ' · ' + city : ''}` : 'Not filled',
    description ? description.slice(0, 60) + (description.length > 60 ? '…' : '') : 'Not filled',
    contactName ? `${contactName} · ${contactDesignation}${contactPhone ? ' · ' + contactPhone : ''}` : 'Not filled',
    [logo && 'Logo', regCert && 'Certificate'].filter(Boolean).join(' & ') || 'Not uploaded',
  ]

  const saveSection = (idx) => {
    saveCompanyProfile(currentCompany)
    if (idx < 3) setActiveSection(idx + 1)
    else setActiveSection(-1)
  }

  const handleFinish = async () => {
    setSaveError('')
    saveCompanyProfile(currentCompany)
    setSaving(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        const res = await fetch(`${API}/api/companies/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(currentCompany),
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed') }
      }
      navigate('/recruiter/services')
    } catch (err) {
      console.error('Company sync error:', err)
      setSaveError('Saved locally but could not sync to cloud. Continuing…')
      setTimeout(() => navigate('/recruiter/services'), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 pb-20 font-sans">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/recruiter/services')}
        className="mb-6 inline-flex items-center gap-2 px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium text-sm"
      >
        ← Back to Services
      </button>

      {loadingFromCloud && (
        <div className="flex items-center justify-center py-20 text-sm text-gray-400 gap-2">
          <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          Loading your company profile…
        </div>
      )}

      {!loadingFromCloud && (
        <div>
          <div className="mb-8">
            <h1 className="font-serif text-[26px] text-gray-900 mb-1">Set up your company profile</h1>
            <p className="text-sm text-gray-500">Complete these 4 steps to start posting jobs and searching candidates.</p>
          </div>

      <div className="flex gap-7 items-start">

        {/* ── Left sticky nav ─────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-[240px] shrink-0">
          <div className="sticky top-6 bg-white border border-border rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Setup Sections</p>
            <nav className="space-y-1">
              {sections.map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSection(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm ${
                    activeSection === idx ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {liveComplete[idx] ? (
                    <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  ) : activeSection === idx ? (
                    <span className="w-5 h-5 rounded-full border-2 border-blue-600 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                  <div className="flex-1 leading-tight">
                    <div>{sec.title}</div>
                    <div className="text-[11px] text-gray-400 font-normal">{sec.desc}</div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Completion</span>
                <span className="font-semibold text-blue-700">{completionPct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{completedCount} of 4 sections done</p>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save & Go to Dashboard'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 transition-colors">
              Skip for now →
            </button>
          </div>
        </aside>

        {/* ── Right content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ── Mobile top nav ────────────────────────────────────────────────── */}
          <div className="lg:hidden w-full mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map((sec, idx) => (
                <button key={idx} type="button" onClick={() => setActiveSection(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    activeSection === idx ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : liveComplete[idx] ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-border bg-white text-gray-600'
                  }`}>
                  {liveComplete[idx] && <span className="text-blue-600">✓</span>}
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Company profile — {completionPct}%</span>
              <span>{completedCount} of 4 sections</span>
            </div>
            <div className="flex gap-1.5 h-1.5">
              {liveComplete.map((done, i) => (
                <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${done ? 'bg-blue-600' : 'bg-border'}`} />
              ))}
            </div>
          </div>

          {saveError && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">{saveError}</div>
          )}

          {/* Accordion */}
          {sections.map((sec, idx) => {
            const isOpen = activeSection === idx
            const isDone = liveComplete[idx]
            return (
              <div key={idx} className="bg-white border border-border rounded-2xl mb-4 overflow-hidden">

                {/* Header */}
                <button type="button" onClick={() => toggleSection(idx)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                  {isDone ? (
                    <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  ) : (
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-sm font-bold ${isOpen ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                      {idx + 1}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[15px] font-semibold ${isOpen || isDone ? 'text-gray-900' : 'text-gray-700'}`}>{sec.title}</div>
                    {!isOpen && <p className="text-xs text-gray-500 mt-0.5 truncate">{sectionSummary[idx]}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isOpen && isDone && (
                      <span className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">Edit</span>
                    )}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {/* Body */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-border">

                    {/* Section 0: Company Basics */}
                    {idx === 0 && (
                      <div className="mt-4">
                        <FormInput label="Hospital / company name" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Apollo Hospitals" />
                        <div className="mb-[18px]">
                          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Organisation type</label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {types.map(t => (
                              <button key={t.name} type="button" onClick={() => setOrgType(t.name)}
                                className={`p-3.5 border-2 rounded-[10px] text-center transition-all text-[13px] font-medium ${
                                  orgType === t.name ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-border text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                                }`}>
                                <div className="text-2xl mb-1.5">{t.icon}</div>
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <FormInput label="City / location" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Delhi NCR" className="mb-0" />
                          <FormInput label="Website (optional)" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourhospital.com" className="mb-0" />
                        </div>
                        <div className="mt-3">
                          <FormInput label="Company registration number (optional)" value={regNumber} onChange={e => setRegNumber(e.target.value)} placeholder="For verified badge on your listings"
                            hint='Companies with registration numbers get a "Verified" badge visible to candidates.' className="mb-0" />
                        </div>
                      </div>
                    )}

                    {/* Section 1: About */}
                    {idx === 1 && (
                      <div className="mt-4">
                        <div className="mb-[18px]">
                          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company description</label>
                          <textarea className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-200/20 transition-all" rows="3"
                            value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your organisation, its mission, and what makes it a great place to work…" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <FormInput label="Number of beds" type="number" value={numBeds} onChange={e => setNumBeds(e.target.value)} placeholder="e.g. 500" className="mb-0" />
                          <FormInput label="Established year" type="number" value={estYear} onChange={e => setEstYear(e.target.value)} placeholder="e.g. 2001" className="mb-0" />
                        </div>
                        <div className="mt-3">
                          <FormInput label="Medical specialities offered" value={specialities} onChange={e => setSpecialities(e.target.value)}
                            placeholder="e.g. Cardiology, Orthopaedics, Neurology" hint="Comma-separated list" className="mb-0" />
                        </div>
                      </div>
                    )}

                    {/* Section 2: Contact Person */}
                    {idx === 2 && (
                      <div className="mt-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <FormInput label="Full name" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="e.g. Amit Khanna" className="mb-0" />
                          <FormSelect label="Designation" value={contactDesignation} onChange={e => setContactDesignation(e.target.value)}
                            options={[{label:'HR Manager',value:'HR'},{label:'Admin',value:'Admin'},{label:'Director',value:'Director'},{label:'Talent Acquisition Lead',value:'TA'}]}
                            className="mb-0" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 mt-3">
                          <FormInput label="Direct phone number" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+91 98765 12345" className="mb-0" />
                          <FormInput label="Direct email address" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="hr@yourhospital.com" className="mb-0" />
                        </div>
                      </div>
                    )}

                    {/* Section 3: Logo & Verification */}
                    {idx === 3 && (
                      <div className="mt-4">
                        <div className="grid sm:grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company logo</label>
                            <input type="file" accept="image/png, image/jpeg" className="hidden" ref={logoRef} onChange={handleLogoUpload} />
                            <div onClick={() => logoRef.current?.click()}
                              className={`border-2 ${logo ? 'border-solid border-blue-200 bg-blue-50' : 'border-dashed border-border hover:border-blue-200 hover:bg-blue-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}>
                              {logo ? (
                                <div className="flex flex-col items-center">
                                  <img src={logo} alt="logo" className="w-16 h-16 object-contain rounded-lg mb-2 border border-white shadow-sm" />
                                  <div className="text-sm font-semibold text-blue-700">Logo uploaded</div>
                                  <button type="button" onClick={handleRemoveLogo} className="text-xs text-red-500 hover:underline mt-1 absolute top-3 right-3">Remove</button>
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
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Registration certificate</label>
                            <input type="file" accept=".pdf, image/*" className="hidden" ref={certRef} onChange={handleCertUpload} />
                            <div onClick={() => certRef.current?.click()}
                              className={`border-2 ${regCert ? 'border-solid border-blue-200 bg-blue-50' : 'border-dashed border-border hover:border-blue-200 hover:bg-blue-50'} rounded-xl p-7 text-center cursor-pointer transition-colors relative`}>
                              {regCert ? (
                                <div className="flex flex-col items-center">
                                  <div className="text-sm font-semibold text-blue-700">{regCert}</div>
                                  <div className="text-xs text-blue-600 mt-1">✓ Attached</div>
                                  <button type="button" onClick={handleRemoveCert} className="text-xs text-red-500 hover:underline mt-1 absolute top-3 right-3">Remove</button>
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
                        <div className="bg-blue-50 border border-blue-100 rounded-[10px] p-3 text-[13px] text-blue-700 flex items-center gap-2">
                          <span className="shrink-0 bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">✓</span>
                          Uploading your registration certificate earns a "Verified" badge — candidates are 2× more likely to apply.
                        </div>
                      </div>
                    )}

                    {/* Save & Continue */}
                    <div className="mt-6 flex justify-end">
                      <button type="button" onClick={() => saveSection(idx)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                        {idx < 3 ? 'Save & Continue →' : 'Save & Finish ✓'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Mobile final submit */}
          <div className="lg:hidden mt-2 flex flex-col gap-2">
            <button type="button" onClick={handleFinish} disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
              {saving ? 'Saving…' : 'Save & Go to Dashboard'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
              Skip for now →
            </button>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  )
}
