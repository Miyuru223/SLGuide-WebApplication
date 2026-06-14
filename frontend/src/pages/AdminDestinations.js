import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import API, { getImageUrl } from '../utils/api';
import { showToast } from '../components/Toast';

const CATEGORIES = ['Ancient City', 'Temple', 'Natural Wonder', 'Beach', 'Fort', 'Museum', 'Cultural Site', 'Wildlife'];

const emptyForm = {
  name: '', location: '', district: '', category: 'Temple',
  description: '', history: '', entryFee: '', openingHours: '',
  bestTimeToVisit: '', mapUrl: '', featured: false
};

const editorStyles = `
  .rich-editor-wrap {
    border: 1.5px solid #e8e0d0;
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;
    background: white;
  }
  .rich-editor-wrap:focus-within {
    border-color: #1a5c38;
    box-shadow: 0 0 0 3px rgba(26,92,56,0.08);
  }
  .rich-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 0.4rem 0.6rem;
    background: #f9f9f7;
    border-bottom: 1px solid #e8e0d0;
  }
  .rich-toolbar button {
    background: none;
    border: 1px solid transparent;
    border-radius: 5px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: #444;
    font-family: DM Sans, sans-serif;
    transition: all 0.15s;
    min-width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rich-toolbar button:hover {
    background: #e8f5ee;
    border-color: #c8e6d4;
    color: #1a5c38;
  }
  .rich-toolbar button.active {
    background: #1a5c38;
    color: white;
    border-color: #1a5c38;
  }
  .rich-toolbar .divider {
    width: 1px;
    background: #e8e0d0;
    margin: 2px 3px;
    align-self: stretch;
  }
  .rich-content {
    min-height: 130px;
    padding: 0.8rem 1rem;
    outline: none;
    font-family: DM Sans, sans-serif;
    font-size: 0.9rem;
    line-height: 1.7;
    color: #1a1a1a;
  }
  .rich-content:empty::before {
    content: attr(data-placeholder);
    color: #aaa;
    pointer-events: none;
  }
  .rich-content ul, .rich-content ol { padding-left: 1.4rem; }
  .rich-content b, .rich-content strong { font-weight: 700; }
  .rich-content i, .rich-content em { font-style: italic; }
  .rich-content u { text-decoration: underline; }
  .rich-content h3 { font-size: 1rem; font-weight: 700; margin: 0.5rem 0 0.2rem; font-family: Playfair Display, serif; color: #0f3d24; }

  /* Map URL field */
  .map-input-wrap { position: relative; }
  .map-input-wrap .form-control { padding-right: 5.5rem; }
  .map-preview-btn {
    position: absolute; right: 0.5rem; top: 50%;
    transform: translateY(-50%);
    background: #1a5c38; color: white; border: none;
    border-radius: 6px; padding: 0.25rem 0.7rem;
    font-size: 0.72rem; cursor: pointer;
    font-family: DM Sans, sans-serif; font-weight: 600;
    transition: background 0.2s; white-space: nowrap;
    text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;
  }
  .map-preview-btn:hover { background: #0f3d24; }
  .map-hint {
    font-size: 0.72rem; color: #aaa;
    margin-top: 0.35rem; line-height: 1.6;
    background: #f8fbf9; border: 1px solid #e8f5ee;
    border-radius: 7px; padding: 0.5rem 0.7rem;
  }
  .map-hint code {
    background: #e8f5ee; color: #1a5c38;
    padding: 0 5px; border-radius: 3px; font-size: 0.7rem;
  }
`;

const pageStyles = `
  .admin-layout { display:flex; min-height:100vh; font-family: DM Sans, sans-serif; background: #f6f6f6; color: #111; }
  .admin-main { flex:1; padding:28px; }
  .admin-topbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
  .search-input { padding:8px 12px; border:1px solid #e8e0e0; border-radius:8px; background: #fff; outline:none; }
  .admin-content { padding-top:8px; }
  .admin-table-wrap { background:white; border-radius:10px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
  .admin-table-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .btn-add { background:#1a5c38; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; }
  table { width:100%; border-collapse:collapse; }
  th, td { padding:10px 8px; text-align:left; border-bottom:1px solid #f6f6f6; vertical-align:middle; }
  .table-img { width:48px; height:48px; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid #eee; }
  .table-img img { width:100%; height:100%; object-fit:cover; display:block; }
  .card-tag { background:#eef7ef; color:#1a5c38; padding:4px 8px; border-radius:999px; font-size:0.8rem; font-weight:700; }
  .btn-edit, .btn-delete, .btn-close, .btn-save, .btn-cancel { padding:6px 10px; border-radius:6px; border:1px solid transparent; cursor:pointer; margin-right:6px; }
  .btn-edit { background:#fff; border:1px solid #cfead9; color:#1a5c38; }
  .btn-delete { background:#fff; border:1px solid #f2c4c4; color:#b00020; }
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
  .modal { background:white; width:820px; max-width:100%; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.12); overflow:hidden; display:flex; flex-direction:column; max-height:90vh; }
  .modal-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f0f0f0; }
  .modal-body { padding:16px 20px; overflow:auto; }
  .modal-footer { padding:12px 20px; border-top:1px solid #f0f0f0; display:flex; justify-content:flex-end; gap:8px; }
  .form-row { display:flex; gap:12px; }
  .form-group { flex:1; display:flex; flex-direction:column; margin-bottom:12px; }
  .form-label { font-size:0.85rem; margin-bottom:6px; color:#333; font-weight:600; }
  .form-control { padding:8px 10px; border:1px solid #e8e0d0; border-radius:8px; font-size:0.95rem; outline:none; transition: border 0.2s; }
  .form-control:focus { border-color:#1a5c38; box-shadow: 0 0 0 2px rgba(26,92,56,0.08); }
  .photo-upload-area { border:1px dashed #e8e0d0; border-radius:8px; padding:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; cursor:pointer; background:#fff; }
  .photo-upload-area input[type="file"] { display:none; }
  .preview-photos { display:flex; gap:8px; flex-wrap:wrap; }
  .preview-photo { position:relative; width:80px; height:80px; border-radius:6px; overflow:hidden; border:1px solid #eee; }
  .preview-photo img { width:100%; height:100%; object-fit:cover; display:block; }
  .remove-photo { position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .loader { padding:40px; text-align:center; }
  .spinner { width:28px; height:28px; border:4px solid #eee; border-top-color:#1a5c38; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .btn-save { background:#1a5c38; color:white; border:none; }
  .btn-cancel { background:#fff; border:1px solid #e0e0e0; }
  .btn-close { background:transparent; border:none; font-size:1.2rem; cursor:pointer; }
  .modal-section {
    font-size: 0.65rem; font-weight: 700; color: #aaa;
    letter-spacing: 0.12em; text-transform: uppercase;
    margin: 1rem 0 0.6rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .modal-section::after { content: ''; flex: 1; height: 1px; background: #f0ebe0; }
`;

function RichEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const exec = (cmd, val = null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => onChange(editorRef.current.innerHTML);
  const isActive = (cmd) => { try { return document.queryCommandState(cmd); } catch { return false; } };

  return (
    <div className="rich-editor-wrap">
      <div className="rich-toolbar">
        <button type="button" onClick={() => exec('bold')} className={isActive('bold') ? 'active' : ''}><b>B</b></button>
        <button type="button" onClick={() => exec('italic')} className={isActive('italic') ? 'active' : ''}><i>I</i></button>
        <button type="button" onClick={() => exec('underline')} className={isActive('underline') ? 'active' : ''}><u>U</u></button>
        <div className="divider" />
        <button type="button" onClick={() => exec('formatBlock', 'h3')} style={{ fontSize: '0.75rem', fontWeight: 700 }}>H</button>
        <button type="button" onClick={() => exec('formatBlock', 'p')} style={{ fontSize: '0.75rem' }}>¶</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('insertUnorderedList')} className={isActive('insertUnorderedList') ? 'active' : ''}>• List</button>
        <button type="button" onClick={() => exec('insertOrderedList')} className={isActive('insertOrderedList') ? 'active' : ''}>1. List</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('justifyLeft')}>⬅</button>
        <button type="button" onClick={() => exec('justifyCenter')}>⬌</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('indent')}>→|</button>
        <button type="button" onClick={() => exec('outdent')}>|←</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('removeFormat')} style={{ fontSize: '0.75rem' }}>Clear</button>
      </div>
      <div ref={editorRef} className="rich-content" contentEditable
        suppressContentEditableWarning data-placeholder={placeholder}
        onInput={handleInput} onBlur={handleInput} />
    </div>
  );
}

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    API.get('/destinations').then(res => setDestinations(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null); setForm(emptyForm); setPhotos([]); setExistingPhotos([]); setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d._id);
    setForm({
      name: d.name, location: d.location, district: d.district,
      category: d.category, description: d.description, history: d.history || '',
      entryFee: d.entryFee || '', openingHours: d.openingHours || '',
      bestTimeToVisit: d.bestTimeToVisit || '', mapUrl: d.mapUrl || '',
      featured: d.featured || false
    });
    setExistingPhotos(d.photos || []);
    setPhotos([]);
    setShowModal(true);
  };

  const handleFiles = (e) => setPhotos(prev => [...prev, ...Array.from(e.target.files)]);
  const removeNewPhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const removeExistingPhoto = (i) => setExistingPhotos(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.name || !form.location || !form.district || !form.description) {
      showToast('Please fill in all required fields', 'error'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('existingPhotos', JSON.stringify(existingPhotos));
      photos.forEach(p => fd.append('photos', p));
      if (editing) {
        await API.put(`/destinations/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Destination updated successfully!');
      } else {
        await API.post('/destinations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Destination added successfully!');
      }
      setShowModal(false); load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save destination', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/destinations/${id}`); showToast('Destination deleted'); load();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <style>{editorStyles + pageStyles}</style>
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <h1>Destinations</h1>
          <input className="search-input" placeholder="Search destinations..."
            style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="admin-content">
          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <h2>All Destinations ({filtered.length})</h2>
              <button className="btn-add" onClick={openAdd}>+ Add Destination</button>
            </div>

            {loading ? (
              <div className="loader"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6b6b' }}>
                {search ? 'No results found' : 'No destinations yet. Click "Add Destination" to get started.'}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Photo</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>District</th>
                    <th>Entry Fee</th>
                    <th>Map</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d._id}>
                      <td>
                        <div className="table-img">
                          {d.photos?.[0] ? <img src={getImageUrl(d.photos[0])} alt="" /> : '🏛️'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b6b6b' }}>📍 {d.location}</div>
                      </td>
                      <td><span className="card-tag">{d.category}</span></td>
                      <td style={{ color: '#6b6b6b' }}>{d.district}</td>
                      <td style={{ fontSize: '0.85rem' }}>{d.entryFee || 'Free'}</td>
                      <td>
                        {d.mapUrl
                          ? <a href={d.mapUrl} target="_blank" rel="noreferrer"
                              style={{ color: '#1a5c38', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                              📍 View
                            </a>
                          : <span style={{ color: '#ccc', fontSize: '0.8rem' }}>—</span>
                        }
                      </td>
                      <td>{d.featured ? '⭐ Yes' : '—'}</td>
                      <td>
                        <button className="btn-edit" onClick={() => openEdit(d)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(d._id, d.name)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Destination' : 'Add New Destination'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">

              <div className="modal-section">Basic Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-control" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sigiriya Rock Fortress" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-control" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-control" value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Matale District" />
                </div>
                <div className="form-group">
                  <label className="form-label">District *</label>
                  <input className="form-control" value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    placeholder="e.g. Matale" />
                </div>
              </div>

              <div className="modal-section">Content</div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <RichEditor key={`desc-${editing}`} value={form.description}
                  onChange={val => setForm(f => ({ ...f, description: val }))}
                  placeholder="Brief description for tourists..." />
              </div>
              <div className="form-group">
                <label className="form-label">Historical Background</label>
                <RichEditor key={`hist-${editing}`} value={form.history}
                  onChange={val => setForm(f => ({ ...f, history: val }))}
                  placeholder="Historical context and background..." />
              </div>

              <div className="modal-section">Visitor Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Entry Fee</label>
                  <input className="form-control" value={form.entryFee}
                    onChange={e => setForm({ ...form, entryFee: e.target.value })}
                    placeholder="e.g. USD 30 / Free" />
                </div>
                <div className="form-group">
                  <label className="form-label">Opening Hours</label>
                  <input className="form-control" value={form.openingHours}
                    onChange={e => setForm({ ...form, openingHours: e.target.value })}
                    placeholder="e.g. 7:00 AM - 5:30 PM" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Best Time to Visit</label>
                <input className="form-control" value={form.bestTimeToVisit}
                  onChange={e => setForm({ ...form, bestTimeToVisit: e.target.value })}
                  placeholder="e.g. December to April" />
              </div>

              {/* ── MAP LOCATION ── */}
              <div className="form-group">
                <label className="form-label">📍 Google Maps Location URL</label>
                <div className="map-input-wrap">
                  <input
                    className="form-control"
                    value={form.mapUrl}
                    onChange={e => setForm({ ...form, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=Sigiriya+Rock+Fortress"
                    style={{ paddingRight: form.mapUrl ? '5.5rem' : '1rem' }}
                  />
                  {form.mapUrl && (
                    <a href={form.mapUrl} target="_blank" rel="noreferrer" className="map-preview-btn">
                      Preview 🗺️
                    </a>
                  )}
                </div>
                <div className="map-hint">
                  💡 <strong>3 ways to get the URL:</strong><br />
                  1. Google Maps → search place → <strong>Share</strong> → Copy link<br />
                  2. Use: <code>https://maps.google.com/?q=Sigiriya+Rock+Fortress+Sri+Lanka</code><br />
                  3. Coordinates: <code>https://www.google.com/maps?q=7.9573,80.7601</code>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured}
                    onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>⭐ Mark as Featured (shown on homepage)</span>
                </label>
              </div>

              <div className="modal-section">Photos</div>
              <div className="form-group">
                <div className="photo-upload-area" onClick={() => fileRef.current.click()}>
                  <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} />
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">Click to upload photos</div>
                  <div className="upload-hint">JPG, PNG, WebP — Max 10MB each</div>
                </div>
                {(existingPhotos.length > 0 || photos.length > 0) && (
                  <div className="preview-photos" style={{ marginTop: '1rem' }}>
                    {existingPhotos.map((p, i) => (
                      <div key={`ex-${i}`} className="preview-photo">
                        <img src={getImageUrl(p)} alt="" />
                        <button className="remove-photo" onClick={() => removeExistingPhoto(i)}>✕</button>
                      </div>
                    ))}
                    {photos.map((p, i) => (
                      <div key={`new-${i}`} className="preview-photo">
                        <img src={URL.createObjectURL(p)} alt="" />
                        <button className="remove-photo" onClick={() => removeNewPhoto(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Destination' : 'Add Destination'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}