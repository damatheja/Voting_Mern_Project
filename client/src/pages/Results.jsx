import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';
import { FaTrophy, FaVoteYea } from 'react-icons/fa';

const Results = () => {
  const { id } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await API.get(`/vote/results/${id}`);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();

    // Auto refresh every 10 seconds if election is active
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Loader />;
  if (!data)   return <div style={{ textAlign: 'center', padding: 60 }}>Results not found</div>;

  const { election, totalVotes, leader, results } = data;

  return (
    <div style={styles.wrap}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <span className={`badge badge-${election.status.toLowerCase()}`}
          style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
          {election.status}
        </span>
        <h1 style={styles.title}>{election.title}</h1>
        <div style={styles.totalVotes}>
          <FaVoteYea color="#4f46e5" size={20} />
          <span>Total Votes: <strong>{totalVotes}</strong></span>
        </div>
        {election.status === 'Active' && (
          <p style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: 6 }}>
            🔄 Results auto-refresh every 10 seconds
          </p>
        )}
      </div>

      {/* ── Leader Card ── */}
      {leader && totalVotes > 0 && (
        <div style={styles.leaderCard}>
          <FaTrophy size={32} color="#f59e0b" />
          <div style={styles.leaderInfo}>
            <p style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: 2 }}>
              {election.status === 'Ended' ? '🏆 Winner' : '🏆 Currently Leading'}
            </p>
            <h2 style={{ color: '#1e1b4b', fontSize: '1.5rem' }}>{leader.name}</h2>
            <span style={styles.party}>{leader.party}</span>
          </div>
          <div style={styles.leaderStats}>
            <span style={styles.leaderVotes}>{leader.voteCount}</span>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>votes</span>
            <span style={styles.leaderPct}>{leader.percentage}</span>
          </div>
        </div>
      )}

      {/* ── Results Bars ── */}
      <div style={styles.resultsSection}>
        <h2 style={styles.sectionTitle}>📊 Full Results</h2>

        {totalVotes === 0 ? (
          <div style={styles.noVotes}>No votes cast yet.</div>
        ) : (
          results.map((r, index) => {
            const pct = parseFloat(r.percentage);
            const isLeader = index === 0 && totalVotes > 0;

            return (
              <div key={r.candidateId} style={styles.resultRow}>
                <div style={styles.resultHeader}>
                  <div style={styles.candidateInfo}>
                    {r.image
                      ? <img src={`http://localhost:5000/${r.image}`}
                          alt={r.name} style={styles.avatar} />
                      : <div style={{
                          ...styles.avatarPlaceholder,
                          background: isLeader ? '#f59e0b' : '#4f46e5'
                        }}>
                          {r.name.charAt(0)}
                        </div>
                    }
                    <div>
                      <div style={styles.resultName}>
                        {isLeader && <FaTrophy color="#f59e0b" style={{ marginRight: 6 }} />}
                        {r.name}
                      </div>
                      <span style={styles.party}>{r.party}</span>
                    </div>
                  </div>
                  <div style={styles.resultNumbers}>
                    <span style={styles.voteCount}>{r.voteCount} votes</span>
                    <span style={styles.percentage}>{r.percentage}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={styles.barTrack}>
                  <div style={{
                    ...styles.barFill,
                    width:      `${pct}%`,
                    background: isLeader
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Actions ── */}
      <div style={styles.actions}>
        <Link to={`/elections/${id}`} style={styles.btnBack}>← Election Details</Link>
        <Link to="/elections"         style={styles.btnElections}>All Elections</Link>
      </div>

    </div>
  );
};

const styles = {
  wrap:            { maxWidth: 800, margin: '0 auto', padding: '40px 20px' },
  header:          { background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center' },
  title:           { fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b', margin: '12px 0 10px' },
  totalVotes:      { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1rem', color: '#555' },
  leaderCard:      { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 14, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 12px rgba(245,158,11,0.2)', flexWrap: 'wrap' },
  leaderInfo:      { flex: 1 },
  leaderStats:     { textAlign: 'center' },
  leaderVotes:     { display: 'block', fontSize: '2rem', fontWeight: 800, color: '#1e1b4b' },
  leaderPct:       { display: 'block', fontSize: '1.2rem', fontWeight: 700, color: '#92400e' },
  party:           { display: 'inline-block', background: '#ede9fe', color: '#4f46e5', padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 },
  resultsSection:  { background: '#fff', borderRadius: 16, padding: '28px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 24 },
  sectionTitle:    { fontSize: '1.2rem', fontWeight: 700, color: '#1e1b4b', marginBottom: 20 },
  noVotes:         { textAlign: 'center', padding: '30px 0', color: '#888' },
  resultRow:       { marginBottom: 24 },
  resultHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 },
  candidateInfo:   { display: 'flex', alignItems: 'center', gap: 12 },
  avatar:          { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede9fe' },
  avatarPlaceholder:{ width: 48, height: 48, borderRadius: '50%', color: '#fff', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resultName:      { fontWeight: 700, color: '#1e1b4b', fontSize: '1rem', display: 'flex', alignItems: 'center' },
  resultNumbers:   { textAlign: 'right' },
  voteCount:       { display: 'block', fontWeight: 700, color: '#1e1b4b' },
  percentage:      { display: 'block', color: '#888', fontSize: '0.9rem' },
  barTrack:        { height: 14, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: 8, transition: 'width 0.8s ease' },
  actions:         { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' },
  btnBack:         { border: '1px solid #ddd', color: '#555', padding: '10px 24px', borderRadius: 8, fontWeight: 600 },
  btnElections:    { background: '#4f46e5', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 600 },
};

export default Results;