import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';
import { FaCalendarAlt, FaUsers } from 'react-icons/fa';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/elections');
        setElections(data.elections);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'All'
    ? elections
    : elections.filter((e) => e.status === filter);

  if (loading) return <Loader />;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={styles.title}>🗳️ Elections</h2>
        <p style={{ color: '#888' }}>Browse and participate in active elections</p>
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabs}>
        {['All', 'Active', 'Upcoming', 'Ended'].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{ ...styles.tab, ...(filter === tab ? styles.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Election Cards */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>No elections found.</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((election) => (
            <div key={election._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span className={`badge badge-${election.status.toLowerCase()}`}>
                  {election.status}
                </span>
                <span style={styles.candidateCount}>
                  <FaUsers style={{ marginRight: 4 }} />
                  {election.candidates.length} Candidates
                </span>
              </div>

              <h3 style={styles.cardTitle}>{election.title}</h3>
              <p style={styles.cardDesc}>{election.description || 'No description provided.'}</p>

              <div style={styles.dates}>
                <div style={styles.date}>
                  <FaCalendarAlt color="#4f46e5" style={{ marginRight: 6 }} />
                  <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                </div>
                <div style={styles.date}>
                  <FaCalendarAlt color="#ef4444" style={{ marginRight: 6 }} />
                  <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <Link to={`/elections/${election._id}`} style={styles.btnDetail}>
                  View Details
                </Link>
                {election.status === 'Active' && (
                  <Link to={`/vote/${election._id}`} style={styles.btnVote}>
                    Vote Now →
                  </Link>
                )}
                {election.status === 'Ended' && (
                  <Link to={`/results/${election._id}`} style={styles.btnResults}>
                    View Results
                  </Link>
                )}
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
  header:         { marginBottom: 28, textAlign: 'center' },
  title:          { fontSize: '2rem', fontWeight: 800, color: '#1e1b4b' },
  tabs:           { display: 'flex', gap: 10, marginBottom: 28, justifyContent: 'center', flexWrap: 'wrap' },
  tab:            { padding: '8px 20px', borderRadius: 20, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 },
  tabActive:      { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },
  grid:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 },
  card:           { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 12 },
  cardHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  candidateCount: { fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center' },
  cardTitle:      { fontSize: '1.15rem', fontWeight: 700, color: '#1e1b4b' },
  cardDesc:       { fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.5 },
  dates:          { display: 'flex', flexDirection: 'column', gap: 6 },
  date:           { display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#555' },
  cardFooter:     { display: 'flex', gap: 10, marginTop: 'auto' },
  btnDetail:      { flex: 1, padding: '8px 0', textAlign: 'center', border: '1px solid #4f46e5', color: '#4f46e5', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' },
  btnVote:        { flex: 1, padding: '8px 0', textAlign: 'center', background: '#4f46e5', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' },
  btnResults:     { flex: 1, padding: '8px 0', textAlign: 'center', background: '#f59e0b', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' },
  empty:          { textAlign: 'center', padding: 60, color: '#888', fontSize: '1.1rem' },
};

export default Elections;