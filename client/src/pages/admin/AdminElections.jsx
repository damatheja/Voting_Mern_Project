import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaChartBar } from 'react-icons/fa';

const AdminElections = () => {
  const [elections, setElections] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const secret = localStorage.getItem('adminSecret');

  const fetchElections = async () => {
    try {
      const { data } = await API.get('/admin/elections', {
        headers: { 'admin-secret': secret }
      });
      setElections(data.elections);
    } catch (err) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchElections(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}" and all its votes?`)) return;
    try {
      await API.delete(`/elections/${id}`, {
        data:    { adminSecret: secret },
        headers: { 'admin-secret': secret },
      });
      toast.success('🗑️ Election deleted');
      fetchElections();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleActive = async (id, current) => {
    try {
      await API.put(`/elections/${id}`, {
        adminSecret: secret,
        isActive:    !current,
      });
      toast.success(`Election ${!current ? 'activated' : 'deactivated'}`);
      fetchElections();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.wrap}>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>🗳️ Election Management</h2>
          <p style={{ color: '#888', marginTop: 4 }}>{elections.length} elections total</p>
        </div>
        <Link to="/admin/elections/create" style={styles.btnCreate}>
          <FaPlus style={{ marginRight: 6 }} /> Create Election
        </Link>
      </div>

      {elections.length === 0 ? (
        <div style={styles.empty}>
          <p>No elections yet.</p>
          <Link to="/admin/elections/create" style={styles.btnCreate}>Create First Election</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {elections.map((e) => (
            <div key={e._id} style={styles.card}>

              {/* ── Card Header ── */}
              <div style={styles.cardTop}>
                <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
                <span style={{ fontSize: '0.82rem', color: '#888' }}>
                  {e.candidates.length} candidates
                </span>
              </div>

              <h3 style={styles.cardTitle}>{e.title}</h3>
              <p style={styles.cardDesc}>{e.description || 'No description.'}</p>

              {/* ── Dates ── */}
              <div style={styles.dates}>
                <p style={styles.date}>📅 Start: {new Date(e.startDate).toLocaleString()}</p>
                <p style={styles.date}>🔚 End: {new Date(e.endDate).toLocaleString()}</p>
              </div>

              {/* ── Vote Count ── */}
              <div style={styles.voteCountBox}>
                <FaChartBar color="#4f46e5" />
                <span style={{ fontWeight: 700, color: '#1e1b4b', marginLeft: 8 }}>
                  {e.totalVotes} Total Votes
                </span>
              </div>

              {/* ── Candidate Mini List ── */}
              <div style={styles.candidateList}>
                {e.candidates.slice(0, 3).map((c) => (
                  <div key={c._id} style={styles.candidateRow}>
                    <div style={styles.candidateDot} />
                    <span style={styles.candidateName}>{c.name}</span>
                    <span style={styles.candidateParty}>{c.party}</span>
                    <span style={styles.candidateVotes}>{c.voteCount} votes ({c.percentage})</span>
                  </div>
                ))}
                {e.candidates.length > 3 && (
                  <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
                    +{e.candidates.length - 3} more candidates
                  </p>
                )}
              </div>

              {/* ── Actions ── */}
              <div style={styles.cardActions}>
                <Link to={`/results/${e._id}`} style={styles.btnResults}>
                  📊 Results
                </Link>
                <button
                  onClick={() => handleToggleActive(e._id, e.isActive)}
                  style={e.isActive ? styles.btnDeactivate : styles.btnActivate}>
                  {e.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(e._id, e.title)}
                  style={styles.btnDelete}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrap:           { maxWidth: 1100, margin: '0 auto', padding: '40px 20px' },
  pageHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  title:          { fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b' },
  btnCreate:      { background: '#4f46e5', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', fontSize: '0.9rem' },
  empty:          { textAlign: 'center', padding: 60, color: '#888', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' },
  grid:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 },
  card:           { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 14px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 12 },
  cardTop:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:      { fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b' },
  cardDesc:       { fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 },
  dates:          { display: 'flex', flexDirection: 'column', gap: 4 },
  date:           { fontSize: '0.82rem', color: '#555' },
  voteCountBox:   { display: 'flex', alignItems: 'center', background: '#f0f0ff', borderRadius: 8, padding: '8px 12px' },
  candidateList:  { borderTop: '1px solid #f3f4f6', paddingTop: 10 },
  candidateRow:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  candidateDot:   { width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', flexShrink: 0 },
  candidateName:  { fontSize: '0.85rem', fontWeight: 600, color: '#1e1b4b', flex: 1 },
  candidateParty: { fontSize: '0.78rem', color: '#888' },
  candidateVotes: { fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600 },
  cardActions:    { display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap' },
  btnResults:     { flex: 1, textAlign: 'center', background: '#f0f0ff', color: '#4f46e5', padding: '8px 0', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem' },
  btnDeactivate:  { flex: 1, background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  btnActivate:    { flex: 1, background: '#dcfce7', color: '#16a34a', border: 'none', padding: '8px 0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  btnDelete:      { background: '#fee2e2', color: '#dc2626', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default AdminElections;