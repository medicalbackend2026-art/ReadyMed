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
  const checks = [
    !!profile.profession,
    !!(profile.experiences?.length > 0 && profile.experiences[0].jobTitle),
    !!(profile.qualifications?.length > 0 && profile.qualifications[0].degree),
    !!(profile.certifications?.length > 0 && profile.certifications[0].regNumber),
    !!(profile.skills?.length > 0),
    !!(profile.currentSalary || profile.expectedSalary),
    !!(profile.photo || profile.resumeFilename),
  ]
  return Math.round((checks.filter(Boolean).length / 7) * 100)
}

export function getCompanyCompletion(company) {
  if (!company) return 0
  let score = 0
  if (company.companyName) score += 25
  if (company.orgType) score += 15
  if (company.description) score += 20
  if (company.contactName) score += 20
  if (company.logo) score += 20
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
