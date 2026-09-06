import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ElectionDetail = () => {
  const { id } = useParams();
  const { voter } = useAuth();
  const navigate  = useNavigate();

  const [election,   setElection]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [hasVoted,   setHasVoted]   = useState(false);
  const [votedFor,   setVotedFor]   = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get(`/elections/${id}`);
        setElection(data.election);

        // Check if voter already voted
        if (voter) {
          const voteCheck = await API.get(`/vote/check/${voter.voterId}/${id}`);
          setHasVoted(voteCheck.data.hasVoted);
          setVotedFor(voteCheck.data.votedFor);
        }
      } catch (err) {
        toast.error('Election not found');
        navigate('/elections');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loader />;
  if (!election) return null;

  const isActive = election.status === 'Active';

  return (
    <div style={styles.wrap}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <span className={`badge badge-${election.status.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
          {election.status}
        </span>
        <h1 style={styles.title}>{election.title}</h1>
        <p style={styles.desc}>{election.description}</p>

        <div style={styles.metaRow}>
          <div style={styles.meta}>
            <FaCalendarAlt color="#4f46e5" />
            <span>Start: {new Date(election.startDate).toLocaleString()}</span>
          </div>
          <div style={styles.meta}>
            <FaCalendarAlt color="#ef4444" />
            <span>End: {new Date(election.endDate).toLocaleString()}</span>
          </div>
          <div style={styles.meta}>
            <FaUsers color="#22c55e" />
            <span>{election.candidates.length} Candidates</span>
          </div>
        </div>
      </div>

      {/* ── Already Voted Banner ── */}
      {hasVoted && (
        <div style={styles.votedBanner}>
          <FaCheckCircle size={20} color="#22c55e" />
          <span>
            You already voted for <strong>{votedFor?.name}</strong> ({votedFor?.party})
          </span>
        </div>
      )}

      {/* ── Candidates ── */}
      <h2 style={styles.sectionTitle}>
        <FaUsers style={{ marginRight: 8 }} /> Candidates
      </h2>

      <div style={styles.grid}>
        {election.candidates.map((candidate) => (
          <div key={candidate._id} style={styles.card}>
            <div style={styles.candidateImg}>
              {candidate.image
                ? <img src={`http://localhost:5000/${candidate.image}`}
                    alt={candidate.name} style={styles.img} />
                : <div style={styles.imgPlaceholder}>
                    {candidate.name.charAt(0)}
                  </div>
              }
            </div>
            <h3 style={styles.candidateName}>{candidate.name}</h3>
            {candidate.party && (
              <span style={styles.party}>{candidate.party}</span>
            )}
            {candidate.description && (
              <p style={styles.candidateDesc}>{candidate.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Action Buttons ── */}
      <div style={styles.actions}>
        {isActive && !hasVoted && voter && (
          <Link to={`/vote/${election._id}`} style={styles.btnVote}>
            🗳️ Cast Your Vote
          </Link>
        )}
        {isActive && !voter && (
          <Link to="/login" style={styles.btnVote}>
            Login to Vote →
          </Link>
        )}
        {(election.status === 'Ended' || hasVoted) && (
          <Link to={`/results/${election._id}`} style={styles.btnResults}>
            📊 View Results
          </Link>
        )}
        <Link to="/elections" style={styles.btnBack}>
          ← Back to Elections
        </Link>
      </div>

    </div>
  );
};

const styles = {
  wrap:            { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  header:          { background: '#fff', borderRadius: 16, padding: 32, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center' },
  title:           { fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', margin: '12px 0 8px' },
  desc:            { color: '#6b7280', fontSize: '1rem', lineHeight: 1.6, marginBottom: 20 },
  metaRow:         { display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' },
  meta:            { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#555' },
  votedBanner:     { background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, color: '#166534', fontWeight: 500 },
  sectionTitle:    { fontSize: '1.3rem', fontWeight: 700, color: '#1e1b4b', marginBottom: 20, display: 'flex', alignItems: 'center' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 },
  card:            { background: '#fff', borderRadius: 14, padding: 24, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'transform 0.2s' },
  candidateImg:    { marginBottom: 14 },
  img:             { width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #ede9fe' },
  imgPlaceholder:  { width: 90, height: 90, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  candidateName:   { fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b', marginBottom: 6 },
  party:           { display: 'inline-block', background: '#ede9fe', color: '#4f46e5', padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 },
  candidateDesc:   { fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 },
  actions:         { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  btnVote:         { background: '#4f46e5', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem' },
  btnResults:      { background: '#f59e0b', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem' },
  btnBack:         { border: '1px solid #ddd', color: '#555', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: '1rem' },
};

export default ElectionDetail;