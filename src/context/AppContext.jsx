import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialJobs, initialCandidates, initialApplications } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [applications, setApplications] = useState(initialApplications);
  const [currentUser, setCurrentUser] = useState({
    name: 'Sneha Kulkarni',
    role: 'employee', // 'employee' or 'recruiter'
    email: 'sneha@example.com'
  });

  // Mock functions to update state

  const addJob = (newJob) => {
    const job = {
      ...newJob,
      id: Date.now(),
      posted: 'Just now',
      tags: ['New'],
    };
    setJobs([job, ...jobs]);
    return job.id;
  };

  const applyForJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
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
    setApplications([newApp, ...applications]);
    return true;
  };

  const updateApplicationStatus = (appId, newStatus) => {
    setApplications(apps => 
      apps.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    );
  };

  const value = {
    jobs,
    candidates,
    applications,
    currentUser,
    addJob,
    applyForJob,
    updateApplicationStatus,
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
