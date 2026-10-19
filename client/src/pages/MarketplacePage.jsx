import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, PlusCircle, MessageCircle, MapPin, X, UploadCloud } from 'lucide-react';

const INITIAL_ITEMS = [
  {
    _id: '1',
    title: 'Room Air Cooler (Used 1 Summer)',
    price: 2200,
    isNegotiable: true,
    category: 'appliances',
    location: 'Akurdi (Near Rly Stn)',
    sellerName: 'Vikram S.',
    photos: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80'],
    description: 'Working cooler, high airflow. Selling because shifting to new flat.',
    whatsapp: '919876543221',
  },
  {
    _id: '2',
    title: 'Wooden Study Table with Chair',
    price: 1500,
    isNegotiable: false,
    category: 'furniture',
    location: 'Pradhikaran, Sector 24',
    sellerName: 'Ananya R.',
    photos: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=80'],
    description: 'Solid wooden table with storage drawer. Price is fixed.',
    whatsapp: '919876543222',
  },
  {
    _id: '3',
    title: 'Induction Cooker + Electric Kettle',
    price: 1100,
    isNegotiable: true,
    category: 'appliances',
    location: 'Akurdi (Near College Gate)',
    sellerName: 'Kunal P.',
    photos: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80'],
    description: 'Both items working. Perfect for late-night cooking in PG.',
    whatsapp: '919876543223',
  },
  {
    _id: '4',
    title: 'Engineering Mechanics & Math Notes (Sem 1-2)',
    price: 450,
    isNegotiable: true,
    category: 'books',
    location: 'Akurdi Rly Stn Road',
    sellerName: 'Sneha G.',
    photos: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80'],
    description: 'Clean notes with solved previous year question sets.',
    whatsapp: '919876543224',
  },
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [category, setCategory] = useState('');
  const [negotiableFilter, setNegotiableFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'furniture',
    price: '',
    isNegotiable: true,
    itemAge: '',
    description: '',
    phone: '',
  });
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Filter items cleanly
  const filtered = items.filter((item) => {
    if (category && item.category !== category) return false;
    if (negotiableFilter === 'yes' && !item.isNegotiable) return false;
    if (negotiableFilter === 'no' && item.isNegotiable) return false;
    return true;
  });

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const urls = files.map((f) => URL.createObjectURL(f));
    setSelectedPhotos(urls);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const created = {
      _id: 'item_' + Date.now(),
      title: newItem.title,
      category: newItem.category,
      price: Number(newItem.price),
      isNegotiable: newItem.isNegotiable,
      itemAge: newItem.age,
      sellerName: user?.name || 'Student',
      photos: selectedPhotos.length > 0 ? selectedPhotos : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80'],
      description: newItem.description,
      whatsapp: newItem.phone.replace(/[^0-9]/g, '') || '919876543210',
    };

    setItems([created, ...items]);
    setShowModal(false);
    setSelectedPhotos([]);
    setNewItem({ title: '', category: 'furniture', price: '', isNegotiable: true, location: 'Akurdi (Near College)', description: '', phone: '' });
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Campus Buy & Sell</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Buy & sell pre-loved coolers, tables, cycles, and books near Akurdi campus.</p>
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
            <option value="books">Books & Notes</option>
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
      <div className="listings-grid">
        {filtered.map((item) => (
          <div key={item._id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '170px', position: 'relative', backgroundColor: '#E2E8F0' }}>
              <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{item.price.toLocaleString()}</div>
                <a
                  href={`https://wa.me/${item.whatsapp}?text=${encodeURIComponent(`Hi ${item.sellerName}, I saw your "${item.title}" on Hommiez!`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-primary" style={{ backgroundColor: '#25D366', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div className="card modal-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Sell an Item</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}><X size={20} /></button>
            </div>

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
                    <option value="books">Books & Notes</option>
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

              {/* 2-3 Photos Input */}
              <div className="form-group">
                <label className="form-label">Item Photos (1 to 3 photos)</label>
                <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="form-control" />
                {selectedPhotos.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {selectedPhotos.map((url, i) => (
                      <img key={i} src={url} alt="preview" style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input type="tel" required placeholder="0000000xxx" value={newItem.phone} onChange={(e) => setNewItem({ ...newItem, phone: e.target.value })} className="form-control" />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea rows="2" placeholder="About the product." value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="form-control" />
              </div>

              <button type="submit" className="btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>Post Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
