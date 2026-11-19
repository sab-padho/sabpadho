import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useScrollToTop } from './lib/hooks'
import { useAuth } from './lib/auth'
import type { ReactNode } from 'react'
import { MarketingLayout } from './components/MarketingLayout'
import { AppShell } from './components/AppShell'
import { Home } from './pages/Home'
import { SubjectsPage } from './pages/SubjectsPage'
import { SubjectPage } from './pages/SubjectPage'
import { ChapterPrimer } from './pages/ChapterPrimer'
import { PublicMocks } from './pages/PublicMocks'
import { HowItWorks } from './pages/HowItWorks'
import { SignIn } from './pages/SignIn'
import { NotFound } from './pages/NotFound'
import { Dashboard } from './pages/app/Dashboard'
import { PracticeSetup } from './pages/app/PracticeSetup'
import { PracticeSession } from './pages/app/PracticeSession'
import { MockList } from './pages/app/MockList'
import { MockInstructions } from './pages/app/MockInstructions'
import { MockAttempt } from './pages/app/MockAttempt'
import { MockResult } from './pages/app/MockResult'
import { Revision } from './pages/app/Revision'
import { Shelf } from './pages/app/Shelf'
import { Progress } from './pages/app/Progress'
import { SettingsPage } from './pages/app/SettingsPage'

export function App() {
  useScrollToTop()
  useEffect(() => {
    const reduced = localStorage.getItem('sabpadho-reduced-motion') === 'true'
    document.documentElement.classList.toggle('reduce-motion', reduced)
  }, [])

  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:subjectSlug" element={<SubjectPage />} />
        <Route path="/subjects/:subjectSlug/:chapterSlug" element={<ChapterPrimer />} />
        <Route path="/mocks" element={<PublicMocks />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/signin" element={<SignIn />} />
      </Route>

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="practice" element={<PracticeSetup />} />
        <Route path="practice/:chapterSlug" element={<PracticeSession />} />
        <Route path="mocks" element={<MockList />} />
        <Route path="mocks/:mockId/instructions" element={<MockInstructions />} />
        <Route path="mocks/:mockId/attempt" element={<MockAttempt />} />
        <Route path="mocks/:mockId/result" element={<MockResult />} />
        <Route path="revision" element={<Revision />} />
        <Route path="shelf" element={<Shelf />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { email } = useAuth()
  const location = useLocation()
  if (!email) return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
