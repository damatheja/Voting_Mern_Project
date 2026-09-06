import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCheckCircle } from 'react-icons/fa';

const Vote = () => {
  const { id }       = useParams();
  const { voter }    = useAuth();
  const navigate     = useNavigate();

  const [election,   setElection]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const { data } = await API.get(`/elections/${id}`);
        if (data.election.status !== 'Active') {
          toast.error('This election is not active');
          navigate('/elections');
          return;
        }

        // Check already voted
        if (voter) {
          const check = await API.get(`/vote/check/${voter.voterId}/${id}`);
          if (check.data.hasVoted) {
            toast.error('You have already voted in this election');
            navigate(`/elections/${id}`);
            return;
          }
        }

        setElection(data.election);
      } catch (err) {
        toast.error('Election not found');
        navigate('/elections');
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [id]);

  const handleSubmit = async () => {
    if (!selected) return toast.error('Please select a candidate');
    setSubmitting(true);
    try {
      await API.post('/vote', {
        voterId:     voter.voterId,
        electionId:  id,
        candidateId: selected._id,
      });
      setSuccess(true);
      toast.success('✅ Vote cast successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  // ── Success Screen ──
  if (success) {
    return (
      <div style={styles.centerWrap}>
        <div style={styles.successCard}>
          <FaCheckCircle size={60} color="#22c55e" />
          <h2 style={{ color: '#22c55e', margin: '16px 0 8px' }}>Vote Cast Successfully!</h2>
          <p style={{ color: '#555', marginBottom: 8 }}>You voted for:</p>
          <div style={styles.votedForBox}>
            {selected.image
              ? <img src={`http://localhost:5000/${selected.image}`} alt="" style={styles.vfImg} />
              : <div style={styles.vfPlaceholder}>{selected.name.charAt(0)}</div>
            }
            <div>
              <h3 style={{ color: '#1e1b4b' }}>{selected.name}</h3>
              <span style={styles.party}>{selected.party}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
            <button onClick={() => navigate(`/results/${id}`)} style={styles.btnResults}>
              📊 View Results
            </button>
            <button onClick={() => navigate('/elections')} style={styles.btnBack}>
              Back to Elections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topCard}>
        <h2 style={styles.title}>🗳️ Cast Your Vote</h2>
        <h3 style={{ color: '#4f46e5', marginTop: 6 }}>{election.title}</h3>
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 4 }}>
          Select one candidate and confirm your vote. This cannot be undone.
        </p>
      </div>

      {/* ── Candidate Selection ── */}
      <h3 style={styles.sectionTitle}>Select a Candidate</h3>
      <div style={styles.grid}>
        {election.candidates.map((candidate) => {
          const isSelected = selected?._id === candidate._id;
          return (
            <div
              key={candidate._id}
              onClick={() => { setSelected(candidate); setConfirmed(false); }}
              style={{
                ...styles.candidateCard,
                ...(isSelected ? styles.candidateCardSelected : {}),
              }}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div style={styles.checkmark}>
                  <FaCheckCircle size={22} color="#4f46e5" />
                </div>
              )}

              <div style={styles.imgWrap}>
                {candidate.image
                  ? <img src={`http://localhost:5000/${candidate.image}`}
                      alt={candidate.name} style={styles.img} />
                  : <div style={styles.imgPlaceholder}>{candidate.name.charAt(0)}</div>
                }
              </div>

              <h3 style={styles.candidateName}>{candidate.name}</h3>
              {candidate.party && <span style={styles.party}>{candidate.party}</span>}
              {candidate.description && (
                <p style={styles.candidateDesc}>{candidate.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Confirm Section ── */}
      {selected && !confirmed && (
        <div style={styles.confirmBox}>
          <p style={{ color: '#555', marginBottom: 14 }}>
            You selected <strong>{selected.name}</strong> ({selected.party}).
            Are you sure?
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setConfirmed(true)} style={styles.btnConfirm}>
              ✅ Yes, Confirm Vote
            </button>
            <button onClick={() => setSelected(null)} style={styles.btnCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Final Submit ── */}
      {confirmed && (
        <div style={{ ...styles.confirmBox, background: '#fef9c3', border: '1px solid #fde047' }}>
          <p style={{ color: '#854d0e', marginBottom: 14, fontWeight: 600 }}>
            ⚠️ This action is irreversible. Once submitted, you cannot change your vote.
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={styles.btnSubmit}
          >
            {submitting ? 'Submitting...' : '🗳️ Submit My Vote'}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrap:                  { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  centerWrap:            { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: 20 },
  topCard:               { background: '#fff', borderRadius: 14, padding: '24px 28px', marginBottom: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textAlign: 'center' },
  title:                 { fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b' },
  sectionTitle:          { fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b', marginBottom: 16 },
  grid:                  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 28 },
  candidateCard:         { background: '#fff', borderRadius: 14, padding: 24, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', cursor: 'pointer', position: 'relative', border: '2px solid transparent', transition: 'all 0.2s' },
  candidateCardSelected: { border: '2px solid #4f46e5', background: '#f5f3ff', transform: 'scale(1.02)' },
  checkmark:             { position: 'absolute', top: 12, right: 12 },
  imgWrap:               { marginBottom: 14 },
  img:                   { width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #ede9fe' },
  imgPlaceholder:        { width: 90, height: 90, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  candidateName:         { fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b', marginBottom: 6 },
  party:                 { display: 'inline-block', background: '#ede9fe', color: '#4f46e5', padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 },
  candidateDesc:         { fontSize: '0.85rem', color: '#6b7280', marginTop: 8, lineHeight: 1.5 },
  confirmBox:            { background: '#f0f0ff', borderRadius: 12, padding: '20px 24px', textAlign: 'center', border: '1px solid #c7d2fe', marginBottom: 20 },
  btnConfirm:            { background: '#22c55e', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' },
  btnCancel:             { background: '#f3f4f6', color: '#555', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  btnSubmit:             { background: '#4f46e5', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', width: '100%' },
  successCard:           { background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: 440, width: '100%' },
  votedForBox:           { display: 'flex', alignItems: 'center', gap: 16, background: '#f0f0ff', borderRadius: 12, padding: '16px 20px', margin: '16px 0', textAlign: 'left' },
  vfImg:                 { width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' },
  vfPlaceholder:         { width: 60, height: 60, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  btnResults:            { background: '#f59e0b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  btnBack:               { background: '#f3f4f6', color: '#555', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
};

export default Vote;