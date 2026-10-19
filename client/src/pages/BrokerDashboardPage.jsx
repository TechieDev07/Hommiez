import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  PlusCircle,
  Users,
  RefreshCw,
  Image as ImageIcon,
  X,
  UploadCloud,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export default function BrokerDashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'pg',
    rent: '',
    deposit: '',
    brokerageFee: '0',
    locationName: '',
    distanceFromCampusKm: '',
    description: '',
    gender: 'any',
  });

  // Photo files & previews state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [formLoading, setFormLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [formError, setFormError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [listingsRes, leadsRes] = await Promise.all([
        axiosClient.get('/listings/my-listings'),
        axiosClient.get('/leads/my-leads'),
      ]);
      setListings(listingsRes.data.data || []);
      setLeads(leadsRes.data.data || []);
    } catch (err) {
      console.warn('Backend connection pending...');
      setListings([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 5) {
      setFormError('You can upload a maximum of 5 photos per listing.');
      return;
    }
    setFormError('');

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemovePhoto = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setUpdatingStatusId(id);
    try {
      const newStatus = currentStatus === 'available' ? 'rented' : 'available';
      await axiosClient.patch(`/listings/${id}/status`, { status: newStatus });
      setListings((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      setListings((prev) =>
        prev.map((l) =>
          l._id === id ? { ...l, status: l.status === 'available' ? 'rented' : 'available' } : l
        )
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      let uploadedPhotos = [];

      if (selectedFiles.length > 0) {
        setUploadStatus('Uploading photos to Cloudinary...');
        const uploadData = new FormData();
        selectedFiles.forEach((file) => {
          uploadData.append('photos', file);
        });

        const uploadRes = await axiosClient.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedPhotos = uploadRes.data.photos || [];
      }

      setUploadStatus('Saving listing details...');
      const payload = {
        title: formData.title,
        type: formData.type,
        rent: Number(formData.rent),
        deposit: Number(formData.deposit),
        brokerageFee: Number(formData.brokerageFee),
        locationName: formData.locationName,
        distanceFromCampusKm: Number(formData.distanceFromCampusKm),
        description: formData.description,
        preferences: { gender: formData.gender },
        photos: uploadedPhotos,
      };

      await axiosClient.post('/listings', payload);

      setShowCreateModal(false);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setFormData({
        title: '',
        type: 'pg',
        rent: '',
        deposit: '',
        brokerageFee: '0',
        locationName: '',
        distanceFromCampusKm: '',
        description: '',
        gender: 'any',
      });
      fetchDashboardData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to publish listing.');
    } finally {
      setFormLoading(false);
      setUploadStatus('');
    }
  };

  const totalLeads = listings.reduce((sum, item) => sum + (item.leadCount || 0), 0);

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span>{user?.name ? `${user.name}'s Dashboard` : 'Owner Dashboard'}</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)',
                letterSpacing: '0.2px',
              }}
            >
              Verified Owner
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage your flats/PGs and view incoming student inquiries
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-accent"
          style={{ padding: '0.65rem 1.15rem' }}
        >
          <PlusCircle size={18} />
          Post New Property
        </button>
      </div>

      {/* Analytics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            Active Properties
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>
            {listings.filter((l) => l.status === 'available').length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            Total Student Leads
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--accent)', marginTop: '0.2rem' }}>
            {totalLeads}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            Owner Contact Phone
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {user?.phone || 'Not Set'}
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
          Your Properties ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>You haven't posted any listings yet.</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Post Your First Flat or PG
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {listings.map((item) => (
              <div
                key={item._id}
                className="card"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={item.photos[0].url}
                      alt={item.title}
                      style={{ width: '75px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                  ) : (
                    <div style={{ width: '75px', height: '60px', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={20} color="var(--text-muted)" />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-rented'}`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span className={`badge ${item.type === 'pg' ? 'badge-pg' : 'badge-flat'}`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className="badge badge-distance">
                        🔥 {item.leadCount || 0} Leads
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{item.title}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      ₹{item.rent?.toLocaleString()} / mo • {item.locationName}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleToggleStatus(item._id, item.status)}
                    disabled={updatingStatusId === item._id}
                    title={
                      item.status === 'available'
                        ? 'Click to mark this property as rented out'
                        : 'Click to reactivate this property listing'
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      fontSize: '0.825rem',
                      fontWeight: '600',
                      cursor: updatingStatusId === item._id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: item.status === 'available' ? '#FFFFFF' : '#F0FDF4',
                      color: item.status === 'available' ? '#334155' : '#15803D',
                      border: item.status === 'available' ? '1.5px solid #CBD5E1' : '1.5px solid #86EFAC',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    onMouseEnter={(e) => {
                      if (updatingStatusId === item._id) return;
                      if (item.status === 'available') {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.borderColor = '#FECACA';
                        e.currentTarget.style.color = '#DC2626';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(220, 38, 38, 0.12)';
                      } else {
                        e.currentTarget.style.backgroundColor = '#DCFCE7';
                        e.currentTarget.style.borderColor = '#4ADE80';
                        e.currentTarget.style.color = '#166534';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(22, 163, 74, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.status === 'available') {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                        e.currentTarget.style.color = '#334155';
                      } else {
                        e.currentTarget.style.backgroundColor = '#F0FDF4';
                        e.currentTarget.style.borderColor = '#86EFAC';
                        e.currentTarget.style.color = '#15803D';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }}
                  >
                    {updatingStatusId === item._id ? (
                      <>
                        <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Updating...</span>
                      </>
                    ) : item.status === 'available' ? (
                      <>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10B981',
                            display: 'inline-block',
                            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
                          }}
                        />
                        <CheckCircle2 size={14} color="#0F766E" />
                        <span>Mark as Rented</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw size={14} color="#16A34A" />
                        <span>Relist (Mark Available)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Inquiries */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
          Recent Inquiries ({leads.length})
        </h2>
        {leads.length === 0 ? (
          <div className="card" style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No student contacts unlocked yet.
          </div>
        ) : (
          <div className="card" style={{ padding: '0.75rem' }}>
            {leads.map((lead, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  borderBottom: idx !== leads.length - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                    {lead.student?.name || 'College Student'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Interested in: {lead.listing?.title}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Post New Property */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000,
        }}>
          <div className="card modal-card" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.2rem' }}>Post a New Property</h2>

            {formError && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunny 2BHK Flat near Campus Gate"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* Photo Upload Box */}
              <div className="form-group">
                <label className="form-label">Upload Property Photos (Up to 5)</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                  position: 'relative',
                }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <UploadCloud size={28} color="var(--primary)" style={{ margin: '0 auto 0.4rem' }} />
                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                    Click or drag photos here to upload
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    JPG, PNG, WebP up to 5MB each
                  </div>
                </div>

                {previewUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                    {previewUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '70px', height: '55px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            minHeight: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Responsive 2-column or 1-column on mobile */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-control"
                  >
                    <option value="pg">Paying Guest (PG)</option>
                    <option value="flat">Independent Flat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender Preference</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="form-control"
                  >
                    <option value="any">Any / Co-ed</option>
                    <option value="boys_only">Boys Only</option>
                    <option value="girls_only">Girls Only</option>
                  </select>
                </div>
              </div>

              {/* Responsive 3-column (stacks on mobile) */}
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="8000"
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Security Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="8000"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brokerage Fee (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.brokerageFee}
                    onChange={(e) => setFormData({ ...formData, brokerageFee: e.target.value })}
                    className="form-control"
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 for Direct Owner</span>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Area / Neighborhood</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Campus, College Road"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0.8"
                    value={formData.distanceFromCampusKm}
                    onChange={(e) => setFormData({ ...formData, distanceFromCampusKm: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description & Highlights</label>
                <textarea
                  rows="3"
                  placeholder="WiFi included, clean washrooms, 24/7 security..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-accent"
                >
                  {formLoading ? uploadStatus || 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}