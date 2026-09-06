import { Link } from 'react-router-dom';
import { FaVoteYea, FaUserCheck, FaChartBar, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { voter } = useAuth();

  return (
    <div>
      {/* ── Hero ── */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            🗳️ Smart Voting System
          </h1>
          <p style={styles.heroSubtitle}>
            A secure, transparent, and easy-to-use digital voting platform
            for elections, polls, and organizational decisions.
          </p>
          <div style={styles.heroButtons}>
            {voter ? (
              <Link to="/elections" style={styles.btnPrimary}>
                View Elections →
              </Link>
            ) : (
              <>
                <Link to="/register" style={styles.btnPrimary}>Get Started</Link>
                <Link to="/login"    style={styles.btnOutline}>Login</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why SmartVote?</h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureText}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNumber}>{i + 1}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepText}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={styles.cta}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Ready to vote?</h2>
        <p style={{ marginBottom: 24, opacity: 0.9 }}>
          Register now and make your voice count.
        </p>
        <Link to="/register" style={styles.btnWhite}>Register Now →</Link>
      </section>
    </div>
  );
};

const features = [
  { icon: <FaVoteYea size={32} color="#4f46e5" />,   title: 'Easy Voting',       desc: 'Cast your vote in seconds with your unique Voter ID from any device.' },
  { icon: <FaUserCheck size={32} color="#22c55e" />, title: 'Verified Voters',   desc: 'Admin verification ensures only eligible voters can participate.' },
  { icon: <FaChartBar size={32} color="#f59e0b" />,  title: 'Real-Time Results', desc: 'Watch live results update instantly as votes are cast.' },
  { icon: <FaShieldAlt size={32} color="#ef4444" />, title: 'Secure & Fair',     desc: 'One voter, one vote. Double voting is completely prevented.' },
];

const steps = [
  { title: 'Register',       desc: 'Fill in your details, upload your photo and ID proof.' },
  { title: 'Get Verified',   desc: 'Admin reviews and verifies your registration.' },
  { title: 'Receive Voter ID', desc: 'Get your unique Voter ID (e.g. VOT-XXXXXX).' },
  { title: 'Cast Your Vote', desc: 'Login with your Voter ID and vote in active elections.' },
];

const styles = {
  hero: {
    background:     'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color:          '#fff',
    padding:        '80px 20px',
    textAlign:      'center',
  },
  heroContent:  { maxWidth: 700, margin: '0 auto' },
  heroTitle:    { fontSize: '3rem', fontWeight: 800, marginBottom: 16 },
  heroSubtitle: { fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.7, marginBottom: 32 },
  heroButtons:  { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: {
    background: '#fff', color: '#4f46e5', padding: '12px 28px',
    borderRadius: 8, fontWeight: 700, fontSize: '1rem',
  },
  btnOutline: {
    border: '2px solid #fff', color: '#fff', padding: '12px 28px',
    borderRadius: 8, fontWeight: 700, fontSize: '1rem',
  },
  features:     { padding: '60px 20px', maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: 40, color: '#1e1b4b' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 },
  featureCard: {
    background: '#fff', borderRadius: 12, padding: '28px 20px',
    textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    transition: 'transform 0.2s',
  },
  featureIcon:  { marginBottom: 14 },
  featureTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#1e1b4b' },
  featureText:  { fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 },
  howItWorks:   { background: '#f0f0ff', padding: '60px 20px' },
  stepsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 24, maxWidth: 1000, margin: '0 auto',
  },
  stepCard:   { background: '#fff', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  stepNumber: {
    width: 44, height: 44, borderRadius: '50%', background: '#4f46e5',
    color: '#fff', fontSize: '1.2rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
  },
  stepTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: '#1e1b4b' },
  stepText:  { fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.6 },
  cta: {
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff', textAlign: 'center', padding: '60px 20px',
  },
  btnWhite: {
    background: '#fff', color: '#4f46e5', padding: '12px 32px',
    borderRadius: 8, fontWeight: 700, fontSize: '1rem',
  },
};

export default Home;