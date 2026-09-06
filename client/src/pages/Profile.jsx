import { useEffect, useState } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaCheckCircle, FaClock, FaVoteYea } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { voter } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          API.get(`/voter/profile/${voter.voterId}`),
          API.get(`/vote/history/${voter.voterId}`),
        ]);
        setProfile(profileRes.data.voter);
        setHistory(historyRes.data.history);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Loader />;
  if (!profile) return null;

  return (
    <div style={styles.wrap}>

      {/* ── Profile Card ── */}
      <div style={styles.profileCard}>
        <div style={styles.avatarWrap}>
          {profile.profileImage
            ? <img src={`http://localhost:5000/${profile.profileImage}`}
                alt="Profile" style={styles.avatar} />
            : <div style={styles.avatarPlaceholder}>
                <FaUser size={40} color="#fff" />
              </div>
          }
        </div>

        <div style={styles.profileInfo}>
          <div style={styles.nameRow}>
            <h2 style={styles.name}>{profile.name}</h2>
            {profile.isVerified
              ? <span style={styles.verified}><FaCheckCircle /> Verified</span>
              : <span style={styles.pending}><FaClock /> Pending Verification</span>
            }
          </div>

          <div style={styles.voterIdBox}>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>Your Voter ID</p>
            <p style={styles.voterId}>{profile.voterId}</p>
          </div>

          <div style={styles.infoGrid}>
            <InfoItem label="Email"    value={profile.email} />
            <InfoItem label="Phone"    value={profile.phone} />
            <InfoItem label="Gender"   value={profile.gender} />
            <InfoItem label="DOB"      value={new Date(profile.dob).toLocaleDateString()} />
            <InfoItem label="City"     value={profile.address?.city} />
            <InfoItem label="State"    value={profile.address?.state} />
            <InfoItem label="Pincode"  value={profile.address?.pincode} />
            <InfoItem label="Country"  value={profile.address?.country} />
          </div>
        </div>
      </div>

      {/* ── Voting History ── */}
      <div style={styles.historySection}>
        <h2 style={styles.sectionTitle}>
          <FaVoteYea style={{ marginRight: 8 }} color="#4f46e5" />
          Voting History ({history.length})
        </h2>

        {history.length === 0 ? (
          <div style={styles.noHistory}>
            You haven't voted in any elections yet.
          </div>
        ) : (
          history.map((h, i) => (
            <div key={i} style={styles.historyCard}>
              <div style={styles.historyLeft}>
                <h3 style={styles.electionTitle}>{h.election?.title}</h3>
                <p style={styles.votedFor}>
                  Voted for: <strong>{h.votedFor?.name}</strong>
                  {h.votedFor?.party && ` (${h.votedFor.party})`}
                </p>
              </div>
              <div style={styles.historyRight}>
                <FaCheckCircle color="#22c55e" size={18} />
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>
                  {new Date(h.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={{ marginBottom: 12 }}>
    <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: 2 }}>{label}</p>
    <p style={{ fontWeight: 600, color: '#1e1b4b', fontSize: '0.95rem' }}>{value || '—'}</p>
  </div>
);

const styles = {
  wrap:              { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  profileCard:       { background: '#fff', borderRadius: 16, padding: 32, marginBottom: 24, boxShadow: '0 2px 14px rgba(0,0,0,0.08)', display: 'flex', gap: 28, flexWrap: 'wrap' },
  avatarWrap:        { flexShrink: 0 },
  avatar:            { width: 130, height: 130, borderRadius: '50%', objectFit: 'cover', border: '4px solid #ede9fe' },
  avatarPlaceholder: { width: 130, height: 130, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profileInfo:       { flex: 1 },
  nameRow:           { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 },
  name:              { fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b' },
  verified:          { display: 'flex', alignItems: 'center', gap: 5, background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 },
  pending:           { display: 'flex', alignItems: 'center', gap: 5, background: '#fef9c3', color: '#ca8a04', padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 },
  voterIdBox:        { background: '#f0f0ff', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'inline-block' },
  voterId:           { fontSize: '1.2rem', fontWeight: 800, color: '#4f46e5', letterSpacing: 2 },
  infoGrid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '4px 20px' },
  historySection:    { background: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 14px rgba(0,0,0,0.08)' },
  sectionTitle:      { fontSize: '1.2rem', fontWeight: 700, color: '#1e1b4b', marginBottom: 20, display: 'flex', alignItems: 'center' },
  noHistory:         { textAlign: 'center', padding: '30px 0', color: '#888', fontSize: '1rem' },
  historyCard:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 10 },
  historyLeft:       { flex: 1 },
  historyRight:      { textAlign: 'center' },
  electionTitle:     { fontWeight: 700, color: '#1e1b4b', fontSize: '1rem', marginBottom: 4 },
  votedFor:          { fontSize: '0.88rem', color: '#555' },
};

export default Profile;