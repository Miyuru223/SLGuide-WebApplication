import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import API, { getImageUrl } from '../utils/api';
import { showToast } from '../components/Toast';

const CATEGORIES = ['Religious', 'Cultural', 'Festival', 'National', 'Music', 'Food'];

const emptyForm = {
  name: '',
  category: 'Festival',
  description: '',
  isRecurringAnnual: false,
  duration: '',
  featured: false
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
  }, [value]);

  const exec = (cmd, val = null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => onChange(editorRef.current.innerHTML);

  return (
    <div className="rich-editor-wrap">
      <div className="rich-toolbar">
        <button type="button" onClick={() => exec('bold')}><b>B</b></button>
        <button type="button" onClick={() => exec('italic')}><i>I</i></button>
        <button type="button" onClick={() => exec('underline')}><u>U</u></button>
        <div className="divider" />
        <button type="button" onClick={() => exec('formatBlock', 'h3')} style={{ fontSize: '0.75rem', fontWeight: 700 }}>H</button>
        <button type="button" onClick={() => exec('formatBlock', 'p')} style={{ fontSize: '0.75rem' }}>¶</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('insertUnorderedList')}>• List</button>
        <button type="button" onClick={() => exec('insertOrderedList')}>1. List</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('justifyLeft')}>⬅</button>
        <button type="button" onClick={() => exec('justifyCenter')}>⬌</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('indent')}>→|</button>
        <button type="button" onClick={() => exec('outdent')}>|←</button>
        <div className="divider" />
        <button type="button" onClick={() => exec('removeFormat')} style={{ fontSize: '0.75rem' }}>Clear</button>
      </div>
      <div
        ref={editorRef}
        className="rich-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  );
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
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
    API.get('/events').then(res => setEvents(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setPhotos([]);
    setExistingPhotos([]);
    setShowModal(true);
  };

  const openEdit = (e) => {
    setEditing(e._id);
    setForm({
      name: e.name,
      category: e.category,
      description: e.description,
      isRecurringAnnual: e.isRecurringAnnual || false,
      duration: e.duration || '',
      featured: e.featured || false
    });
    setExistingPhotos(e.photos || []);
    setPhotos([]);
    setShowModal(true);
  };

  const handleFiles = (e) => setPhotos(prev => [...prev, ...Array.from(e.target.files)]);
  const removeNewPhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const removeExistingPhoto = (i) => setExistingPhotos(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.description) {
      showToast('Please fill in all required fields (Name, Category, Description)', 'error');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('existingPhotos', JSON.stringify(existingPhotos));
      photos.forEach(p => fd.append('photos', p));

      if (editing) {
        await API.put(`/events/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Event updated successfully!');
      } else {
        await API.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Event added successfully!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/events/${id}`);
      showToast('Event deleted');
      load();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  // Fixed filter
  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <style>{editorStyles + pageStyles}</style>
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <h1>Events & Festivals</h1>
          <input
            className="search-input"
            placeholder="Search events..."
            style={{ width: 260 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-content">
          <div className="admin-table-wrap">
            <div className="admin-table-header">
              <h2>All Events ({filtered.length})</h2>
              <button className="btn-add" onClick={openAdd}>+ Add Event</button>
            </div>

            {loading ? (
              <div className="loader"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6b6b' }}>
                {search ? 'No results found' : 'No events yet. Click "Add Event" to get started.'}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Photo</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Annual</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e._id}>
                      <td>
                        <div className="table-img">
                          {e.photos?.[0] ? <img src={getImageUrl(e.photos[0])} alt="" /> : '🎉'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{e.name}</div>
                      </td>
                      <td><span className="card-tag">{e.category}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{e.duration || '—'}</td>
                      <td>{e.isRecurringAnnual ? '🔁 Yes' : '—'}</td>
                      <td>{e.featured ? '⭐ Yes' : '—'}</td>
                      <td>
                        <button className="btn-edit" onClick={() => openEdit(e)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(e._id, e.name)}>Delete</button>
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
        <div className="modal-overlay" onClick={ev => ev.target === ev.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Event' : 'Add New Event'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">Basic Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-control" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Kandy Esala Perahera" />
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
                  <label className="form-label">Duration</label>
                  <input className="form-control" value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. July" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    <input type="checkbox" checked={form.isRecurringAnnual}
                      onChange={e => setForm({ ...form, isRecurringAnnual: e.target.checked })} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>🔁 Recurring Annual Event</span>
                  </label>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    <input type="checkbox" checked={form.featured}
                      onChange={e => setForm({ ...form, featured: e.target.checked })} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>⭐ Mark as Featured (shown on homepage)</span>
                  </label>
                </div>
              </div>

              <div className="modal-section">Content</div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <RichEditor
                  key={`desc-${editing}`}
                  value={form.description}
                  onChange={val => setForm(f => ({ ...f, description: val }))}
                  placeholder="Tell visitors about this event..."
                />
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
                {saving ? 'Saving...' : editing ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}