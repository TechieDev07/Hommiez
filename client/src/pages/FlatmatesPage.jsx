import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  SlidersHorizontal,
  PlusCircle,
  MessageCircle,
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  X,
} from 'lucide-react';

const INITIAL_FLATMATE_POSTS = [
  {
    _id: 'fm1',
    name: 'Rohan Verma',
    college: 'Thapar University (2nd Year)',
    gender: 'boys_only',
    budget: 6500,
    preferredArea: 'Near Main Gate / Model Town',
    habits: ['Non-smoker', 'Night Owl', 'Veg Only'],
    bio: 'Looking for a chill flatmate to share a 2BHK flat. I study CS, keep the room clean, and love gaming on weekends.',
    whatsapp: '919876543211',
    createdAt: '2 days ago',
  },
  {
    _id: 'fm2',
    name: 'Priya Sen',
    college: 'Chitkara / University Campus (1st Year)',
    gender: 'girls_only',
    budget: 8000,
    preferredArea: 'Urban Estate Phase 2',
    habits: ['Early Riser', 'Non-smoker', 'Quiet Study'],
    bio: 'Looking for 1 female flatmate for an already rented furnished 2BHK flat with AC and WiFi. Room is ready to move.',
    whatsapp: '919876543212',
    createdAt: 'Yesterday',
  },
  {
    _id: 'fm3',
    name: 'Arjun Mehta & Sahil',
    college: 'Engineering Campus (3rd Year)',
    gender: 'boys_only',
    budget: 5000,
    preferredArea: 'North Gate, University Road',
    habits: ['Non-smoker', 'Any Food', 'Friendly'],
    bio: 'We have 1 vacant room in our 3BHK flat. Looking for a neat and friendly guy. Total rent per person is ₹5,000.',
    whatsapp: '919876543213',
    createdAt: '3 days ago',
  },
];

export default function FlatmatesPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(INITIAL_FLATMATE_POSTS);
  const [filters, setFilters] = useState({
    gender: '',
    maxBudget: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({
    name: user?.name || '',
    college: user?.collegeName || '',
    gender: 'boys_only',
    budget: '',
    preferredArea: '',
    habits: '',
    bio: '',
    phone: '',
  });

  // Filter logic
  const filteredPosts = posts.filter((p) => {
    if (filters.gender && filters.gender !== 'any' && p.gender !== filters.gender) return false;
    if (filters.maxBudget && p.budget > Number(filters.maxBudget)) return false;
    return true;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    const created = {
      _id: 'fm_' + Date.now(),
      name: newPost.name,
      college: newPost.college || 'College Student',
      gender: newPost.gender,
      budget: Number(newPost.budget),
      preferredArea: newPost.preferredArea,
      habits: newPost.habits.split(',').map((h) => h.trim()).filter(Boolean),
      bio: newPost.bio,
      whatsapp: newPost.phone.replace(/[^0-9]/g, '') || '919876543210',
      createdAt: 'Just now',
    };

    setPosts([created, ...posts]);
    setShowModal(false);
    setNewPost({
      name: '',
      college: '',
      gender: 'boys_only',
      budget: '',
      preferredArea: '',
      habits: '',
      bio: '',
      phone: '',
    });
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <Users size={18} />
            <span>Campus Flatmate Finder</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800' }}>
            Find Compatible Flatmates & Roommates
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Connect with students from your college looking to split rent or team up for a flat.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-accent"
          style={{ padding: '0.65rem 1.15rem' }}
        >
          <PlusCircle size={18} />
          Post Flatmate Need
        </button>
      </div>

      {/* Dedicated Flatmate Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.95rem' }}>
            <SlidersHorizontal size={17} color="var(--primary)" />
            <span>Flatmate Preferences</span>
          </div>

          <button
            onClick={() => setFilters({ gender: '', maxBudget: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>

        <div className="form-grid-2">
          <div>
            <label className="form-label">Looking for (Gender)</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="form-control"
            >
              <option value="">All Genders</option>
              <option value="boys_only">Male Flatmates (Boys)</option>
              <option value="girls_only">Female Flatmates (Girls)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Max Budget (Per Person / Month)</label>
            <select
              value={filters.maxBudget}
              onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
              className="form-control"
            >
              <option value="">Any Budget</option>
              <option value="5000">Under ₹5,000 / mo</option>
              <option value="7000">Under ₹7,000 / mo</option>
              <option value="10000">Under ₹10,000 / mo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flatmate Postings Grid */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
          Active Requests ({filteredPosts.length})
        </h2>
      </div>

      <div className="listings-grid">
        {filteredPosts.map((post) => (
          <div key={post._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Student Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: post.gender === 'girls_only' ? '#FCE7F3' : '#E0E7FF',
                  color: post.gender === 'girls_only' ? '#BE185D' : '#3730A3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                }}>
                  {post.name[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{post.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <GraduationCap size={13} />
                    <span>{post.college}</span>
                  </div>
                </div>
              </div>

              <span className={`badge ${post.gender === 'girls_only' ? 'badge-rented' : 'badge-flat'}`}>
                {post.gender === 'girls_only' ? 'Girls Only' : 'Boys Only'}
              </span>
            </div>

            {/* Target Budget & Area */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target Budget</span>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{post.budget.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>/mo</span>
                </span>
              </div>
              <div style={{ textAlign: 'right', maxWidth: '55%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Area</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {post.preferredArea}
                </span>
              </div>
            </div>

            {/* Bio */}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem', flexGrow: 1 }}>
              "{post.bio}"
            </p>

            {/* Habit Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {post.habits.map((habit, i) => (
                <span key={i} className="badge badge-distance" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={11} color="var(--primary)" /> {habit}
                </span>
              ))}
            </div>

            {/* WhatsApp Connect Button */}
            <a
              href={`https://wa.me/${post.whatsapp}?text=${encodeURIComponent(`Hi ${post.name}, I saw your flatmate post on Hommiez!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: '100%', backgroundColor: '#25D366', fontSize: '0.85rem', padding: '0.55rem' }}
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        ))}
      </div>

      {/* Modal: Post Flatmate Need */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', zIndex: 1000,
        }}>
          <div className="card modal-card" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Post Flatmate Request</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Your Full Name</label>
                <input
                  type="text" required placeholder="e.g. Rahul Sharma"
                  value={newPost.name} onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={newPost.gender}
                    onChange={(e) => setNewPost({ ...newPost, gender: e.target.value })}
                    className="form-control"
                  >
                    <option value="boys_only">Boys Only</option>
                    <option value="girls_only">Girls Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Budget (₹)</label>
                  <input
                    type="number" required placeholder="6000"
                    value={newPost.budget} onChange={(e) => setNewPost({ ...newPost, budget: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred College / Area</label>
                <input
                  type="text" required placeholder="e.g. Near University Main Gate"
                  value={newPost.preferredArea} onChange={(e) => setNewPost({ ...newPost, preferredArea: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Habits / Preferences (Comma separated)</label>
                <input
                  type="text" placeholder="Non-smoker, Veg only, Night owl"
                  value={newPost.habits} onChange={(e) => setNewPost({ ...newPost, habits: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp Number</label>
                <input
                  type="tel" required placeholder="9876543210"
                  value={newPost.phone} onChange={(e) => setNewPost({ ...newPost, phone: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">A Short Bio (About you & what you need)</label>
                <textarea
                  rows="3" required placeholder="I am looking for a roommate in 2BHK flat..."
                  value={newPost.bio} onChange={(e) => setNewPost({ ...newPost, bio: e.target.value })}
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>
                Publish Flatmate Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
