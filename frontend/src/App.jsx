import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserType } from './types/enums'

import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

import Home from './pages/Home'
import Login from './pages/shared/Login'
import Register from './pages/shared/Register'

import CandidateOverview from './pages/candidate/CandidateOverview'
import CandidateApplications from './pages/candidate/CandidateApplications'
import Profile from './pages/candidate/Profile'

import PostJob from './pages/employer/PostJob'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import MyJobs from './pages/employer/MyJobs'
import CandidateAssessments from './pages/candidate/CandidateAssessments'
import EmployerAssessments from './pages/employer/EmployerAssessments'
import Market from './pages/shared/Market'
import AccountStatistics from './pages/shared/AccountStatistics'
import JobDetail from './pages/shared/JobDetail'

import './styles/App.css'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Main Routes */}
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/account-statistics"
                element={
                  <ProtectedRoute>
                    <AccountStatistics />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/market"
                element={
                  <ProtectedRoute>
                    <Market />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/jobs/:jobId"
                element={
                  <ProtectedRoute>
                    <JobDetail />
                  </ProtectedRoute>
                }
              />

              {/* Candidate Routes */}
              <Route
                path="/candidate-overview"
                element={
                  <ProtectedRoute requiredType={UserType.CANDIDATE}>
                    <CandidateOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate"
                element={
                  <ProtectedRoute requiredType={UserType.CANDIDATE}>
                    <CandidateApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessments"
                element={
                  <ProtectedRoute requiredType={UserType.CANDIDATE}>
                    <CandidateAssessments />
                  </ProtectedRoute>
                }
              />

              {/* Employer Routes */}
              <Route
                path="/post-job"
                element={
                  <ProtectedRoute requiredType={UserType.EMPLOYER}>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs"
                element={
                  <ProtectedRoute requiredType={UserType.EMPLOYER}>
                    <MyJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/applications"
                element={
                  <ProtectedRoute requiredType={UserType.EMPLOYER}>
                    <MyJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/assessments"
                element={
                  <ProtectedRoute requiredType={UserType.EMPLOYER}>
                    <EmployerAssessments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer"
                element={
                  <ProtectedRoute requiredType={UserType.EMPLOYER}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App