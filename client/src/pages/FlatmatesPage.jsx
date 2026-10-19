import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, SlidersHorizontal, PlusCircle, MessageCircle,
  CheckCircle2, GraduationCap, RotateCcw, X, MapPin,
} from 'lucide-react';

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

const INITIAL_POSTS = [
  {
    _id: 'fm1',
    name: 'Rohan Verma',
    college: 'PCCoE (2nd Year CSE)',
    gender: 'boys_only',
    budget: 6500,
    region: 'Akurdi (Near Rly Stn)',
    habits: ['Non-smoker', 'Night Owl', 'Veg Only'],
    bio: 'Looking for a chill flatmate to share a 2BHK flat. I keep the room clean and love gaming on weekends.',
    whatsapp: '919876543211',
    createdAt: '2 days ago',
  },
  {
    _id: 'fm2',
    name: 'Priya Sen',
    college: 'PCCoE (1st Year IT)',
    gender: 'girls_only',
    budget: 8000,
    region: 'Pradhikaran',
    habits: ['Early Riser', 'Quiet Study'],
    bio: 'Looking for 1 female flatmate for a furnished 2BHK with AC and WiFi. Room is ready to move.',
    whatsapp: '919876543212',
    createdAt: 'Yesterday',
  },
  {
    _id: 'fm3',
    name: 'Arjun & Sahil',
    college: 'PCCoE (3rd Year Mech)',
    gender: 'boys_only',
    budget: 5000,
    region: 'Akurdi (Near College Gate)',
    habits: [],
    bio: 'We have 1 vacant room in our 3BHK flat. Looking for a neat and friendly guy. ₹5,000 per person.',
    whatsapp: '919876543213',
    createdAt: '3 days ago',
  },
];

export default function FlatmatesPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [filters, setFilters] = useState({ gender: '', maxBudget: '', region: '' });
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({
    name: '', college: '', gender: 'boys_only',
    budget: '', region: '', habits: '', bio: '', phone: '',
  });

  // Filter
  const filtered = posts.filter((p) => {
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.maxBudget && p.budget > Number(filters.maxBudget)) return false;
    if (filters.region && p.region !== filters.region) return false;
    return true;
  });

  const resetFilters = () => setFilters({ gender: '', maxBudget: '', region: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    const created = {
      _id: 'fm_' + Date.now(),
      name: newPost.name,
      college: newPost.college || 'College Student',
      gender: newPost.gender,
      budget: Number(newPost.budget),
      region: newPost.region || 'Other',
      habits: newPost.habits ? newPost.habits.split(',').map((h) => h.trim()).filter(Boolean) : [],
      bio: newPost.bio,
      whatsapp: newPost.phone.replace(/[^0-9]/g, '') || '919876543210',
      createdAt: 'Just now',
    };
    setPosts([created, ...posts]);
    setShowModal(false);
    setNewPost({ name: '', college: '', gender: 'boys_only', budget: '', region: '', habits: '', bio: '', phone: '' });
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <Users size={18} /> <span>Campus Flatmate Finder</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Find Compatible Flatmates</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Connect with students looking to split rent near your campus.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-accent" style={{ padding: '0.65rem 1.15rem' }}>
          <PlusCircle size={18} /> Post Flatmate Need
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.95rem' }}>
            <SlidersHorizontal size={17} color="var(--primary)" /> Filters
          </div>
          <button onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">Gender</label>
            <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} className="form-control">
              <option value="">All</option>
              <option value="boys_only">Boys</option>
              <option value="girls_only">Girls</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">Max Budget</label>
            <select value={filters.maxBudget} onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })} className="form-control">
              <option value="">Any</option>
              <option value="5000">Under ₹5,000</option>
              <option value="7000">Under ₹7,000</option>
              <option value="10000">Under ₹10,000</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">Region / Area</label>
            <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} className="form-control">
              <option value="">All Areas</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Count */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>
        Active Requests ({filtered.length})
      </h2>

      {/* Cards Grid */}
      <div className="listings-grid">
        {filtered.map((post) => (
          <div key={post._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            {/* Student Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: post.gender === 'girls_only' ? '#FCE7F3' : '#E0E7FF',
                  color: post.gender === 'girls_only' ? '#BE185D' : '#3730A3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '1.05rem',
                }}>
                  {post.name[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{post.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <GraduationCap size={12} /> {post.college}
                  </div>
                </div>
              </div>
              <span className={`badge ${post.gender === 'girls_only' ? 'badge-rented' : 'badge-flat'}`}>
                {post.gender === 'girls_only' ? 'Girls' : 'Boys'}
              </span>
            </div>

            {/* Budget + Region */}
            <div style={{
              backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem', marginBottom: '0.85rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Budget</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{post.budget.toLocaleString()}<span style={{ fontSize: '0.7rem', fontWeight: '500' }}>/mo</span>
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Area</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <MapPin size={12} color="var(--primary)" /> {post.region}
                </span>
              </div>
            </div>

            {/* Bio */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '0.85rem', flexGrow: 1 }}>
              "{post.bio}"
            </p>

            {/* Habits (optional — only show if present) */}
            {post.habits && post.habits.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                {post.habits.map((h, i) => (
                  <span key={i} className="badge badge-distance" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={11} color="var(--primary)" /> {h}
                  </span>
                ))}
              </div>
            )}

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${post.whatsapp}?text=${encodeURIComponent(`Hi ${post.name}, saw your flatmate post on Hommiez!`)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: '100%', backgroundColor: '#25D366', fontSize: '0.85rem', padding: '0.5rem' }}
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div className="card modal-card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Post Flatmate Request</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input type="text" required placeholder="e.g. Rahul Sharma" value={newPost.name}
                  onChange={(e) => setNewPost({ ...newPost, name: e.target.value })} className="form-control" />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select value={newPost.gender} onChange={(e) => setNewPost({ ...newPost, gender: e.target.value })} className="form-control">
                    <option value="boys_only">Boys Only</option>
                    <option value="girls_only">Girls Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Budget (₹)</label>
                  <input type="number" required placeholder="6000" value={newPost.budget}
                    onChange={(e) => setNewPost({ ...newPost, budget: e.target.value })} className="form-control" />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Region / Area</label>
                  <select value={newPost.region} onChange={(e) => setNewPost({ ...newPost, region: e.target.value })} className="form-control">
                    <option value="">Select Area</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">College (optional)</label>
                  <input type="text" placeholder="e.g. PCCoE" value={newPost.college}
                    onChange={(e) => setNewPost({ ...newPost, college: e.target.value })} className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Habits / Preferences <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional, comma separated)</span></label>
                <input type="text" placeholder="Non-smoker, Veg only, Night owl" value={newPost.habits}
                  onChange={(e) => setNewPost({ ...newPost, habits: e.target.value })} className="form-control" />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input type="tel" required placeholder="9876543210" value={newPost.phone}
                  onChange={(e) => setNewPost({ ...newPost, phone: e.target.value })} className="form-control" />
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio</label>
                <textarea rows="2" required placeholder="Looking for a flatmate in 2BHK near college..." value={newPost.bio}
                  onChange={(e) => setNewPost({ ...newPost, bio: e.target.value })} className="form-control" />
              </div>

              <button type="submit" className="btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>Publish Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
