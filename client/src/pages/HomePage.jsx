import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import ListingCard from '../components/listings/ListingCard';
import FilterBar from '../components/listings/FilterBar';
import { Sparkles } from 'lucide-react';

const INITIAL_DEMO_LISTINGS = [
  {
    _id: 'demo1',
    title: 'Comfort 2BHK Student Flat near Main Gate',
    type: 'flat',
    rent: 12000,
    deposit: 12000,
    hasBrokerage: false,
    brokerageFee: 0,
    locationName: 'North Campus, College Road',
    distanceFromCampusKm: 0.6,
    preferences: { gender: 'any', food: 'non_veg_allowed' },
    photos: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80' }],
    status: 'available',
  },
  {
    _id: 'demo2',
    title: 'Sunrise Luxury PG with AC & High Speed WiFi',
    type: 'pg',
    rent: 7500,
    deposit: 5000,
    hasBrokerage: false,
    brokerageFee: 0,
    locationName: 'Green Park, Sector 4',
    distanceFromCampusKm: 1.1,
    preferences: { gender: 'boys_only', food: 'veg_only' },
    photos: [{ url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80' }],
    status: 'available',
  },
  {
    _id: 'demo3',
    title: 'Cozy Girls PG with 3 Meals & Laundry Included',
    type: 'pg',
    rent: 8500,
    deposit: 8500,
    hasBrokerage: true,
    brokerageFee: 1500,
    locationName: 'University Enclave',
    distanceFromCampusKm: 0.4,
    preferences: { gender: 'girls_only', food: 'veg_only' },
    photos: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80' }],
    status: 'available',
  },
];

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    maxRent: '',
    maxDistance: '',
    gender: '',
    brokerage: '',
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.maxRent) params.maxRent = filters.maxRent;
      if (filters.maxDistance) params.maxDistance = filters.maxDistance;
      if (filters.gender) params.gender = filters.gender;
      if (filters.brokerage) params.brokerage = filters.brokerage;

      const response = await axiosClient.get('/listings', { params });
      if (response.data?.data && response.data.data.length > 0) {
        setListings(response.data.data);
      } else {
        setListings(INITIAL_DEMO_LISTINGS);
      }
    } catch (error) {
      setListings(INITIAL_DEMO_LISTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({ type: '', maxRent: '', maxDistance: '', gender: '', brokerage: '' });
  };

  return (
    <div>
      {/* Hero Banner */}
      <section style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '2.5rem 0 2rem',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '0.85rem',
          }}>
            <Sparkles size={15} />
            <span>Hyper-Local Student Living Near Campus</span>
          </div>

          <h1 className="hero-title">
            Find verified student flats and PGs with <span style={{ color: 'var(--primary)' }}>zero hidden fees</span>.
          </h1>

          <p className="hero-subtitle">
            Upfront brokerage declared, campus distance verified, and direct owner/broker contact for college students.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '2rem 1rem 4rem' }}>
        {/* Interactive Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
        />

        {/* Results Count Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
            Available Places Near College ({listings.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing verified active listings
          </span>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading places near campus...
          </div>
        ) : listings.length > 0 ? (
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              No listings matched your filters
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Try broadening your budget or distance filters to see more places.
            </p>
            <button onClick={handleResetFilters} className="btn-primary">
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
