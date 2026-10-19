import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, PlusCircle, MessageCircle, MapPin, X, Loader2, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ConfirmDialog from '../components/common/ConfirmDialog';

const REGIONS = [
  'Akurdi (Near Rly Stn)',
  'Akurdi (Near College Gate)',
  'Pradhikaran',
  'Nigdi',
  'Chinchwad',
  'Ravet',
  'Pimpri',
  'Other',
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [negotiableFilter, setNegotiableFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'furniture',
    price: '',
    isNegotiable: true,
    age: '',
    description: '',
    phone: '',
    location: '',
    customLocation: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // ── Load items from MongoDB on mount ──────────────────────────────────────
  useEffect(() => {
    fetchItems();
  }, [category, negotiableFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (negotiableFilter === 'yes') params.isNegotiable = true;
      if (negotiableFilter === 'no') params.isNegotiable = false;

      const res = await axiosClient.get('/marketplace', { params });
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load marketplace items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setSelectedFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to post an item.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      // Step 1: Upload photos to Cloudinary (if any selected)
      let uploadedPhotos = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('photos', file));
        const uploadRes = await axiosClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedPhotos = uploadRes.data.photos; // [{ url, publicId }]
      }

      // Step 2: Save item to MongoDB
      const finalLocation =
        newItem.location === 'Other' && newItem.customLocation.trim()
          ? newItem.customLocation.trim()
          : newItem.location || 'Akurdi, Pune';

      const payload = {
        title: newItem.title,
        category: newItem.category,
        price: Number(newItem.price),
        isNegotiable: newItem.isNegotiable,
        itemAge: newItem.age,
        description: newItem.description,
        location: finalLocation,
        whatsapp: newItem.phone.replace(/[^0-9]/g, ''),
        photos: uploadedPhotos,
      };

      const res = await axiosClient.post('/marketplace', payload);
      // Prepend new item to the list
      setItems((prev) => [res.data.data, ...prev]);

      // Reset form
      setShowModal(false);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setNewItem({
        title: '',
        category: 'furniture',
        price: '',
        isNegotiable: true,
        age: '',
        description: '',
        phone: '',
        location: '',
        customLocation: '',
      });
    } catch (err) {
      console.error('Failed to post item:', err);
      setError(
        err?.response?.data?.message || 'Failed to post item. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/marketplace/${deleteTargetId}`);
      setItems((prev) => prev.filter((i) => i._id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert(err?.response?.data?.message || 'Could not delete item.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Campus Buy &amp; Sell</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Buy &amp; sell pre-loved coolers, tables, cycles, and books near Akurdi campus.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-accent" style={{ padding: '0.65rem 1.15rem' }}>
          <PlusCircle size={18} /> Sell an Item
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <label className="form-label">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-control">
            <option value="">All Categories</option>
            <option value="furniture">Furniture (Table, Mattress)</option>
            <option value="appliances">Appliances (Cooler, Kettle)</option>
            <option value="vehicles">Bicycle / Vehicle</option>
            <option value="books">Books &amp; Notes</option>
            <option value="other">Other / Miscellaneous</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <label className="form-label">Price Type</label>
          <select value={negotiableFilter} onChange={(e) => setNegotiableFilter(e.target.value)} className="form-control">
            <option value="">All Prices</option>
            <option value="yes">Negotiable Only</option>
            <option value="no">Fixed Price Only</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem' }}>Loading items…</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>No items found. Be the first to sell something!</p>
        </div>
      ) : (
        <div className="listings-grid">
          {items.map((item) => (
            <div key={item._id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '170px', position: 'relative', backgroundColor: '#E2E8F0' }}>
                {item.photos && item.photos.length > 0 ? (
                  <img src={item.photos[0].url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={40} style={{ opacity: 0.3 }} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className={`badge ${item.isNegotiable ? 'badge-available' : 'badge-distance'}`}>
                    {item.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>{item.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.65rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>{item.location}</span>
                  <span>•</span>
                  <span>By {item.sellerName}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '0.85rem', flexGrow: 1 }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{Number(item.price).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <a
                      href={`https://wa.me/${item.whatsapp}?text=${encodeURIComponent(`Hi ${item.sellerName}, I saw your "${item.title}" on Hommiez!`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-primary" style={{ backgroundColor: '#25D366', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                    {user && item.seller && String(user?.id || user?._id) === String(item?.seller?._id || item?.seller) && (
                      <button
                        onClick={() => setDeleteTargetId(item._id)}
                        title="Delete your listing"
                        style={{
                          background: 'none',
                          border: '1px solid #FCA5A5',
                          borderRadius: 'var(--radius-md)',
                          color: '#DC2626',
                          padding: '0.45rem 0.6rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div className="card modal-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Sell an Item</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Item Title</label>
                <input type="text" required placeholder="e.g. Bajaj Room Cooler" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="form-control" />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="form-control">
                    <option value="furniture">Furniture</option>
                    <option value="appliances">Appliances</option>
                    <option value="vehicles">Bicycle</option>
                    <option value="books">Books &amp; Notes</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" required placeholder="1500" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="form-control" />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Price Negotiable?</label>
                  <select value={newItem.isNegotiable ? 'yes' : 'no'} onChange={(e) => setNewItem({ ...newItem, isNegotiable: e.target.value === 'yes' })} className="form-control">
                    <option value="yes">Yes, Negotiable</option>
                    <option value="no">No, Fixed Price</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Item Age</label>
                  <input type="text" required placeholder="e.g. 6 months, 1 year" value={newItem.age} onChange={(e) => setNewItem({ ...newItem, age: e.target.value })} className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Area</label>
                <select
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value, customLocation: '' })}
                  className="form-control"
                  required={newItem.location !== 'Other'}
                >
                  <option value="">Select Area</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {newItem.location === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wakad, Baner, FC Road…"
                    value={newItem.customLocation}
                    onChange={(e) => setNewItem({ ...newItem, customLocation: e.target.value })}
                    className="form-control"
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>

              {/* Photos */}
              <div className="form-group">
                <label className="form-label">Item Photos (up to 3)</label>
                <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="form-control" />
                {previewUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {previewUrls.map((url, i) => (
                      <img key={i} src={url} alt="preview" style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input type="tel" required placeholder="9876543210" value={newItem.phone} onChange={(e) => setNewItem({ ...newItem, phone: e.target.value })} className="form-control" />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea rows="2" placeholder="About the product." value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="form-control" />
              </div>

              <button type="submit" className="btn-accent" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Posting…</>
                ) : 'Post Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Listing?"
        message="Are you sure you want to delete this item? It will be permanently removed from the marketplace."
        confirmText="Delete Listing"
        cancelText="Cancel"
        destructive={true}
        loading={deleting}
        onCancel={() => !deleting && setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
