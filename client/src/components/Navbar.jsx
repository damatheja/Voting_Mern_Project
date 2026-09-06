import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaVoteYea, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const Navbar = () => {
  const { voter, isAdmin, logoutVoter, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (isAdmin) {
      logoutAdmin();
      toast.success('Admin logged out');
      navigate('/admin/login');
    } else {
      logoutVoter();
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <FaVoteYea style={{ marginRight: 8 }} />
        SmartVote
      </Link>

      <div style={styles.links}>
        <Link to="/elections" style={styles.link}>Elections</Link>

        {voter && !isAdmin && (
          <>
            <Link to="/profile" style={styles.link}>
              <FaUser style={{ marginRight: 4 }} /> Profile
            </Link>
          </>
        )}

        {isAdmin && (
          <Link to="/admin/dashboard" style={styles.link}>
            <FaTachometerAlt style={{ marginRight: 4 }} /> Dashboard
          </Link>
        )}

        {voter || isAdmin ? (
          <button onClick={handleLogout} style={styles.btn}>
            <FaSignOutAlt style={{ marginRight: 4 }} /> Logout
          </button>
        ) : (
          <>
            <Link to="/login"    style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btnOutline}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display:         'flex',
    justifyContent:  'space-between',
    alignItems:      'center',
    padding:         '14px 40px',
    background:      '#4f46e5',
    color:           '#fff',
    boxShadow:       '0 2px 8px rgba(0,0,0,0.15)',
    position:        'sticky',
    top:             0,
    zIndex:          100,
  },
  brand: {
    color:          '#fff',
    textDecoration: 'none',
    fontSize:       '1.4rem',
    fontWeight:     700,
    display:        'flex',
    alignItems:     'center',
  },
  links: {
    display:    'flex',
    alignItems: 'center',
    gap:        '20px',
  },
  link: {
    color:          '#fff',
    textDecoration: 'none',
    fontSize:       '0.95rem',
    display:        'flex',
    alignItems:     'center',
  },
  btn: {
    background:    'transparent',
    border:        '1px solid #fff',
    color:         '#fff',
    padding:       '6px 14px',
    borderRadius:  '6px',
    cursor:        'pointer',
    display:       'flex',
    alignItems:    'center',
    fontSize:      '0.9rem',
  },
  btnOutline: {
    background:     '#fff',
    color:          '#4f46e5',
    padding:        '6px 14px',
    borderRadius:   '6px',
    textDecoration: 'none',
    fontWeight:     600,
    fontSize:       '0.9rem',
  },
};

export default Navbar;