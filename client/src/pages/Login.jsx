import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaVoteYea } from 'react-icons/fa';

const Login = () => {
  const [voterId, setVoterId] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginVoter } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/voter/login', { voterId: voterId.trim().toUpperCase() });
      loginVoter(data.voter);
      toast.success(`Welcome back, ${data.voter.name}!`);
      navigate('/elections');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <FaVoteYea size={48} color="#4f46e5" />
          <h2 style={styles.title}>Voter Login</h2>
          <p style={styles.subtitle}>Enter your Voter ID to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Voter ID *</label>
            <input
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              placeholder="VOT-XXXXXXXX"
              required
              style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: '1.1rem', textAlign: 'center' }}
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 6 }}>
              You received this after registration
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: '#555' }}>
          <p>Not registered? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>Register here</Link></p>
          <p style={{ marginTop: 8 }}>
            Admin? <Link to="/admin/login" style={{ color: '#7c3aed', fontWeight: 600 }}>Admin Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:     { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: 20 },
  card:     { background: '#fff', borderRadius: 16, padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: 420 },
  title:    { fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', marginTop: 12 },
  subtitle: { color: '#888', fontSize: '0.95rem', marginTop: 4 },
};

export default Login;