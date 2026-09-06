import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home           from './pages/Home';
import Register       from './pages/Register';
import Login          from './pages/Login';
import Elections      from './pages/Elections';
import ElectionDetail from './pages/ElectionDetail';
import Vote           from './pages/Vote';
import Results        from './pages/Results';
import Profile        from './pages/Profile';

// Admin Pages
import AdminLogin      from './pages/admin/AdminLogin';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminVoters     from './pages/admin/AdminVoters';
import AdminElections  from './pages/admin/AdminElections';
import CreateElection  from './pages/admin/CreateElection';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"            element={<Home />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/elections"   element={<Elections />} />
          <Route path="/elections/:id" element={<ElectionDetail />} />
          <Route path="/results/:id" element={<Results />} />

          {/* Protected - Voter */}
          <Route path="/vote/:id"  element={<ProtectedRoute><Vote /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/login"      element={<AdminLogin />} />
          <Route path="/admin/dashboard"  element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/voters"     element={<AdminRoute><AdminVoters /></AdminRoute>} />
          <Route path="/admin/elections"  element={<AdminRoute><AdminElections /></AdminRoute>} />
          <Route path="/admin/elections/create" element={<AdminRoute><CreateElection /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;