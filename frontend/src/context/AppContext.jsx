import React, { createContext, useContext, useState, useEffect } from 'react';

import { getUserProfile } from '../hooks/useUserProfile';
import { auth } from '../firebase';

const AppContext = createContext();

const RECRUITER_JOBS_KEY = 'rm_recruiter_jobs'
const RECRUITER_APPS_KEY = 'rm_recruiter_applications'
const CANDIDATES_KEY = 'rm_candidates_pool'
const MY_APPS_KEY = 'rm_my_applications'
const SAVED_JOBS_KEY = 'rm_saved_jobs'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function loadRecruiterJobs() {
  try { return JSON.parse(localStorage.getItem(RECRUITER_JOBS_KEY) || '[]') } catch { return [] }
}
function loadRecruiterApps() {
  try { return JSON.parse(localStorage.getItem(RECRUITER_APPS_KEY) || '[]') } catch { return [] }
}
function loadCandidates() {
  try { return JSON.parse(localStorage.getItem(CANDIDATES_KEY) || '[]') } catch { return [] }
}
function loadMyApps() {
  try { return JSON.parse(localStorage.getItem(MY_APPS_KEY) || '[]') } catch { return [] }
}
function loadSavedJobs() {
  try { return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) || '[]') } catch { return [] }
}

export function registerAsCandidate(profile) {
  // Called when an employee completes their profile — adds them to the searchable pool
  if (!profile?.name) return
  const pool = loadCandidates()
  const existing = pool.findIndex(c => c.email === profile.email)
  const entry = {
    id: profile.email,
    name: profile.name,
    profession: profile.profession || 'Healthcare Professional',
    location: profile.city || profile.location || '',
    experience: profile.experiences?.[0]?.years
      ? `${profile.experiences[0].years} Years`
      : profile.experience || '',
    match: '—',
    photo: profile.photo || null,
    skills: profile.skills || [],
    expectedSalary: profile.expectedSalary || '',
    qualification: profile.qualifications?.[0]?.degree || '',
  }
  if (existing >= 0) {
    pool[existing] = entry
  } else {
    pool.push(entry)
  }
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(pool))
}

export function AppProvider({ children }) {
  const [browseJobs, setBrowseJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [recruiterJobs, setRecruiterJobs] = useState(loadRecruiterJobs);
  const [candidates, setCandidates] = useState(loadCandidates);
  const [applications, setApplications] = useState(loadRecruiterApps);
  const [myApplications, setMyApplications] = useState(loadMyApps);
  const [savedJobs, setSavedJobs] = useState(loadSavedJobs);

  const getStoredUser = () => {
    const profile = getUserProfile()
    if (profile?.name) {
      return { name: profile.name, role: profile.role || 'employee', email: profile.email || '' }
    }
    return { name: 'Guest', role: 'employee', email: '' }
  }

  const [currentUser, setCurrentUser] = useState(getStoredUser);

  // Fetch real jobs from Firestore on mount (public, no auth needed)
  useEffect(() => {
    fetch(`${API}/api/jobs`)
      .then(r => r.json())
      .then(({ jobs }) => {
        if (jobs?.length) setBrowseJobs(jobs)
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false))
  }, [])

  // Load recruiter's own jobs + their applications when auth is ready
  const loadRecruiterData = async () => {
    const token = await auth.currentUser?.getIdToken().catch(() => null)
    if (!token) return
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch(`${API}/api/jobs/mine`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/applications/for-recruiter`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const { jobs } = await jobsRes.json()
      const { applications: apps } = await appsRes.json()
      if (jobs?.length) {
        setRecruiterJobs(jobs)
        localStorage.setItem(RECRUITER_JOBS_KEY, JSON.stringify(jobs))
      }
      if (apps) {
        setApplications(apps)
        localStorage.setItem(RECRUITER_APPS_KEY, JSON.stringify(apps))
      }
    } catch {}
  }

  // Load employee's own applications
  const loadMyApplications = async () => {
    const token = await auth.currentUser?.getIdToken().catch(() => null)
    if (!token) return
    try {
      const res = await fetch(`${API}/api/applications/mine`, { headers: { Authorization: `Bearer ${token}` } })
      const { applications: apps } = await res.json()
      if (apps) {
        setMyApplications(apps)
        localStorage.setItem(MY_APPS_KEY, JSON.stringify(apps))
      }
    } catch {}
  }

  const addJob = (newJob) => {
    const job = {
      ...newJob,
      id: newJob.id || Date.now(),
      postedAt: newJob.postedAt || 'Just now',
      tags: newJob.tags || ['New'],
    };
    const updatedRecruiterJobs = [job, ...recruiterJobs.filter(j => j.id !== job.id)]
    setRecruiterJobs(updatedRecruiterJobs)
    localStorage.setItem(RECRUITER_JOBS_KEY, JSON.stringify(updatedRecruiterJobs))
    if (job.status !== 'draft') setBrowseJobs(prev => [job, ...prev.filter(j => j.id !== job.id)])
    return job.id;
  };

  const applyForJob = async (jobId, { applicantName, coverNote } = {}) => {
    const job = [...browseJobs, ...recruiterJobs].find(j => String(j.id) === String(jobId));
    if (!job) return false;

    const newApp = {
      id: Date.now(),
      jobId: String(jobId),
      jobTitle: job.title,
      hospital: job.hospital || '',
      applicantName: applicantName || currentUser.name,
      applicantEmail: currentUser.email || '',
      coverNote: coverNote || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      appliedAt: new Date().toISOString(),
      matchScore: '90%',
      status: 'New',
      candidateName: applicantName || currentUser.name,
      candidateRole: 'Applicant',
    };

    // Save to local state instantly
    const updatedMyApps = [newApp, ...myApplications]
    setMyApplications(updatedMyApps)
    localStorage.setItem(MY_APPS_KEY, JSON.stringify(updatedMyApps))

    // Also add to recruiter's applications view
    const updatedApps = [newApp, ...applications]
    setApplications(updatedApps)
    localStorage.setItem(RECRUITER_APPS_KEY, JSON.stringify(updatedApps))

    // Sync to Firestore
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        await fetch(`${API}/api/jobs/${jobId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ applicantName: newApp.applicantName, coverNote }),
        })
      }
    } catch (err) {
      console.warn('Application saved locally but cloud sync failed:', err)
    }
    return true;
  };

  const updateApplicationStatus = async (appId, newStatus) => {
    // Update local state instantly
    const update = apps => {
      const updated = apps.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      return updated
    }
    setApplications(apps => { const u = update(apps); localStorage.setItem(RECRUITER_APPS_KEY, JSON.stringify(u)); return u })
    setMyApplications(apps => { const u = update(apps); localStorage.setItem(MY_APPS_KEY, JSON.stringify(u)); return u })

    // Sync to Firestore
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token && typeof appId === 'string') {
        await fetch(`${API}/api/applications/${appId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        })
      }
    } catch {}
  };

  const removeJob = (jobId) => {
    const updated = recruiterJobs.filter(j => j.id !== jobId)
    setRecruiterJobs(updated)
    localStorage.setItem(RECRUITER_JOBS_KEY, JSON.stringify(updated))
    setBrowseJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const toggleJobStatus = (jobId) => {
    const updated = recruiterJobs.map(j =>
      j.id === jobId ? { ...j, paused: !j.paused } : j
    )
    setRecruiterJobs(updated)
    localStorage.setItem(RECRUITER_JOBS_KEY, JSON.stringify(updated))
  }

  const toggleSaveJob = (job) => {
    setSavedJobs(prev => {
      const exists = prev.some(j => String(j.id) === String(job.id))
      const updated = exists
        ? prev.filter(j => String(j.id) !== String(job.id))
        : [{ id: job.id, title: job.title, hospital: job.hospital, location: job.location, salary: job.salary, type: job.type }, ...prev]
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const isJobSaved = (jobId) => savedJobs.some(j => String(j.id) === String(jobId))

  const refreshCandidates = () => {
    setCandidates(loadCandidates())
  }

  const value = {
    jobs: recruiterJobs,
    browseJobs,
    jobsLoading,
    candidates,
    applications,
    myApplications,
    savedJobs,
    currentUser,
    addJob,
    removeJob,
    toggleJobStatus,
    applyForJob,
    updateApplicationStatus,
    toggleSaveJob,
    isJobSaved,
    refreshCandidates,
    setCurrentUser,
    loadRecruiterData,
    loadMyApplications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
