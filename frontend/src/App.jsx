import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'

// Import placeholders for pages
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { OTPVerifyPage } from './pages/auth/OTPVerifyPage'
import { RoleSelectionPage } from './pages/RoleSelectionPage'

import { JobFeedPage } from './pages/employee/JobFeedPage'
import { JobDetailPage } from './pages/employee/JobDetailPage'
import { DashboardPage as EmpDashboard } from './pages/employee/DashboardPage'
import { ProfileSetupPage } from './pages/employee/ProfileSetupPage'

import { PostJobPage } from './pages/recruiter/PostJobPage'
import { CandidateSearchPage } from './pages/recruiter/CandidateSearchPage'
import { ManageApplicationsPage } from './pages/recruiter/ManageApplicationsPage'
import { JobCandidatesPage } from './pages/recruiter/JobCandidatesPage'
import { RecruiterDashboardPage as RecDashboard } from './pages/recruiter/DashboardPage'
import { CompanySetupPage } from './pages/recruiter/CompanySetupPage'

// Services Page (for both roles)
import { AllServicesPage } from './pages/AllServicesPage'



// Layout Wrappers
function PublicLayout() {
  return (
    <>
      <Navbar variant="public" />
      <Outlet />
      <Footer variant="public" />
    </>
  )
}

function EmployeeLayout() {
  return (
    <>
      <Navbar variant="employee" />
      <Outlet />
      <Footer variant="minimal" />
    </>
  )
}

function RecruiterLayout() {
  return (
    <>
      <Navbar variant="recruiter" />
      <Outlet />
      <Footer variant="minimal" />
    </>
  )
}

function AuthLayout() {
  return (
    <>
      <Navbar variant="public" />
      <Outlet />
    </>
  )
}



export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/otp-verify" element={<OTPVerifyPage />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />
          </Route>



          {/* Employee Routes - PROTECTED */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route element={<EmployeeLayout />}>
              <Route path="/jobs" element={<JobFeedPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              {/* Locum (employee) */}
              <Route path="/locum/jobs" element={<JobFeedPage />} />
              <Route path="/locum/jobs/:id" element={<JobDetailPage />} />
              <Route path="/locum/dashboard" element={<EmpDashboard />} />

              <Route path="/dashboard" element={<EmpDashboard />} />
              <Route path="/profile-setup" element={<ProfileSetupPage />} />
              <Route path="/services" element={<AllServicesPage />} />
            </Route>
          </Route>

          {/* Recruiter Routes - PROTECTED */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
            <Route path="/recruiter" element={<RecruiterLayout />}>
              <Route path="post-job" element={<PostJobPage />} />
              <Route path="locum/post" element={<PostJobPage />} />
              <Route path="candidates" element={<CandidateSearchPage />} />
              <Route path="locum/candidates" element={<CandidateSearchPage />} />
              <Route path="applications" element={<ManageApplicationsPage />} />
              <Route path="applications/:jobId" element={<JobCandidatesPage />} />
              <Route path="dashboard" element={<RecDashboard />} />

              {/* Locum (recruiter) */}
              <Route path="locum/applications" element={<ManageApplicationsPage />} />
              <Route path="locum/applications/:jobId" element={<JobCandidatesPage />} />
              <Route path="locum/dashboard" element={<RecDashboard />} />

              <Route path="company-setup" element={<CompanySetupPage />} />
              <Route path="services" element={<AllServicesPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  )
}
