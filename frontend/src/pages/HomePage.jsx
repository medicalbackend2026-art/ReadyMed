import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'

export function HomePage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    return () => document.documentElement.removeAttribute('data-theme')
  }, [isDark])

  // Scroll fade observer
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('opacity-100', 'translate-y-0')
          e.target.classList.remove('opacity-0', 'translate-y-7')
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })

    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="bg-page-bg text-page-text selection:bg-page-accent/30 font-sans transition-colors duration-400">

      {/* Theme Toggle (floating bottom right for demo purposes, original had it in nav) */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-xl bg-page-surface border border-page-border2 shadow-lg flex items-center justify-center text-page-text2 hover:text-page-text transition-colors"
      >
        {isDark ? '🌙' : '☀️'}
      </button>

      {/* Hero */}
      <section className="relative min-h-screen pt-[68px] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(126,184,122,0.07)_0%,transparent_70%),radial-gradient(ellipse_40%_60%_at_20%_80%,rgba(90,158,85,0.05)_0%,transparent_60%),radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(30,42,50,0.8)_0%,transparent_60%)] dark:opacity-100 opacity-0 transition-opacity" />

        {/* ECG line */}
        <div className="absolute bottom-[18%] left-0 right-0 opacity-12 pointer-events-none overflow-hidden text-page-accent">
          <svg className="w-[200%] animate-[ecg-scroll_8s_linear_infinite]" height="60" viewBox="0 0 1200 60" fill="none" preserveAspectRatio="none">
            <polyline
              points="0,30 80,30 100,30 110,8 120,52 130,15 140,45 150,30 230,30 310,30 320,8 330,52 340,15 350,45 360,30 440,30 520,30 530,8 540,52 550,15 560,45 570,30 650,30 730,30 740,8 750,52 760,15 770,45 780,30 860,30 940,30 950,8 960,52 970,15 980,45 990,30 1070,30 1150,30 1160,8 1170,52 1180,15 1190,45 1200,30"
              stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 max-w-[1240px] mx-auto px-10 w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-page-accent mb-6 fade-up opacity-0 translate-y-7 transition-all duration-700">
              <div className="w-1.5 h-1.5 rounded-full bg-page-accent animate-[pulse-dot_2s_ease-in-out_infinite]" />
              India's Medical Career Platform
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.05] tracking-tight text-page-text mb-6 fade-up opacity-0 translate-y-7 transition-all duration-700 delay-100">
              Where <em className="italic text-page-accent">healthcare</em><br />talent meets<br /><strong className="font-semibold">opportunity</strong>
            </h1>
            <p className="text-[17px] font-light leading-relaxed text-page-text2 max-w-[480px] mb-10 fade-up opacity-0 translate-y-7 transition-all duration-700 delay-200">
              ReadyMD connects Doctors, Nurses, and allied health professionals with hospitals, clinics, and healthcare organisations across India.
            </p>
            <div className="flex flex-wrap gap-3.5 mb-14 fade-up opacity-0 translate-y-7 transition-all duration-700 delay-300">
              <Link to="/login" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-page-accent hover:bg-[#5a9e55] hover:-translate-y-0.5 shadow-lg shadow-page-accent/20 transition-all">
                Find your next role
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-medium text-page-text bg-page-surface border border-page-border2 hover:border-page-accent hover:text-page-accent hover:-translate-y-0.5 transition-all">
                I'm hiring talent
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 fade-up opacity-0 translate-y-7 transition-all duration-700 delay-400">
              <div>
                <div className="font-serif text-[32px] font-semibold leading-none text-page-text tracking-tight mb-1">12<span className="text-page-accent">k+</span></div>
                <div className="text-xs text-page-text3 opacity-80">Professionals registered</div>
              </div>
              <div>
                <div className="font-serif text-[32px] font-semibold leading-none text-page-text tracking-tight mb-1">840<span className="text-page-accent">+</span></div>
                <div className="text-xs text-page-text3 opacity-80">Hospitals & clinics</div>
              </div>
              <div>
                <div className="font-serif text-[32px] font-semibold leading-none text-page-text tracking-tight mb-1">8</div>
                <div className="text-xs text-page-text3 opacity-80">Medical professions</div>
              </div>
            </div>
          </div>

          <div className="relative fade-up opacity-0 translate-y-7 transition-all duration-700 delay-200 hidden lg:block">
            <div className="bg-page-surface border border-page-border2 rounded-[20px] p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-page-accent to-[#e8c87a]" />

              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-page-accent bg-page-accent/10 border border-page-accent/20 px-2.5 py-1 rounded-full mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-current" /> Live opportunities
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-page-bg2 border border-page-border hover:border-page-border2 hover:translate-x-1 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-page-accent/15 text-page-accent flex items-center justify-center font-serif font-bold shrink-0">Dr</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-page-text mb-0.5 truncate">Senior Cardiologist</div>
                    <div className="text-xs text-page-text3">Apollo Hospitals, Mumbai</div>
                  </div>
                  <Badge variant="coral" className="bg-[#e07a5f]/15 text-[#e07a5f] border-transparent">Hot</Badge>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-page-bg2 border border-page-border hover:border-page-border2 hover:translate-x-1 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#e8c87a]/15 text-[#e8c87a] flex items-center justify-center font-serif font-bold shrink-0">RN</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-page-text mb-0.5 truncate">ICU Staff Nurse</div>
                    <div className="text-xs text-page-text3">Fortis Healthcare, Delhi</div>
                  </div>
                  <Badge variant="teal" className="bg-page-accent/15 text-page-accent border-transparent">New</Badge>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-page-border flex items-center justify-between">
                <div className="text-xs text-page-text3"><strong className="text-page-text2 font-medium">340+</strong> new jobs this week</div>
                <Link to="/jobs" className="text-[13px] font-medium text-page-accent flex items-center gap-1 hover:gap-2 transition-all">
                  View all <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="absolute -top-5 right-8 flex items-center gap-2 bg-page-surface border border-page-border2 rounded-xl py-2.5 px-3.5 text-xs font-medium text-page-text2 shadow-xl animate-[float-bob_4s_ease-in-out_infinite]">
              <span className="text-lg">✓</span> Profile verified
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <div className="border-y border-page-border py-16 px-6 md:px-12">
        <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center fade-up opacity-0 translate-y-7 transition-all duration-700">
            <div className="font-serif text-[44px] font-semibold tracking-tight text-page-text">12<span className="text-page-accent">k</span></div>
            <div className="text-[13px] text-page-text3 mt-1">Professionals registered</div>
          </div>
          <div className="text-center fade-up opacity-0 translate-y-7 transition-all duration-700 delay-100">
            <div className="font-serif text-[44px] font-semibold tracking-tight text-page-text">840<span className="text-page-accent">+</span></div>
            <div className="text-[13px] text-page-text3 mt-1">Partner hospitals</div>
          </div>
          <div className="text-center fade-up opacity-0 translate-y-7 transition-all duration-700 delay-200">
            <div className="font-serif text-[44px] font-semibold tracking-tight text-page-text">95<span className="text-page-accent">%</span></div>
            <div className="text-[13px] text-page-text3 mt-1">Placement success rate</div>
          </div>
          <div className="text-center fade-up opacity-0 translate-y-7 transition-all duration-700 delay-300">
            <div className="font-serif text-[44px] font-semibold tracking-tight text-page-text">18</div>
            <div className="text-[13px] text-page-text3 mt-1">Cities across India</div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-[100px] px-6 md:px-12" id="services">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-page-accent mb-4 fade-up">What we offer</div>
            <h2 className="font-serif text-[32px] md:text-[52px] font-normal leading-[1.1] tracking-[-1.5px] text-page-text mb-4 fade-up">
              Our services to help you <em className="italic text-page-accent">thrive</em><br />in healthcare
            </h2>
            <p className="text-[15px] text-page-text2 max-w-[520px] mx-auto fade-up">
              From jobs and staffing to software, compliance and clinic setup — everything you need in one place.
            </p>
          </div>

          {/* Category blocks */}
          {[
            {
              label: 'Operations',
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              dot: 'bg-blue-500',
              services: [
                { icon: '🏢', name: 'Clinic Space', desc: 'Rent or share a fully-equipped OPD room.' },
                { icon: '💼', name: 'Jobs & Hiring', desc: 'Apply for or post verified medical positions.' },
                { icon: '👨‍⚕️', name: 'Locum Doctor', desc: 'Qualified cover while you\'re on leave or training.' },
                { icon: '🏗️', name: 'Full Clinic Setup', desc: 'End-to-end clinic launch: NABH, licensing & IT.' },
                { icon: '📍', name: 'Location Finder', desc: 'Data-driven catchment area & competition mapping.' },
              ]
            },
            {
              label: 'Equipment',
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              border: 'border-amber-100',
              dot: 'bg-amber-500',
              services: [
                { icon: '🔬', name: 'Buy Equipment', desc: 'New & certified secondhand diagnostic equipment.' },
                { icon: '🪑', name: 'Clinic Furniture', desc: 'Exam tables, waiting room sets & reception counters.' },
                { icon: '💊', name: 'Pharmacy Stock', desc: 'Wholesale medicines at trade rates, direct delivery.' },
              ]
            },
            {
              label: 'Digital & Marketing',
              color: 'text-purple-600',
              bg: 'bg-purple-50',
              border: 'border-purple-100',
              dot: 'bg-purple-500',
              services: [
                { icon: '📱', name: 'Social Media', desc: 'Content, Google Reviews & online reputation management.' },
                { icon: '🌐', name: 'Clinic Website', desc: 'Professional site with SEO & online booking.' },
                { icon: '💬', name: 'WhatsApp Marketing', desc: 'Broadcast campaigns & appointment reminders via WhatsApp.' },
                { icon: '🎨', name: 'Clinic Branding', desc: 'Logo, signage, visiting cards & brand materials.' },
              ]
            },
            {
              label: 'Software Solutions',
              color: 'text-teal-700',
              bg: 'bg-teal-50',
              border: 'border-teal-100',
              dot: 'bg-teal-500',
              services: [
                { icon: '📋', name: 'EMR / EHR System', desc: 'Digital prescriptions & ABDM-ready patient records.' },
                { icon: '🧾', name: 'Billing & GST', desc: 'Automated invoicing, insurance claims & GST filing.' },
                { icon: '📅', name: 'Appointment Booking', desc: 'Online booking, WhatsApp reminders & queue management.' },
                { icon: '📹', name: 'Teleconsultation', desc: 'HD video OPD, e-prescriptions & payment collection.' },
                { icon: '🏥', name: 'Ayushman Software', desc: 'AB-PMJAY claim submission & beneficiary verification.' },
                { icon: '💊', name: 'Pharmacy Software', desc: 'Inventory, expiry alerts & barcode billing.' },
                { icon: '🧪', name: 'Lab / LIMS', desc: 'Auto PDF reports, NABL compliance & referral portal.' },
              ]
            },
            {
              label: 'Compliance & Legal',
              color: 'text-rose-600',
              bg: 'bg-rose-50',
              border: 'border-rose-100',
              dot: 'bg-rose-500',
              services: [
                { icon: '🏅', name: 'NABH Accreditation', desc: 'Full documentation & certification support.' },
                { icon: '📃', name: 'Drug License', desc: 'New application & annual renewal guidance.' },
                { icon: '📊', name: 'GST Registration', desc: 'Registration, filing & annual audit assistance.' },
                { icon: '⚖️', name: 'Legal & Contracts', desc: 'Employment contracts, rental deeds & NDAs.' },
              ]
            },
          ].map((cat, ci) => (
            <div key={cat.label} className="mb-10 fade-up" style={{ transitionDelay: `${ci * 80}ms` }}>
              {/* Category label */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-2 h-2 rounded-full ${cat.dot}`} />
                <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${cat.color}`}>{cat.label}</span>
                <div className="h-px flex-1 bg-page-border" />
              </div>
              {/* Service chips grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {cat.services.map((svc, si) => (
                  <Link
                    key={svc.name}
                    to="/login"
                    className={`group flex flex-col gap-2 p-4 rounded-2xl border ${cat.border} ${cat.bg} hover:scale-[1.03] hover:shadow-md transition-all duration-200 cursor-pointer`}
                    style={{ transitionDelay: `${si * 40}ms` }}
                  >
                    <div className="text-xl leading-none">{svc.icon}</div>
                    <div className={`text-[13px] font-semibold ${cat.color}`}>{svc.name}</div>
                    <div className="text-[11px] text-page-text3 leading-relaxed">{svc.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-10 fade-up">
            <Link to="/login" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-page-accent hover:bg-[#5a9e55] hover:-translate-y-0.5 shadow-lg shadow-page-accent/20 transition-all">
              Explore all services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Professions */}
      <section className="py-[80px] px-6 md:px-12 bg-page-bg2" id="professions">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-page-accent mb-4 fade-up">Who it's for</div>
          <h2 className="font-serif text-[32px] md:text-[52px] font-normal leading-[1.1] tracking-[-1.5px] text-page-text mb-4 fade-up">Built for <em className="italic text-page-accent">all</em> healthcare<br />professionals</h2>
          <div className="flex flex-wrap gap-3 mt-10">
            {['🩺 Doctors', '💉 Nurses', '💊 Pharmacists', '🔬 Lab Technicians', '🦴 Physiotherapists', '🩻 Radiologists', '🚑 Paramedics', '🏥 Hospital Admins'].map((prof, i) => (
              <div key={prof} className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-page-border2 bg-page-surface text-sm font-medium text-page-text2 hover:border-page-accent hover:text-page-text hover:-translate-y-0.5 transition-all cursor-default fade-up" style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="text-xl">{prof.split(' ')[0]}</span> {prof.split(' ').slice(1).join(' ')}
              </div>
            ))}
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-page-border2 border-dashed opacity-60 bg-transparent text-sm font-medium text-page-text2 fade-up delay-400">
              <span className="text-xl">➕</span> More coming soon
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[100px] px-6 md:px-12" id="how">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-page-accent mb-4 fade-up">Simple process</div>
            <h2 className="font-serif text-[32px] md:text-[52px] font-normal leading-[1.1] tracking-[-1.5px] text-page-text mb-4 fade-up">Up and running<br />in <em className="italic text-page-accent">minutes</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            <div className="p-8 rounded-[18px] border border-page-border bg-page-surface relative overflow-hidden fade-up">
              <div className="font-serif text-[80px] font-semibold text-page-border leading-[0.9] absolute top-5 right-5 hover:text-page-border2 transition-colors">01</div>
              <div className="w-12 h-12 mb-5 rounded-xl bg-page-accent/10 flex items-center justify-center text-page-accent shadow-sm border border-page-accent/20">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="text-[17px] font-semibold text-page-text mb-2">Create your profile</div>
              <p className="text-sm text-page-text2 leading-relaxed">Sign up, select your profession, and fill in your experience, education, certifications, and salary expectations in a guided 7-step flow.</p>
            </div>
            <div className="p-8 rounded-[18px] border border-page-border bg-page-surface relative overflow-hidden fade-up delay-100">
              <div className="font-serif text-[80px] font-semibold text-page-border leading-[0.9] absolute top-5 right-5 hover:text-page-border2 transition-colors">02</div>
              <div className="w-12 h-12 mb-5 rounded-xl bg-page-accent/10 flex items-center justify-center text-page-accent shadow-sm border border-page-accent/20">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="text-[17px] font-semibold text-page-text mb-2">Get matched instantly</div>
              <p className="text-sm text-page-text2 leading-relaxed">Our matching engine connects you with the most relevant jobs or candidates based on profession, skills, location, and salary — no noise, just signal.</p>
            </div>
            <div className="p-8 rounded-[18px] border border-page-border bg-page-surface relative overflow-hidden fade-up delay-200">
              <div className="font-serif text-[80px] font-semibold text-page-border leading-[0.9] absolute top-5 right-5 hover:text-page-border2 transition-colors">03</div>
              <div className="w-12 h-12 mb-5 rounded-xl bg-page-accent/10 flex items-center justify-center text-page-accent shadow-sm border border-page-accent/20">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="text-[17px] font-semibold text-page-text mb-2">Apply or hire</div>
              <p className="text-sm text-page-text2 leading-relaxed">Professionals apply in one tap. Recruiters post jobs and invite candidates directly. Track every step of the process from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pt-[100px] pb-12 px-6 md:px-12 bg-page-bg2">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-page-accent mb-4 fade-up">What they say</div>
          <h2 className="font-serif text-[32px] md:text-[52px] font-normal leading-[1.1] tracking-[-1.5px] text-page-text mb-4 fade-up">Trusted by professionals<br /><em className="italic text-page-accent">across India</em></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
            <div className="p-8 rounded-[18px] border border-page-border2 bg-page-surface fade-up">
              <p className="font-serif italic text-lg leading-[1.6] text-page-text mb-6">"I found my ICU position at Fortis within 10 days of signing up. The profile setup was thorough but quick, and the matches were genuinely relevant to my experience."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-page-accent/15 text-page-accent flex items-center justify-center font-serif font-semibold">PR</div>
                <div>
                  <div className="text-sm font-semibold text-page-text">Priya Rajan</div>
                  <div className="text-xs text-page-text3">ICU Staff Nurse, Delhi</div>
                </div>
                <span className="ml-auto text-[11px] font-medium px-2.5 py-1 rounded-full bg-page-accent/10 text-page-accent">Professional</span>
              </div>
            </div>
            <div className="p-8 rounded-[18px] border border-page-border2 bg-page-surface fade-up delay-100">
              <p className="font-serif italic text-lg leading-[1.6] text-page-text mb-6">"We filled 4 nursing vacancies in under 3 weeks. The candidate search filters are excellent — we could shortlist by specialisation and salary range precisely."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e8c87a]/15 text-[#b8880a] flex items-center justify-center font-serif font-semibold">AM</div>
                <div>
                  <div className="text-sm font-semibold text-page-text">Arjun Mehta</div>
                  <div className="text-xs text-page-text3">HR Manager, Manipal Hospitals</div>
                </div>
                <span className="ml-auto text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#e8c87a]/10 text-[#b8880a]">Recruiter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
