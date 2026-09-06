import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import {
  FaUsers, FaVoteYea, FaCheckCircle,
  FaClock, FaChartBar, FaPlus
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const secret = localStorage.getItem('adminSecret');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/dashboard', {
          headers: { 'admin-secret': secret }
        });
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (!data)   return null;

  const { stats, recentVotes } = data;

  return (
    <div style={styles.wrap}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>🛡️ Admin Dashboard</h2>
          <p style={{ color: '#888', marginTop: 4 }}>Overview of the voting system</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/voters"    style={styles.btnSecondary}>Manage Voters</Link>
          <Link to="/admin/elections/create" style={styles.btnPrimary}>
            <FaPlus style={{ marginRight: 6 }} /> New Election
          </Link>
        </div>
      </div>

      {/* ── Voter Stats ── */}
      <h3 style={styles.sectionTitle}>👥 Voters</h3>
      <div style={styles.statsGrid}>
        <StatCard icon={<FaUsers size={28} color="#4f46e5" />}
          label="Total Voters"    value={stats.voters.total}       bg="#f0f0ff" />
        <StatCard icon={<FaCheckCircle size={28} color="#22c55e" />}
          label="Verified"        value={stats.voters.verified}    bg="#dcfce7" />
        <StatCard icon={<FaClock size={28} color="#f59e0b" />}
          label="Pending"         value={stats.voters.pending}     bg="#fef9c3" />
        <StatCard icon={<FaUsers size={28} color="#ef4444" />}
          label="Deactivated"     value={stats.voters.deactivated} bg="#fee2e2" />
      </div>

      {/* ── Election Stats ── */}
      <h3 style={styles.sectionTitle}>🗳️ Elections</h3>
      <div style={styles.statsGrid}>
        <StatCard icon={<FaChartBar size={28} color="#4f46e5" />}
          label="Total"    value={stats.elections.total}    bg="#f0f0ff" />
        <StatCard icon={<FaVoteYea size={28} color="#22c55e" />}
          label="Active"   value={stats.elections.active}   bg="#dcfce7" />
        <StatCard icon={<FaClock size={28} color="#3b82f6" />}
          label="Upcoming" value={stats.elections.upcoming} bg="#dbeafe" />
        <StatCard icon={<FaChartBar size={28} color="#6b7280" />}
          label="Ended"    value={stats.elections.ended}    bg="#f3f4f6" />
      </div>

      {/* ── Total Votes + Most Voted ── */}
      <div style={styles.row2}>

        <div style={styles.totalVotesCard}>
          <FaVoteYea size={36} color="#4f46e5" />
          <div style={{ marginLeft: 16 }}>
            <p style={{ color: '#888', fontSize: '0.88rem' }}>Total Votes Cast</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e1b4b' }}>
              {stats.totalVotes}
            </h2>
          </div>
        </div>

        {stats.mostVotedElection && (
          <div style={styles.mostVotedCard}>
            <p style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              🏆 Most Voted Election
            </p>
            <h3 style={{ color: '#1e1b4b', fontSize: '1.1rem', fontWeight: 700 }}>
              {stats.mostVotedElection.title}
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 4 }}>
              {stats.mostVotedElection.voteCount} votes
            </p>
          </div>
        )}
      </div>

      {/* ── Recent Votes ── */}
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>⏱️ Recent Votes</h3>
        {recentVotes.length === 0 ? (
          <p style={{ color: '#888', padding: '20px 0' }}>No votes yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Voter</th>
                <th style={styles.th}>Voter ID</th>
                <th style={styles.th}>Election</th>
                <th style={styles.th}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentVotes.map((v, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{v.voterId?.name || '—'}</td>
                  <td style={styles.td}>
                    <span style={styles.voterIdTag}>{v.voterId?.voterId}</span>
                  </td>
                  <td style={styles.td}>{v.electionId?.title || '—'}</td>
                  <td style={styles.td}>{new Date(v.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div style={styles.quickLinks}>
        <Link to="/admin/voters"    style={styles.qLink}>👥 Manage Voters →</Link>
        <Link to="/admin/elections" style={styles.qLink}>🗳️ Manage Elections →</Link>
        <Link to="/admin/elections/create" style={styles.qLink}>➕ Create Election →</Link>
      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value, bg }) => (
  <div style={{ ...styles.statCard, background: bg }}>
    {icon}
    <div style={{ marginLeft: 14 }}>
      <p style={{ fontSize: '0.82rem', color: '#555', marginBottom: 2 }}>{label}</p>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b' }}>{value}</h3>
    </div>
  </div>
);

const styles = {
  wrap:           { maxWidth: 1100, margin: '0 auto', padding: '40px 20px' },
  pageHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  title:          { fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b' },
  btnPrimary:     { background: '#4f46e5', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', fontSize: '0.9rem' },
  btnSecondary:   { border: '1px solid #ddd', color: '#555', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' },
  sectionTitle:   { fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b', margin: '24px 0 14px' },
  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16, marginBottom: 8 },
  statCard:       { borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  row2:           { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '24px 0', flexWrap: 'wrap' },
  totalVotesCard: { background: '#fff', borderRadius: 14, padding: '24px 28px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  mostVotedCard:  { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 14, padding: '24px 28px', boxShadow: '0 2px 10px rgba(245,158,11,0.15)' },
  recentSection:  { background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24, overflowX: 'auto' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  thead:          { background: '#f9fafb' },
  th:             { padding: '10px 14px', textAlign: 'left', fontSize: '0.82rem', color: '#888', fontWeight: 600 },
  tr:             { borderBottom: '1px solid #f3f4f6' },
  td:             { padding: '12px 14px', fontSize: '0.9rem', color: '#333' },
  voterIdTag:     { background: '#ede9fe', color: '#4f46e5', padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 },
  quickLinks:     { display: 'flex', gap: 16, flexWrap: 'wrap' },
  qLink:          { background: '#fff', borderRadius: 10, padding: '16px 24px', fontWeight: 600, color: '#4f46e5', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1, textAlign: 'center', fontSize: '0.95rem' },
};

export default AdminDashboard;