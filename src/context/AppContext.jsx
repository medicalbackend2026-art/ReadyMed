import React, { createContext, useContext, useState } from 'react';
import { initialJobs } from '../data/mockData';
import { getUserProfile } from '../hooks/useUserProfile';

const AppContext = createContext();

const RECRUITER_JOBS_KEY = 'rm_recruiter_jobs'
const RECRUITER_APPS_KEY = 'rm_recruiter_applications'
const CANDIDATES_KEY = 'rm_candidates_pool'

function loadRecruiterJobs() {
  try {
    const raw = localStorage.getItem(RECRUITER_JOBS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadRecruiterApps() {
  try {
    const raw = localStorage.getItem(RECRUITER_APPS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadCandidates() {
  try {
    const raw = localStorage.getItem(CANDIDATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
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
  const [browseJobs, setBrowseJobs] = useState(initialJobs);
  const [recruiterJobs, setRecruiterJobs] = useState(loadRecruiterJobs);
  const [candidates, setCandidates] = useState(loadCandidates);
  const [applications, setApplications] = useState(loadRecruiterApps);

  const getStoredUser = () => {
    const profile = getUserProfile()
    if (profile?.name) {
      return { name: profile.name, role: profile.role || 'employee', email: profile.email || '' }
    }
    return { name: 'Guest', role: 'employee', email: '' }
  }

  const [currentUser, setCurrentUser] = useState(getStoredUser);

  const addJob = (newJob) => {
    const job = {
      ...newJob,
      id: Date.now(),
      postedAt: 'Just now',
      tags: ['New'],
    };
    // Add to recruiter's own list (persisted)
    const updatedRecruiterJobs = [job, ...recruiterJobs]
    setRecruiterJobs(updatedRecruiterJobs)
    localStorage.setItem(RECRUITER_JOBS_KEY, JSON.stringify(updatedRecruiterJobs))
    // Also add to browse feed so candidates can see it
    setBrowseJobs(prev => [job, ...prev])
    return job.id;
  };

  const applyForJob = (jobId) => {
    const job = [...browseJobs, ...recruiterJobs].find(j => j.id === jobId);
    if (!job) return false;

    const newApp = {
      id: Date.now(),
      candidateName: currentUser.name,
      candidateRole: 'Applicant',
      jobTitle: job.title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      matchScore: '90%',
      status: 'New'
    };
    const updatedApps = [newApp, ...applications]
    setApplications(updatedApps)
    localStorage.setItem(RECRUITER_APPS_KEY, JSON.stringify(updatedApps))
    return true;
  };

  const updateApplicationStatus = (appId, newStatus) => {
    setApplications(apps => {
      const updated = apps.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      localStorage.setItem(RECRUITER_APPS_KEY, JSON.stringify(updated))
      return updated
    });
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

  const refreshCandidates = () => {
    setCandidates(loadCandidates())
  }

  const value = {
    jobs: recruiterJobs,
    browseJobs,
    candidates,
    applications,
    currentUser,
    addJob,
    removeJob,
    toggleJobStatus,
    applyForJob,
    updateApplicationStatus,
    refreshCandidates,
    setCurrentUser
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
