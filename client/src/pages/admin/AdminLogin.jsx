import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FaShieldAlt } from 'react-icons/fa';

const AdminLogin = () => {
  const [secret,  setSecret]  = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/admin/login', { adminSecret: secret });
      loginAdmin();
      toast.success('Welcome Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin secret');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <FaShieldAlt size={52} color="#7c3aed" />
          <h2 style={styles.title}>Admin Login</h2>
          <p style={styles.subtitle}>Enter your admin secret to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Secret *</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter admin secret"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ background: '#7c3aed', marginTop: 8 }}>
            {loading ? 'Verifying...' : 'Login as Admin →'}
          </button>
        </form>
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

export default AdminLogin;