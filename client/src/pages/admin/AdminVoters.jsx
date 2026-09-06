import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa';

const AdminVoters = () => {
  const [voters,   setVoters]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [selected, setSelected] = useState(null);
  const secret = localStorage.getItem('adminSecret');
  const limit  = 8;

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/voters', {
        headers: { 'admin-secret': secret },
        params:  { status: filter === 'all' ? '' : filter, search, page, limit },
      });
      setVoters(data.voters);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVoters(); }, [filter, search, page]);

  const handleVerify = async (id, name) => {
    try {
      await API.patch(`/admin/voters/${id}/verify`, {}, { headers: { 'admin-secret': secret } });
      toast.success(`✅ ${name} verified`);
      fetchVoters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject and delete ${name}'s registration?`)) return;
    try {
      await API.delete(`/admin/voters/${id}/reject`, { headers: { 'admin-secret': secret } });
      toast.success(`🗑️ ${name} rejected`);
      fetchVoters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleToggle = async (id, name, isActive) => {
    try {
      await API.patch(`/admin/voters/${id}/toggle`, {}, { headers: { 'admin-secret': secret } });
      toast.success(`${isActive ? '🚫 Deactivated' : '✅ Activated'} ${name}`);
      fetchVoters();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={styles.wrap}>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>👥 Voter Management</h2>
          <p style={{ color: '#888', marginTop: 4 }}>Total: {total} voters</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <FaSearch color="#aaa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email or Voter ID..."
            style={styles.searchInput}
          />
        </div>
        <div style={styles.tabs}>
          {['all', 'verified', 'pending', 'deactivated'].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? <Loader /> : (
        <>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Voter</th>
                  <th style={styles.th}>Voter ID</th>
                  <th style={styles.th}>Contact</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>ID Proof</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {voters.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                      No voters found
                    </td>
                  </tr>
                ) : voters.map((v) => (
                  <tr key={v._id} style={styles.tr}>
                    {/* Voter Info */}
                    <td style={styles.td}>
                      <div style={styles.voterCell}>
                        {v.profileImage
                          ? <img src={`http://localhost:5000/${v.profileImage}`}
                              alt="" style={styles.avatar} />
                          : <div style={styles.avatarPlaceholder}>
                              {v.name.charAt(0)}
                            </div>
                        }
                        <div>
                          <p style={styles.voterName}>{v.name}</p>
                          <p style={styles.voterSub}>{v.gender} • {new Date(v.dob).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>

                    {/* Voter ID */}
                    <td style={styles.td}>
                      <span style={styles.voterIdTag}>{v.voterId}</span>
                    </td>

                    {/* Contact */}
                    <td style={styles.td}>
                      <p style={{ fontSize: '0.85rem' }}>{v.email}</p>
                      <p style={{ fontSize: '0.85rem', color: '#888' }}>{v.phone}</p>
                    </td>

                    {/* Location */}
                    <td style={styles.td}>
                      <p style={{ fontSize: '0.85rem' }}>{v.address?.city}, {v.address?.state}</p>
                      <p style={{ fontSize: '0.82rem', color: '#888' }}>{v.address?.pincode}</p>
                    </td>

                    {/* ID Proof */}
                    <td style={styles.td}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.idProofType}</p>
                      {v.idProof && (
                        <a href={`http://localhost:5000/${v.idProof}`} target="_blank"
                          rel="noreferrer" style={{ fontSize: '0.78rem', color: '#4f46e5' }}>
                          View Proof
                        </a>
                      )}
                    </td>

                    {/* Status */}
                    <td style={styles.td}>
                      {v.isVerified
                        ? <span className="badge badge-active">Verified</span>
                        : <span className="badge badge-pending">Pending</span>
                      }
                      {!v.isActive && (
                        <span className="badge badge-ended" style={{ marginLeft: 4 }}>Inactive</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {!v.isVerified && (
                          <>
                            <button onClick={() => handleVerify(v._id, v.name)}
                              style={styles.btnVerify} title="Verify">
                              <FaCheck />
                            </button>
                            <button onClick={() => handleReject(v._id, v.name)}
                              style={styles.btnReject} title="Reject">
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {v.isVerified && (
                          <button onClick={() => handleToggle(v._id, v.name, v.isActive)}
                            style={styles.btnToggle} title={v.isActive ? 'Deactivate' : 'Activate'}>
                            {v.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                          </button>
                        )}
                        <button onClick={() => setSelected(v)} style={styles.btnView}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div style={styles.pagination}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1} style={styles.pageBtn}>← Prev</button>
            <span style={{ color: '#555', fontSize: '0.9rem' }}>
              Page {page} of {totalPages || 1}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages} style={styles.pageBtn}>Next →</button>
          </div>
        </>
      )}

      {/* ── Voter Detail Modal ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {selected.profileImage
                ? <img src={`http://localhost:5000/${selected.profileImage}`}
                    alt="" style={styles.modalAvatar} />
                : <div style={styles.modalAvatarPh}>{selected.name.charAt(0)}</div>
              }
              <h3 style={{ color: '#1e1b4b', marginTop: 10 }}>{selected.name}</h3>
              <span style={styles.voterIdTag}>{selected.voterId}</span>
            </div>
            <div style={styles.modalGrid}>
              <ModalItem label="Email"        value={selected.email} />
              <ModalItem label="Phone"        value={selected.phone} />
              <ModalItem label="Gender"       value={selected.gender} />
              <ModalItem label="DOB"          value={new Date(selected.dob).toLocaleDateString()} />
              <ModalItem label="Street"       value={selected.address?.street} />
              <ModalItem label="City"         value={selected.address?.city} />
              <ModalItem label="State"        value={selected.address?.state} />
              <ModalItem label="Pincode"      value={selected.address?.pincode} />
              <ModalItem label="ID Type"      value={selected.idProofType} />
              <ModalItem label="Votes Cast"   value={selected.hasVoted?.length} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalItem = ({ label, value }) => (
  <div style={{ marginBottom: 12 }}>
    <p style={{ fontSize: '0.75rem', color: '#888' }}>{label}</p>
    <p style={{ fontWeight: 600, color: '#1e1b4b', fontSize: '0.9rem' }}>{value || '—'}</p>
  </div>
);

const styles = {
  wrap:             { maxWidth: 1200, margin: '0 auto', padding: '40px 20px' },
  pageHeader:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title:            { fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b' },
  toolbar:          { display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap:       { position: 'relative', flex: 1, minWidth: 220 },
  searchInput:      { width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.9rem', outline: 'none' },
  tabs:             { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab:              { padding: '8px 16px', borderRadius: 20, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  tabActive:        { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },
  tableWrap:        { background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflowX: 'auto', marginBottom: 16 },
  table:            { width: '100%', borderCollapse: 'collapse' },
  thead:            { background: '#f9fafb' },
  th:               { padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', color: '#888', fontWeight: 600 },
  tr:               { borderBottom: '1px solid #f3f4f6' },
  td:               { padding: '14px', fontSize: '0.88rem', verticalAlign: 'middle' },
  voterCell:        { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:           { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede9fe' },
  avatarPlaceholder:{ width: 40, height: 40, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  voterName:        { fontWeight: 600, color: '#1e1b4b', fontSize: '0.9rem' },
  voterSub:         { fontSize: '0.78rem', color: '#888', marginTop: 2 },
  voterIdTag:       { background: '#ede9fe', color: '#4f46e5', padding: '3px 8px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 },
  actions:          { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  btnVerify:        { background: '#dcfce7', color: '#16a34a', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnReject:        { background: '#fee2e2', color: '#dc2626', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnToggle:        { background: '#dbeafe', color: '#2563eb', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnView:          { background: '#f3f4f6', color: '#555', border: 'none', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  pagination:       { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, padding: '16px 0' },
  pageBtn:          { background: '#fff', border: '1px solid #ddd', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  overlay:          { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
  modal:            { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
  closeBtn:         { position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' },
  modalAvatar:      { width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #ede9fe' },
  modalAvatarPh:    { width: 90, height: 90, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  modalGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' },
};

export default AdminVoters;