import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  SlidersHorizontal,
  PlusCircle,
  MessageCircle,
  Tag,
  MapPin,
  RotateCcw,
  X,
  Sparkles,
} from 'lucide-react';

const INITIAL_MARKETPLACE_ITEMS = [
  {
    _id: 'item1',
    title: 'Symphony Room Air Cooler (Used 1 Season)',
    price: 2400,
    category: 'appliances',
    condition: 'good',
    location: 'North Campus Hostel Gate',
    sellerName: 'Vikram Singh',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
    description: 'Working in top condition, powerful airflow, clean honey-comb pads. Perfect for college summers. Selling because graduating.',
    whatsapp: '919876543221',
    createdAt: 'Today',
  },
  {
    _id: 'item2',
    title: 'Wooden Study Table with Bookshelf + Chair',
    price: 1800,
    category: 'furniture',
    condition: 'like_new',
    location: 'Green Park Society',
    sellerName: 'Ananya Roy',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    description: 'Sturdy wooden desk with drawer and chair. No wobbling or scratches. Moving out of flat.',
    whatsapp: '919876543222',
    createdAt: 'Yesterday',
  },
  {
    _id: 'item3',
    title: 'Pigeon Induction Cooktop + 2L Stainless Kettle',
    price: 1100,
    category: 'appliances',
    condition: 'good',
    location: 'Near Campus Gate 2',
    sellerName: 'Kunal Patel',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    description: 'Both items working properly. Ideal for late night Maggi, tea, and quick cooking in PG/flat.',
    whatsapp: '919876543223',
    createdAt: '2 days ago',
  },
  {
    _id: 'item4',
    title: 'Hero Sprint 21-Speed Gear Bicycle',
    price: 3200,
    category: 'vehicles',
    condition: 'fair',
    location: 'Engineering Department Block',
    sellerName: 'Harsh Vardhan',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    description: 'Daily commuter cycle to go from flat to campus classes. Both brakes and gears working.',
    whatsapp: '919876543224',
    createdAt: '3 days ago',
  },
  {
    _id: 'item5',
    title: 'Complete 2nd Year CS Textbooks & Handwritten Notes',
    price: 650,
    category: 'books',
    condition: 'like_new',
    location: 'College Library area',
    sellerName: 'Sneha Gupta',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    description: 'Includes DSA, OS, and DBMS standard books with previous year question papers solved.',
    whatsapp: '919876543225',
    createdAt: '4 days ago',
  },
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const [items, setItems] = useState(INITIAL_MARKETPLACE_ITEMS);
  const [filters, setFilters] = useState({
    category: '',
    maxPrice: '',
    condition: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'furniture',
    price: '',
    condition: 'good',
    location: '',
    description: '',
    phone: '',
  });

  // Filter logic
  const filteredItems = items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.maxPrice && item.price > Number(filters.maxPrice)) return false;
    return true;
  });

  const handleCreateItem = (e) => {
    e.preventDefault();
    const created = {
      _id: 'item_' + Date.now(),
      title: newItem.title,
      category: newItem.category,
      price: Number(newItem.price),
      condition: newItem.condition,
      location: newItem.location || 'Near Campus',
      sellerName: user?.name || 'College Student',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      description: newItem.description,
      whatsapp: newItem.phone.replace(/[^0-9]/g, '') || '919876543210',
      createdAt: 'Just now',
    };

    setItems([created, ...items]);
    setShowModal(false);
    setNewItem({
      title: '',
      category: 'furniture',
      price: '',
      condition: 'good',
      location: '',
      description: '',
      phone: '',
    });
  };

  const getConditionBadge = (cond) => {
    switch (cond) {
      case 'like_new':
        return <span className="badge badge-available">Like New</span>;
      case 'good':
        return <span className="badge badge-pg">Good Condition</span>;
      default:
        return <span className="badge badge-distance">Fair Condition</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <ShoppingBag size={18} />
            <span>Campus Buy & Sell Market</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800' }}>
            College 2nd Hand Marketplace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Buy and sell coolers, study desks, mattresses, cycles, and books directly from campus mates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-accent"
          style={{ padding: '0.65rem 1.15rem' }}
        >
          <PlusCircle size={18} />
          Sell an Item
        </button>
      </div>

      {/* Dedicated Marketplace Filter Bar */}
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
            <span>Category & Price Filters</span>
          </div>

          <button
            onClick={() => setFilters({ category: '', maxPrice: '', condition: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>

        <div className="form-grid-3">
          <div>
            <label className="form-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="form-control"
            >
              <option value="">All Categories</option>
              <option value="furniture">Furniture (Desks, Chairs, Mattresses)</option>
              <option value="appliances">Appliances (Coolers, Kettles, Induction)</option>
              <option value="vehicles">Bicycles & Commute</option>
              <option value="books">Books & Notes</option>
            </select>
          </div>

          <div>
            <label className="form-label">Max Price (₹)</label>
            <select
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="form-control"
            >
              <option value="">Any Budget</option>
              <option value="1000">Under ₹1,000</option>
              <option value="2500">Under ₹2,500</option>
              <option value="5000">Under ₹5,000</option>
            </select>
          </div>

          <div>
            <label className="form-label">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
              className="form-control"
            >
              <option value="">Any Condition</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
          Items for Sale ({filteredItems.length})
        </h2>
      </div>

      <div className="listings-grid">
        {filteredItems.map((item) => (
          <div key={item._id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Image */}
            <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#E2E8F0' }}>
              <img
                src={item.image}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                {getConditionBadge(item.condition)}
              </div>
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span className="badge" style={{ backgroundColor: '#FFFFFF', color: 'var(--text-main)' }}>
                  {item.category.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                {item.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                <MapPin size={14} color="var(--primary)" />
                <span>{item.location}</span>
                <span>•</span>
                <span>By {item.sellerName}</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flexGrow: 1 }}>
                {item.description}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  ₹{item.price.toLocaleString()}
                </div>

                <a
                  href={`https://wa.me/${item.whatsapp}?text=${encodeURIComponent(`Hi ${item.sellerName}, is your "${item.title}" still available on Hommiez?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ backgroundColor: '#25D366', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                >
                  <MessageCircle size={15} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Sell Item */}
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Sell an Item</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateItem}>
              <div className="form-group">
                <label className="form-label">Item Title</label>
                <input
                  type="text" required placeholder="e.g. Bajaj Room Cooler or Wooden Study Table"
                  value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="furniture">Furniture</option>
                    <option value="appliances">Appliances</option>
                    <option value="vehicles">Bicycle</option>
                    <option value="books">Books & Notes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number" required placeholder="1500"
                    value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    value={newItem.condition}
                    onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                    className="form-control"
                  >
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Campus / Pickup Location</label>
                <input
                  type="text" required placeholder="e.g. Near Hostel Block A or Main Gate"
                  value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp Number</label>
                <input
                  type="tel" required placeholder="9876543210"
                  value={newItem.phone} onChange={(e) => setNewItem({ ...newItem, phone: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Details</label>
                <textarea
                  rows="3" required placeholder="How long was it used, any scratches or defects..."
                  value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>
                Post Item for Sale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
