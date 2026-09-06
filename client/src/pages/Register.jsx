import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FaUpload } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [voterId, setVoterId] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', dob: '', gender: '',
    street: '', city: '', state: '', pincode: '', country: 'India',
    idProofType: '', idProofNumber: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [idProof, setIdProof]           = useState(null);
  const [preview, setPreview]           = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (profileImage) formData.append('profileImage', profileImage);
      if (idProof)      formData.append('idProof', idProof);

      const { data } = await API.post('/voter/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVoterId(data.voterId);
      toast.success('Registration successful!');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Show Voter ID after registration ──
  if (voterId) {
    return (
      <div style={styles.successWrap}>
        <div style={styles.successCard}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h2 style={{ color: '#22c55e', margin: '12px 0' }}>Registration Successful!</h2>
          <p style={{ color: '#555', marginBottom: 20 }}>
            Your registration is pending admin verification. Save your Voter ID below.
          </p>
          <div style={styles.voterIdBox}>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 4 }}>Your Voter ID</p>
            <h2 style={{ fontSize: '2rem', color: '#4f46e5', letterSpacing: 2 }}>{voterId}</h2>
          </div>
          <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '16px 0' }}>
            ⚠️ Save this ID! You need it to login and vote.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: 8 }}>
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>🗳️ Voter Registration</h2>
        <p style={styles.subtitle}>Fill in all details to register as a voter</p>

        <form onSubmit={handleSubmit}>

          {/* Profile Image */}
          <div style={styles.imageUpload}>
            <div style={styles.imagePreview}>
              {preview
                ? <img src={preview} alt="Preview" style={styles.previewImg} />
                : <FaUpload size={28} color="#aaa" />
              }
            </div>
            <div>
              <label style={styles.uploadLabel}>
                Profile Photo *
                <input type="file" accept="image/*" onChange={handleProfileImage}
                  style={{ display: 'none' }} required />
              </label>
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>
                JPG, PNG, WEBP — max 5MB
              </p>
            </div>
          </div>

          {/* Section: Personal Info */}
          <h3 style={styles.sectionHead}>👤 Personal Information</h3>
          <div style={styles.grid2}>
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Arjun Kumar" required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="arjun@gmail.com" required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210" required />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input name="dob" type="date" value={form.dob}
                onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Section: Address */}
          <h3 style={styles.sectionHead}>🏠 Address</h3>
          <div style={styles.grid2}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Street Address *</label>
              <input name="street" value={form.street} onChange={handleChange}
                placeholder="12 MG Road" required />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input name="city" value={form.city} onChange={handleChange}
                placeholder="Bengaluru" required />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input name="state" value={form.state} onChange={handleChange}
                placeholder="Karnataka" required />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input name="pincode" value={form.pincode} onChange={handleChange}
                placeholder="560001" required />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input name="country" value={form.country} onChange={handleChange} />
            </div>
          </div>

          {/* Section: ID Proof */}
          <h3 style={styles.sectionHead}>🪪 ID Proof</h3>
          <div style={styles.grid2}>
            <div className="form-group">
              <label>ID Proof Type *</label>
              <select name="idProofType" value={form.idProofType}
                onChange={handleChange} required>
                <option value="">Select Type</option>
                <option>Aadhaar</option>
                <option>PAN</option>
                <option>Passport</option>
                <option>VoterID</option>
                <option>DrivingLicense</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Proof Number *</label>
              <input name="idProofNumber" value={form.idProofNumber}
                onChange={handleChange} placeholder="XXXX-XXXX-XXXX" required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Upload ID Proof * (Image or PDF)</label>
              <input type="file" accept="image/*,.pdf"
                onChange={(e) => setIdProof(e.target.files[0])} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9rem' }}>
            Already registered? <Link to="/login" style={{ color: '#4f46e5' }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrap:        { padding: '40px 20px', maxWidth: 760, margin: '0 auto' },
  card:        { background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title:       { fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: 6 },
  subtitle:    { color: '#888', marginBottom: 28, fontSize: '0.95rem' },
  sectionHead: { fontSize: '1rem', fontWeight: 700, color: '#4f46e5', margin: '24px 0 12px', borderBottom: '2px solid #ede9fe', paddingBottom: 6 },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' },
  imageUpload: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: 16, background: '#f9f9ff', borderRadius: 10 },
  imagePreview:{ width: 80, height: 80, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  previewImg:  { width: '100%', height: '100%', objectFit: 'cover' },
  uploadLabel: { display: 'inline-block', background: '#4f46e5', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 },
  successWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: 20 },
  successCard: { background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: 440, width: '100%' },
  voterIdBox:  { background: '#f0f0ff', borderRadius: 12, padding: '20px', border: '2px dashed #4f46e5' },
};

export default Register;