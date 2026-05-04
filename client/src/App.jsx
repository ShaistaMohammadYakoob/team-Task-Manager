import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Projects from './pages/Projects.jsx';
import Signup from './pages/Signup.jsx';
import Team from './pages/Team.jsx';

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<Team />} />
          <Route path="/team" element={<Team />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    <Toaster
      position="top-right"
      toastOptions={{
        className:
          'border border-slate-200 bg-white text-slate-900 shadow-soft dark:border-white/10 dark:bg-slate-900 dark:text-white'
      }}
    />
  </>
);

export default App;
