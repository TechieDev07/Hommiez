import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function FilterBar({ filters, setFilters, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      marginBottom: '2rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem' }}>
          <SlidersHorizontal size={18} color="var(--primary)" />
          <span>Filters & Campus Proximity</span>
        </div>

        <button
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          <RotateCcw size={14} />
          Reset All
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {/* Housing Type */}
        <div>
          <label className="form-label">Property Type</label>
          <select
            name="type"
            value={filters.type || ''}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">All Types (Flats & PGs)</option>
            <option value="pg">Paying Guest (PG)</option>
            <option value="flat">Independent Flat</option>
          </select>
        </div>

        {/* Max Rent */}
        <div>
          <label className="form-label">Max Budget (Monthly)</label>
          <select
            name="maxRent"
            value={filters.maxRent || ''}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Any Budget</option>
            <option value="6000">Under ₹6,000</option>
            <option value="10000">Under ₹10,000</option>
            <option value="15000">Under ₹15,000</option>
            <option value="20000">Under ₹20,000</option>
          </select>
        </div>

        {/* Distance from Campus */}
        <div>
          <label className="form-label">Distance from Campus</label>
          <select
            name="maxDistance"
            value={filters.maxDistance || ''}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Any Distance</option>
            <option value="1">Walking distance (within 1 km)</option>
            <option value="2">Within 2 km</option>
            <option value="3">Within 3 km</option>
            <option value="5">Within 5 km</option>
          </select>
        </div>

        {/* Gender Preference */}
        <div>
          <label className="form-label">Gender Preference</label>
          <select
            name="gender"
            value={filters.gender || ''}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Any / Co-ed</option>
            <option value="boys_only">Boys Only</option>
            <option value="girls_only">Girls Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
