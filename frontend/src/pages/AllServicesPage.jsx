import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProfile, getCompanyProfile, saveUserProfile, getProfileCompletion, getCompanyCompletion } from '../hooks/useUserProfile'
import { useAppContext } from '../context/AppContext'

const SERVICE_CATEGORIES = [
  {
    id: 'operations',
    name: 'Operations',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    services: [
      {
        id: 'clinic-space',
        name: 'Clinic Space',
        description: 'Rent or share a fully-equipped OPD, consultation or procedure room. India\'s first doctor-to-doctor clinic sharing network.',
        svg: (
          <div className="w-12 h-12 bg-pink-100/50 rounded-2xl flex items-center justify-center text-pink-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 9v1m0 4v1m0 4v1M9 9h1m-1 4h1m-1 4h1" />
            </svg>
          </div>
        ),
        buttonText: 'Find / List space →',
        tags: ['100+ RPMD', 'Fixed rent + profit share', '18 cities'],
        colSpan: 2,
        spaces: [
          { loc: 'Mumbai - Bandra West', price: '₹18,000/mo · Morning slot' },
          { loc: 'Bengaluru - Koramangala', price: '₹25,000/mo · Full day' },
          { loc: 'Hyderabad - Jubilee Hills', price: 'Profit sharing available' }
        ]
      },
      {
        id: 'jobs-and-hiring',
        name: 'Jobs & Hiring',
        description: 'Apply for verified medical positions or hire staff (nurses, tech, receptionists) — matched within 24 hrs.',
        svg: (
          <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        ),
        buttonText: 'Explore Jobs / Hire →'
      },
      {
        id: 'locum-doctor',
        name: 'Locum Doctor',
        description: 'Qualified OPD cover while you\'re on leave, CME or training. Short and long-term available.',
        svg: (
          <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'full-clinic-setup',
        name: 'Full Clinic Setup',
        description: 'End-to-end clinic launch: NABH, interior, licensing and IT infrastructure managed for you.',
        svg: (
          <div className="w-12 h-12 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'location-finder',
        name: 'Location Finder',
        description: 'Data-driven analysis of ideal clinic catchment area, footfall patterns and competition mapping.',
        svg: (
          <div className="w-12 h-12 bg-purple-100/50 rounded-2xl flex items-center justify-center text-purple-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      }
    ]
  },
  {
    id: 'equipment',
    name: 'Equipment',
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-600',
    services: [
      {
        id: 'buy-equipment',
        name: 'Buy Equipment',
        description: 'New and certified secondhand diagnostic and surgical equipment. EMI available, delivered and installed at your clinic.',
        svg: (
          <div className="w-12 h-12 bg-cyan-100/50 rounded-2xl flex items-center justify-center text-cyan-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'clinic-furniture',
        name: 'Clinic Furniture',
        description: 'Exam tables, waiting room sets, reception counters and patient seating. Ready-to-ship collections for Indian clinics.',
        svg: (
          <div className="w-12 h-12 bg-orange-100/50 rounded-2xl flex items-center justify-center text-orange-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'pharmacy-stock',
        name: 'Pharmacy Stock',
        description: 'Wholesale medicines, consumables and surgical supplies at trade rates. Direct from distributors to your door.',
        svg: (
          <div className="w-12 h-12 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      }
    ]
  },
  {
    id: 'digital',
    name: 'Digital & Marketing',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-purple-500 to-pink-600',
    services: [
      {
        id: 'social-media',
        name: 'Social Media Management',
        description: 'Content creation, posting, Google Reviews management and online reputation building for your clinic.',
        svg: (
          <div className="w-12 h-12 bg-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'clinic-website',
        name: 'Clinic Website',
        description: 'Professional website with online appointment booking, Google SEO and patient reviews built-in.',
        svg: (
          <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'whatsapp-marketing',
        name: 'WhatsApp Marketing',
        description: 'Broadcast messages, appointment reminders and patient follow-up campaigns via WhatsApp Business API.',
        svg: (
          <div className="w-12 h-12 bg-green-100/50 rounded-2xl flex items-center justify-center text-green-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'clinic-branding',
        name: 'Clinic Branding',
        description: 'Logo, outdoor signage, visiting cards and all patient-facing print and digital brand materials.',
        svg: (
          <div className="w-12 h-12 bg-pink-100/50 rounded-2xl flex items-center justify-center text-pink-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      }
    ]
  },
  {
    id: 'software',
    name: 'Software Solutions',
    icon: (
      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-600',
    services: [
      {
        id: 'emr-ehr',
        name: 'EMR / EHR System',
        description: 'Digital prescriptions, ABDM-ready patient records and lab integrations.',
        svg: (
          <div className="w-12 h-12 bg-teal-100/50 rounded-2xl flex items-center justify-center text-teal-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        ),
        badge: 'From ₹999/mo',
        vendors: ['HealthPlix', 'Practo Ray', 'drCure'],
        buttonText: 'Compare vendors →'
      },
      {
        id: 'billing-gst',
        name: 'Billing & GST Software',
        description: 'Automated invoicing, insurance claims and GST filing for clinics.',
        svg: (
          <div className="w-12 h-12 bg-emerald-100/50 rounded-2xl flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
        ),
        badge: 'From ₹499/mo',
        vendors: ['Vyapar', 'ClearTax', 'Marg ERP'],
        buttonText: 'Compare vendors →'
      },
      {
        id: 'appointment',
        name: 'Appointment Booking',
        description: 'Online booking, WhatsApp reminders and queue management for your OPD.',
        svg: (
          <div className="w-12 h-12 bg-sky-100/50 rounded-2xl flex items-center justify-center text-sky-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ),
        badge: 'From ₹299/mo',
        vendors: ['Practo', 'Qikwell', 'BookMyDoc'],
        buttonText: 'Compare vendors →'
      },
      {
        id: 'telecom',
        name: 'Teleconsultation',
        description: 'HD video OPD, e-prescriptions and payment collection from anywhere in India.',
        svg: (
          <div className="w-12 h-12 bg-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        ),
        badge: 'From ₹799/mo',
        vendors: ['mFine', 'Practo Online', 'Docsapp'],
        buttonText: 'Compare vendors →'
      },
      {
        id: 'ayushman',
        name: 'Ayushman Bharat Software',
        description: 'AB-PMJAY claim submission, beneficiary verification, pre-auth and rejection tracking. NHA approved.',
        svg: (
          <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        ),
        badge: 'From ₹1,499/mo',
        vendors: ['Health API', 'eSanjeevani', 'NHA Portal'],
        buttonText: 'Compare vendors →'
      },
      {
        id: 'pharmacy-soft',
        name: 'Pharmacy Software',
        description: 'Inventory management, expiry alerts, barcode billing and automatic reorder triggers.',
        svg: (
          <div className="w-12 h-12 bg-rose-100/50 rounded-2xl flex items-center justify-center text-rose-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
        ),
        badge: 'From ₹888/mo',
        vendors: ['Marg ERP', 'Medico', 'Retailio'],
        buttonText: 'Compare vendors →'
      },
      {
        id: 'lab-lims',
        name: 'Lab / LIMS Software',
        description: 'Test catalogue, auto PDF reports, doctor referral portal and NABL compliance built in.',
        svg: (
          <div className="w-12 h-12 bg-purple-100/50 rounded-2xl flex items-center justify-center text-purple-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        ),
        badge: 'From ₹999/mo',
        vendors: ['LabSoft', 'SoftClinic', 'DrCare'],
        buttonText: 'Compare vendors →'
      }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance & Legal',
    icon: (
      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    color: 'from-red-500 to-rose-600',
    services: [
      {
        id: 'nabh-accreditation',
        name: 'NABH Accreditation',
        description: 'Full documentation, internal audit preparation and certification support from accreditation experts.',
        svg: (
          <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'drug-license',
        name: 'Drug License',
        description: 'New drug license application, annual renewal and regulatory guidance for your state.',
        svg: (
          <div className="w-12 h-12 bg-rose-100/50 rounded-2xl flex items-center justify-center text-rose-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'gst-registration',
        name: 'GST Registration',
        description: 'GST registration for new clinics, quarterly filing support and annual audit assistance.',
        svg: (
          <div className="w-12 h-12 bg-sky-100/50 rounded-2xl flex items-center justify-center text-sky-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      },
      {
        id: 'legal-contracts',
        name: 'Legal & Contracts',
        description: 'Doctor employment contracts, rental deeds, NDAs and partnership agreements by healthcare lawyers.',
        svg: (
          <div className="w-12 h-12 bg-gray-100/50 rounded-2xl flex items-center justify-center text-gray-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        ),
        buttonText: 'Book now →'
      }
    ]
  }
]

export function AllServicesPage() {
  const navigate = useNavigate()
  const userProfile = getUserProfile()
  const companyProfile = getCompanyProfile()
  const isEmployer = userProfile?.role === 'recruiter' || !!companyProfile?.companyName
  const [activeCategory, setActiveCategory] = useState('all')
  const [showHiringModal, setShowHiringModal] = useState(false)
  const [showLocumModal, setShowLocumModal] = useState(false)
  const { currentUser, setCurrentUser } = useAppContext()

  const SERVICE_ROUTES = {
    'jobs-and-hiring': { employer: '/recruiter/company-setup', professional: '/profile-setup' },
    'locum-doctor': { employer: '/recruiter/company-setup', professional: '/profile-setup' },
    'clinic-space': { employer: '#coming-soon', professional: '#coming-soon' },
    'full-clinic-setup': { employer: '#coming-soon', professional: '#coming-soon' },
    'location-finder': { employer: '#coming-soon', professional: '#coming-soon' },
    'buy-equipment': { employer: '#coming-soon', professional: '#coming-soon' },
    'clinic-furniture': { employer: '#coming-soon', professional: '#coming-soon' },
    'pharmacy-stock': { employer: '#coming-soon', professional: '#coming-soon' },
    'social-media': { employer: '#coming-soon', professional: '#coming-soon' },
    'clinic-website': { employer: '#coming-soon', professional: '#coming-soon' },
    'whatsapp-marketing': { employer: '#coming-soon', professional: '#coming-soon' },
    'clinic-branding': { employer: '#coming-soon', professional: '#coming-soon' },
    'emr-ehr': { employer: '#coming-soon', professional: '#coming-soon' },
    'billing-gst': { employer: '#coming-soon', professional: '#coming-soon' },
    'appointment': { employer: '#coming-soon', professional: '#coming-soon' },
    'telecom': { employer: '#coming-soon', professional: '#coming-soon' },
    'ayushman': { employer: '#coming-soon', professional: '#coming-soon' },
    'pharmacy-soft': { employer: '#coming-soon', professional: '#coming-soon' },
    'lab-lims': { employer: '#coming-soon', professional: '#coming-soon' },
    'nabh-accreditation': { employer: '#coming-soon', professional: '#coming-soon' },
    'drug-license': { employer: '#coming-soon', professional: '#coming-soon' },
    'gst-registration': { employer: '#coming-soon', professional: '#coming-soon' },
    'legal-contracts': { employer: '#coming-soon', professional: '#coming-soon' }
  }

  const handleServiceClick = (serviceId) => {
    if (serviceId === 'jobs-and-hiring') {
      setShowHiringModal(true)
      return
    }

    if (serviceId === 'locum-doctor') {
      setShowLocumModal(true)
      return
    }

    const route = SERVICE_ROUTES[serviceId]
    if (!route) return

    const targetRoute = isEmployer ? route.employer : route.professional
    if (!targetRoute) {
      alert('This service is not available for your role yet.')
      return
    }

    if (targetRoute.startsWith('#')) {
      alert('This service is coming soon! Stay tuned.')
      return
    }

    navigate(targetRoute)
  }

  const scrollToCategory = (id) => {
    setActiveCategory(id)
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const allServicesCount = 22

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex text-[#1e293b]">
      {/* Sidebar */}
      <div className="w-64 bg-[#f8f9fa] border-r border-gray-200/60 p-6 sticky top-0 h-screen overflow-y-auto shrink-0 flex flex-col justify-between hidden md:flex z-20">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Services</div>

          <button
            onClick={() => scrollToCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-[13px] font-semibold mb-6 ${activeCategory === 'all'
                ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200/60'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span>All services</span>
            </div>
            <span className="text-[10px] bg-white text-gray-700 px-2 py-0.5 rounded-full font-bold shadow-xs border border-gray-100">
              {allServicesCount}
            </span>
          </button>

          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Categories</div>

          <div className="space-y-1.5">
            {SERVICE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium ${activeCategory === category.id
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200/60'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${activeCategory === category.id ? 'bg-gray-50' : ''}`}>
                    {category.icon}
                  </div>
                  <span>{category.name}</span>
                </div>
                {activeCategory === category.id && (
                  <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                    {category.services.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User profile section if logged in */}
        {(userProfile?.name || companyProfile?.companyName) ? (
          <div className="mt-8 pt-6 border-t border-gray-200/60">
            <div className="text-[13px] font-bold text-gray-900">{userProfile?.name || companyProfile?.companyName}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{userProfile?.profession || userProfile?.specialty || (isEmployer ? 'Healthcare Facility' : 'Healthcare Professional')}</div>
            <div className="text-[9px] text-teal-700 mt-2 uppercase tracking-widest font-bold bg-teal-50 inline-block px-2 py-1 rounded-md border border-teal-100/50">
              {isEmployer ? 'Employer Account' : 'Professional Account'}
            </div>
            <button 
              onClick={() => navigate('/role-selection?from=dashboard')}
              className="mt-4 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-medium block"
            >
              Change Profession / Role
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 lg:p-14 overflow-y-auto h-screen relative">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col xl:flex-row gap-8 xl:gap-16 mb-12 items-start">
            <div className="xl:w-[55%] pt-4">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-600 shadow-[0_0_12px_rgba(13,148,136,0.6)]"></span>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-[0.2em]">ReadyMD Platform</span>
              </div>

              <h1 className="text-[2.75rem] md:text-[3.25rem] font-serif text-[#0f172a] leading-[1.1] mb-6 tracking-tight">
                Everything to run &<br />grow your clinic
              </h1>
              <p className="text-[16px] text-gray-500 max-w-xl leading-relaxed">
                22 services across operations, equipment, digital, software and compliance — purpose-built for Indian doctors.
              </p>
            </div>

            <div className="xl:w-[45%] w-full grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-4 mt-6 xl:mt-0">
              <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200/60 shadow-xs flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="text-3xl font-serif font-medium text-gray-800">22<span className="text-gray-300 text-xl">+</span></div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">Services</div>
              </div>
              <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200/60 shadow-xs flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="text-3xl font-serif font-medium text-gray-800">₹0</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">Platform fees</div>
              </div>
              <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200/60 shadow-xs flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="text-3xl font-serif font-medium text-gray-800">48<span className="text-gray-400 text-xl font-sans">h</span></div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">Fulfillment</div>
              </div>
              <div className="bg-white rounded-[1.25rem] p-5 border border-gray-200/60 shadow-xs flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="text-3xl font-serif font-medium text-gray-800">18</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">Cities</div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-gradient-to-br from-[#1b3a32] to-[#122722] text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-20 shadow-xl shadow-teal-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 flex gap-5 items-center w-full">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 hidden sm:flex items-center justify-center shrink-0 backdrop-blur-md">
                <svg className="w-7 h-7 text-teal-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[20px] md:text-[22px] font-serif text-white mb-1.5 font-medium tracking-wide">
                  Not sure what you need? Ask our <span className="text-amber-200 italic">AI Advisor</span>
                </div>
                <div className="text-[13px] md:text-[14px] text-teal-100/80 font-light leading-relaxed">
                  Tell us your specialty & clinic size — we'll build your perfect service stack with exact pricing in 60 seconds.
                </div>
              </div>
              <button onClick={() => alert('AI Advisor coming soon')} className="shrink-0 rounded-full bg-white text-[#1b3a32] px-7 py-3 text-[13px] font-bold hover:bg-amber-50 hover:text-[#122722] transition-colors shadow-lg shadow-black/10 z-10 hidden md:block">
                Ask AI Advisor →
              </button>
            </div>
            <button onClick={() => alert('AI Advisor coming soon')} className="w-full shrink-0 rounded-full bg-white text-[#1b3a32] px-7 py-3 text-[13px] font-bold hover:bg-amber-50 transition z-10 md:hidden shadow-lg shadow-black/10">
              Ask AI Advisor →
            </button>
          </div>

          <div className="space-y-24 pb-24">
            {SERVICE_CATEGORIES.map((category) => (
              <div key={category.id} id={`category-${category.id}`} className="scroll-mt-12">
                <div className="flex items-center gap-5 mb-8">
                  <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-200/60 shadow-xs">
                    <div className="p-1 rounded-lg bg-gray-50 border border-gray-100">
                      {category.icon}
                    </div>
                    <h2 className="text-[19px] font-serif font-medium text-gray-900">{category.name}</h2>
                  </div>
                  <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1"></div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold bg-gray-100 px-3 py-1.5 rounded-full">
                    {category.services.length} services
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {category.services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service.id)}
                      className={`bg-white border border-gray-200/60 rounded-[1.5rem] p-7 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 cursor-pointer group flex flex-col ${service.colSpan === 2 ? 'md:col-span-2 xl:col-span-2' : ''}`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          {service.svg}

                          {service.badge && (
                            <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100/50 px-3 py-1 rounded-full whitespace-nowrap shadow-xs shadow-amber-900/5">
                              {service.badge}
                            </div>
                          )}
                        </div>

                        <h3 className="text-[17px] font-serif text-gray-900 mb-2.5 font-medium">{service.name}</h3>

                        <div className={`flex ${service.spaces ? 'flex-col lg:flex-row gap-8' : 'flex-col'} flex-1`}>
                          <div className={`${service.spaces ? 'lg:w-[45%]' : 'w-full'} flex flex-col h-full`}>
                            <p className="text-[14px] text-gray-500 leading-relaxed mb-6 font-light">
                              {service.description}
                            </p>

                            {service.tags && (
                              <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                {service.tags.map((tag, i) => (
                                  <span key={i} className="text-[10px] font-semibold px-2.5 py-1 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {service.spaces && (
                            <div className="lg:w-[55%] flex flex-col gap-2.5 border-t lg:border-t-0 pt-6 lg:pt-0 lg:border-l border-gray-100 lg:pl-8">
                              {service.spaces.map((space, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-[#faf9f6]/80 hover:bg-white rounded-[1rem] transition-colors border border-transparent hover:border-gray-100 shadow-sm shadow-transparent hover:shadow-black/5">
                                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                  <div className="pt-0.5">
                                    <div className="text-[12px] font-bold text-gray-800">{space.loc}</div>
                                    <div className="text-[11px] text-gray-500 mt-1 font-medium">{space.price}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {service.vendors && (
                          <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-gray-100 mb-4">
                            {service.vendors.map((vendor, i) => (
                              <span key={i} className="text-[10px] font-semibold px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg bg-gray-50/50 hover:bg-white transition-colors cursor-default">
                                {vendor}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto pt-4 flex items-center text-[12px] font-bold text-teal-700/80 group-hover:text-amber-600 transition-colors uppercase tracking-wide">
                          {service.buttonText}
                          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Locum Selection Modal */}
      {showLocumModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowLocumModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              ✕
            </button>

            <h2 className="text-2xl font-serif text-gray-900 mb-2 font-medium text-center">Locum</h2>
            <p className="text-sm text-gray-500 text-center mb-8">Locum is available only for Doctors and Nurses.</p>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const updatedProfile = saveUserProfile({ role: 'employee' })
                  setCurrentUser({ ...currentUser, role: 'employee' })
                  setShowLocumModal(false)

                  const prof = String(updatedProfile?.profession || updatedProfile?.healthcareRole || '').toLowerCase()
                  const allowed = prof.includes('doctor') || prof.includes('nurse')
                  if (!allowed) {
                    alert('Locum is currently available only for Doctors and Nurses. Please select Doctor or Nurse.')
                    setTimeout(() => navigate('/role-selection?from=locum'), 0)
                    return
                  }

                  const pct = getProfileCompletion(updatedProfile)
                  const locumOk =
                    !!updatedProfile?.locumAvailability ||
                    ((Array.isArray(updatedProfile?.locumDays) && updatedProfile.locumDays.length > 0) && !!(updatedProfile?.locumHoursPerDay || updatedProfile?.locumHoursPerWeek) && !!updatedProfile?.locumShiftPreference)
                  const next = pct >= 75 && locumOk ? '/locum/jobs' : '/profile-setup'

                  setTimeout(
                    () =>
                      navigate(
                        next,
                        next === '/profile-setup'
                          ? { state: { redirectTo: '/locum/jobs', mode: 'locum' } }
                          : undefined
                      ),
                    0
                  )
                }}
                className="group p-6 bg-white border-2 border-gray-100 hover:border-teal-500 rounded-xl text-left transition-all hover:bg-teal-50/50 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 bg-teal-100/50 rounded-full flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform text-2xl">
                  👨‍⚕️
                </div>
                <div className="font-semibold text-gray-900 mb-1">Find Locum Work</div>
                <div className="text-xs text-gray-500 text-center">I am a Doctor/Nurse looking for locum shifts</div>
              </button>

              <button
                onClick={() => {
                  saveUserProfile({ role: 'recruiter' })
                  setCurrentUser({ ...currentUser, role: 'recruiter' })
                  setShowLocumModal(false)

                  const company = getCompanyProfile() || {}
                  const pct = getCompanyCompletion(company)
                  const next = pct >= 75 ? '/recruiter/locum/post' : '/recruiter/company-setup'

                  setTimeout(() => navigate(next, next === '/recruiter/company-setup' ? { state: { redirectTo: '/recruiter/locum/post' } } : undefined), 0)
                }}
                className="group p-6 bg-white border-2 border-gray-100 hover:border-amber-500 rounded-xl text-left transition-all hover:bg-amber-50/50 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 bg-amber-100/50 rounded-full flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform text-2xl">
                  🏥
                </div>
                <div className="font-semibold text-gray-900 mb-1">Hire Locum</div>
                <div className="text-xs text-gray-500 text-center">Post locum shifts for Doctors/Nurses</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hiring Selection Modal */}
      {showHiringModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowHiringModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              ✕
            </button>

            <h2 className="text-2xl font-serif text-gray-900 mb-2 font-medium text-center">Jobs & Hiring</h2>
            <p className="text-sm text-gray-500 text-center mb-8">What would you like to do on ReadyMD today?</p>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const updatedProfile = saveUserProfile({ role: 'employee' })
                  setCurrentUser({ ...currentUser, role: 'employee' })
                  setShowHiringModal(false)

                  const pct = getProfileCompletion(updatedProfile)
                  const next = pct >= 75 ? '/dashboard' : '/profile-setup'

                  setTimeout(() => navigate(next, next === '/profile-setup' ? { state: { redirectTo: '/dashboard' } } : undefined), 0)
                }}
                className="group p-6 bg-white border-2 border-gray-100 hover:border-teal-500 rounded-xl text-left transition-all hover:bg-teal-50/50 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 bg-teal-100/50 rounded-full flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform text-2xl">
                  👨‍⚕️
                </div>
                <div className="font-semibold text-gray-900 mb-1">Apply for Jobs</div>
                <div className="text-xs text-gray-500 text-center">I am a healthcare professional looking for work</div>
              </button>

              <button
                onClick={() => {
                  saveUserProfile({ role: 'recruiter' })
                  setCurrentUser({ ...currentUser, role: 'recruiter' })
                  setShowHiringModal(false)

                  const company = getCompanyProfile() || {}
                  const pct = getCompanyCompletion(company)
                  const next = pct >= 75 ? '/recruiter/dashboard' : '/recruiter/company-setup'

                  setTimeout(() => navigate(next, next === '/recruiter/company-setup' ? { state: { redirectTo: '/recruiter/dashboard' } } : undefined), 0)
                }}
                className="group p-6 bg-white border-2 border-gray-100 hover:border-amber-500 rounded-xl text-left transition-all hover:bg-amber-50/50 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 bg-amber-100/50 rounded-full flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform text-2xl">
                  🏥
                </div>
                <div className="font-semibold text-gray-900 mb-1">Hire Staff</div>
                <div className="text-xs text-gray-500 text-center">I want to hire medical staff for my clinic/hospital</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
