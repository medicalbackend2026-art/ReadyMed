// Central hook for reading/writing user profile data to localStorage
// All profile data is stored under the key 'rm_user_profile'
// Recruiter company data is stored under 'rm_company_profile'

const STORAGE_KEY = 'rm_user_profile'
const COMPANY_KEY = 'rm_company_profile'

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveUserProfile(data) {
  const existing = getUserProfile() || {}
  const updated = { ...existing, ...data }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function getCompanyProfile() {
  try {
    const raw = localStorage.getItem(COMPANY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCompanyProfile(data) {
  const existing = getCompanyProfile() || {}
  const updated = { ...existing, ...data }
  localStorage.setItem(COMPANY_KEY, JSON.stringify(updated))
  return updated
}

export function clearUserProfile() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(COMPANY_KEY)
  // Also clear legacy keys
  localStorage.removeItem('mockProfilePhoto')
  localStorage.removeItem('mockResumeFilename')
  localStorage.removeItem('mockCertifications')
}

export function getProfileCompletion(profile) {
  if (!profile) return 0
  let score = 0
  if (profile.profession) score += 20
  if (profile.experiences?.length > 0 && profile.experiences[0].jobTitle) score += 15
  if (profile.qualifications?.length > 0 && profile.qualifications[0].degree) score += 15
  if (profile.skills?.length > 0) score += 10
  if (profile.currentSalary || profile.expectedSalary) score += 10
  if (profile.photo) score += 15
  if (profile.resumeFilename) score += 15
  return Math.min(score, 100)
}

export function getCompanyCompletion(company) {
  if (!company) return 0
  let score = 0
  if (company.companyName) score += 25
  if (company.orgType) score += 15
  if (company.description) score += 20
  if (company.contactName) score += 20
  if (company.logo) score += 10
  if (company.regCert) score += 10
  return Math.min(score, 100)
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}
