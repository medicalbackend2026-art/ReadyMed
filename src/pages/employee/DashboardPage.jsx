import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useAppContext } from '../../context/AppContext'

export function DashboardPage() {
  const { applications, currentUser } = useAppContext()
  
  const [completionPercentage, setCompletionPercentage] = React.useState(85)

  React.useEffect(() => {
    const hasPhoto = !!localStorage.getItem('mockProfilePhoto')
    const hasResume = !!localStorage.getItem('mockResumeFilename')
    setCompletionPercentage((hasPhoto ? 7 : 0) + (hasResume ? 8 : 0) + 85)
  }, [])

  // Filter context applications for the mock current user (Dr. Sneha)
  const myApplications = applications.filter(app => 
    app.candidateName.includes('Sneha') || app.candidateName === currentUser?.name
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Offer sent': return 'bg-teal-50 text-teal-700 border-teal-100'
      case 'Shortlisted': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'Interviewing': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'New': 
      case 'Reviewed': return 'bg-gray-50 text-gray-700 border-border'
      case 'Rejected': return 'bg-pink-50 text-pink-700 border-pink-100'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-20 font-sans">
      
      {/* Welcome Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="font-serif text-[26px] text-gray-900 mb-1">Welcome back, {currentUser?.name}</h1>
          <div className="text-sm text-gray-500">Here's what's happening with your job search today.</div>
        </div>
        <Button to="/profile-setup" variant="secondary" size="sm">Edit profile</Button>
      </div>

      {/* Profile Completion Banner */}
      <div className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 rounded-[14px] p-5 md:p-6 flex flex-col md:flex-row items-center gap-[18px] mb-7">
        <div className="font-serif text-[36px] text-teal-700 leading-none">{completionPercentage}%</div>
        <div className="flex-1 w-full text-center md:text-left">
          <div className="text-sm font-semibold text-teal-700 mb-1.5">Profile completion</div>
          <div className="h-1.5 w-full bg-teal-100 rounded-full mb-1 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
          </div>
          <div className="text-xs text-teal-600">
            {completionPercentage === 100 
              ? 'Your profile is fully complete! Great job.' 
              : 'Upload a photo and resume to reach 100% — complete profiles get 3× more views.'}
          </div>
        </div>
        <Button to="/profile-setup#step6" variant="primary" size="sm" className="w-full md:w-auto">Complete profile &rarr;</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {[
          { label: 'Applications sent', value: myApplications.length.toString(), color: 'gray-900' },
          { label: 'Shortlisted', value: myApplications.filter(a => a.status === 'Shortlisted').length.toString(), color: 'teal-600' },
          { label: 'Interview scheduled', value: myApplications.filter(a => a.status === 'Interviewing').length.toString(), color: 'blue-600' },
          { label: 'Saved jobs', value: '4', color: 'amber-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-[18px]">
            <div className={`font-serif text-[28px] mb-0.5 text-${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        
        {/* Left Column */}
        <div className="space-y-5">
          {/* Applications */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">My applications</div>
            </div>
            
            <div className="divide-y divide-border">
              {myApplications.length > 0 ? myApplications.map((app, i) => (
                <div key={i} className="px-5 py-4 flex gap-3.5 items-start hover:bg-gray-50 transition-colors">
                  <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 bg-blue-50 text-blue-700">
                    {app.jobTitle.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{app.jobTitle}</div>
                    <div className="text-xs text-gray-500 truncate">{app.date}</div>
                  </div>
                  <div className="text-right shrink-0 px-2">
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(app.status)} mb-1`}>
                      {app.status}
                    </span>
                    <div className="text-[11px] text-gray-400">{app.matchScore}% Match</div>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm text-gray-500">You haven't applied to any jobs yet.</div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">Recommended for you</div>
              <Link to="/jobs" className="text-[13px] font-medium text-teal-600 hover:underline">Browse all &rarr;</Link>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-4 flex gap-3.5 items-center hover:bg-gray-50 transition-colors">
                <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 bg-purple-50 text-purple-700">KH</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 mb-0.5 truncate">Consultant — Nephrology</div>
                  <div className="text-xs text-gray-500 truncate">Kokilaben Hospital · Mumbai · ₹22–28 LPA</div>
                </div>
                <Button to="/jobs/1" variant="primary" size="sm">View &rarr;</Button>
              </div>
              <div className="px-5 py-4 flex gap-3.5 items-center hover:bg-gray-50 transition-colors">
                <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 bg-green-50 text-green-700">HM</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 mb-0.5 truncate">Attending Physician — ICU</div>
                  <div className="text-xs text-gray-500 truncate">Hinduja Hospital · Mumbai · ₹18–24 LPA</div>
                </div>
                <Button to="/jobs/2" variant="primary" size="sm">View &rarr;</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Notifications */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">Notifications</div>
              <Link to="#" className="text-[13px] font-medium text-teal-600 hover:underline">Mark all read</Link>
            </div>
            <div className="divide-y divide-border">
              {[
                { text: <><strong className="text-gray-900">Apollo Hospitals</strong> shortlisted you for Senior Cardiologist.</>, time: '2 hours ago', new: true },
                { text: <><strong className="text-gray-900">Fortis Healthcare</strong> scheduled an interview for 14 March.</>, time: 'Yesterday', new: true },
                { text: <><strong className="text-gray-900">Kokilaben Hospital</strong> invited you to apply for Consultant.</>, time: 'Yesterday', new: true },
                { text: <>5 new jobs matched your profile this week.</>, time: '3 days ago', new: false },
                { text: <>Complete your profile to improve matches — upload a photo.</>, time: '5 days ago', new: false },
              ].map((n, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-2.5 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.new ? 'bg-teal-400' : 'bg-gray-200'}`} />
                  <div>
                    <div className="text-[13px] text-gray-700 leading-snug mb-0.5">{n.text}</div>
                    <div className="text-[11px] text-gray-400">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Jobs */}
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="text-[15px] font-semibold text-gray-900">Saved jobs</div>
              <Link to="/jobs" className="text-[13px] font-medium text-teal-600 hover:underline">View all &rarr;</Link>
            </div>
            <div className="divide-y divide-border">
              {[
                { title: 'Consultant Cardiologist', meta: 'Fortis · Delhi · ₹20–28 LPA' },
                { title: 'ICU Physician', meta: 'Hinduja · Mumbai · ₹15–20 LPA' },
                { title: 'Nephrologist', meta: 'KIMS · Hyderabad · ₹22–30 LPA' },
              ].map((job, i) => (
                <div key={i} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="text-[14px] font-semibold text-gray-900 mb-0.5">{job.title}</div>
                  <div className="text-xs text-gray-500 mb-2.5">{job.meta}</div>
                  <div className="flex gap-2">
                    <Button to="/jobs/1" variant="primary" size="sm" className="py-1 px-3 text-xs">Apply &rarr;</Button>
                    <Button variant="ghost" size="sm" className="py-1 px-3 text-xs">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
