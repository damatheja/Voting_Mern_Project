import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaUpload } from 'react-icons/fa';

const CreateElection = () => {
  const navigate = useNavigate();
  const secret   = localStorage.getItem('adminSecret');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    startDate:   '',
    endDate:     '',
  });

  const [candidates, setCandidates] = useState([
    { name: '', party: '', description: '', image: null, preview: null },
  ]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCandidateChange = (i, field, value) => {
    const updated = [...candidates];
    updated[i][field] = value;
    setCandidates(updated);
  };

  const handleCandidateImage = (i, file) => {
    const updated = [...candidates];
    updated[i].image   = file;
    updated[i].preview = URL.createObjectURL(file);
    setCandidates(updated);
  };

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', party: '', description: '', image: null, preview: null }]);
  };

  const removeCandidate = (i) => {
    if (candidates.length === 1) return toast.error('At least one candidate required');
    setCandidates(candidates.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return toast.error('End date must be after start date');
    }
    if (candidates.some((c) => !c.name.trim())) {
      return toast.error('All candidates must have a name');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('adminSecret',  secret);
      formData.append('title',        form.title);
      formData.append('description',  form.description);
      formData.append('startDate',    form.startDate);
      formData.append('endDate',      form.endDate);

      // Candidates as JSON
      formData.append('candidates', JSON.stringify(
        candidates.map(({ name, party, description }) => ({ name, party, description }))
      ));

      // Candidate images
      candidates.forEach((c, i) => {
        if (c.image) formData.append(`candidateImage_${i}`, c.image);
      });

      await API.post('/elections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('✅ Election created!');
      navigate('/admin/elections');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>➕ Create New Election</h2>
        <p style={styles.subtitle}>Fill in the details and add candidates</p>

        <form onSubmit={handleSubmit}>

          {/* ── Election Info ── */}
          <h3 style={styles.sectionHead}>📋 Election Details</h3>
          <div className="form-group">
            <label>Election Title *</label>
            <input name="title" value={form.title}
              onChange={handleFormChange} placeholder="e.g. Karnataka CM Election 2026" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description}
              onChange={handleFormChange} placeholder="Brief description..."
              rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={styles.grid2}>
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input type="datetime-local" name="startDate"
                value={form.startDate} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>End Date & Time *</label>
              <input type="datetime-local" name="endDate"
                value={form.endDate} onChange={handleFormChange} required />
            </div>
          </div>

          {/* ── Candidates ── */}
          <h3 style={styles.sectionHead}>👤 Candidates</h3>
          {candidates.map((c, i) => (
            <div key={i} style={styles.candidateCard}>
              <div style={styles.candidateHeader}>
                <h4 style={styles.candidateNum}>Candidate {i + 1}</h4>
                <button type="button" onClick={() => removeCandidate(i)} style={styles.btnRemove}>
                  <FaTrash size={12} /> Remove
                </button>
              </div>

              <div style={styles.candidateForm}>
                {/* Image Upload */}
                <div style={styles.imgUploadWrap}>
                  <div style={styles.imgPreview}>
                    {c.preview
                      ? <img src={c.preview} alt="" style={styles.previewImg} />
                      : <FaUpload size={20} color="#aaa" />
                    }
                  </div>
                  <label style={styles.uploadBtn}>
                    Upload Photo
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => handleCandidateImage(i, e.target.files[0])} />
                  </label>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.grid2}>
                    <div className="form-group">
                      <label>Name *</label>
                      <input value={c.name} onChange={(e) => handleCandidateChange(i, 'name', e.target.value)}
                        placeholder="Candidate name" required />
                    </div>
                    <div className="form-group">
                      <label>Party</label>
                      <input value={c.party} onChange={(e) => handleCandidateChange(i, 'party', e.target.value)}
                        placeholder="Party name" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input value={c.description}
                      onChange={(e) => handleCandidateChange(i, 'description', e.target.value)}
                      placeholder="Short bio or manifesto" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addCandidate} style={styles.btnAdd}>
            <FaPlus style={{ marginRight: 6 }} /> Add Another Candidate
          </button>

          <button type="submit" className="btn-primary"
            disabled={loading} style={{ marginTop: 24 }}>
            {loading ? 'Creating...' : '🗳️ Create Election'}
          </button>

        </form>
      </div>
    </div>
  );
};

const styles = {
  wrap:            { maxWidth: 800, margin: '0 auto', padding: '40px 20px' },
  card:            { background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title:           { fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: 6 },
  subtitle:        { color: '#888', marginBottom: 28, fontSize: '0.95rem' },
  sectionHead:     { fontSize: '1rem', fontWeight: 700, color: '#4f46e5', margin: '24px 0 14px', borderBottom: '2px solid #ede9fe', paddingBottom: 6 },
  grid2:           { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' },
  candidateCard:   { background: '#f9f9ff', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid #ede9fe' },
  candidateHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  candidateNum:    { fontWeight: 700, color: '#4f46e5' },
  btnRemove:       { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 },
  candidateForm:   { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' },
  imgUploadWrap:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  imgPreview:      { width: 80, height: 80, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #c4b5fd' },
  previewImg:      { width: '100%', height: '100%', objectFit: 'cover' },
  uploadBtn:       { background: '#4f46e5', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  btnAdd:          { background: '#f0f0ff', color: '#4f46e5', border: '2px dashed #c4b5fd', width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
};

export default CreateElection;