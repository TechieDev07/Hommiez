import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Zap, Users } from 'lucide-react';

export default function ListingCard({ listing }) {
  // Use first photo or friendly student accommodation placeholder
  const imageUrl =
    listing.photos && listing.photos.length > 0
      ? listing.photos[0].url
      : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

  const hasBrokerage = listing.hasBrokerage === true || Number(listing.brokerageFee) > 0;
  const feeAmount = Number(listing.brokerageFee) || 0;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Listing Photo & Badges */}
      <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#E2E8F0' }}>
        <img
          src={imageUrl}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />

        {/* Flat or PG tag */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className={`badge ${listing.type === 'pg' ? 'badge-pg' : 'badge-flat'}`}>
            {listing.type === 'pg' ? 'Paying Guest (PG)' : 'Independent Flat'}
          </span>
        </div>

        {/* Upfront Brokerage Badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          {!hasBrokerage ? (
            <span className="badge badge-free-brokerage">
              <Zap size={12} /> Zero Brokerage
            </span>
          ) : (
            <span
              className="badge"
              style={{
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                fontWeight: '600',
              }}
            >
              {feeAmount > 0 ? `Brokerage: ₹${feeAmount.toLocaleString()}` : 'Brokerage Applicable'}
            </span>
          )}
        </div>
      </div>

      {/* Listing Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Title */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          {listing.title}
        </h3>

        {/* Location & Distance from Campus */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          <MapPin size={16} color="var(--primary)" />
          <span>{listing.locationName}</span>
          <span>•</span>
          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
            {listing.distanceFromCampusKm} km from campus
          </span>
        </div>

        {/* Preference Tags */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span className="badge badge-distance">
            <Users size={12} /> {listing.preferences?.gender?.replace('_', ' ').toUpperCase() || 'ANY'}
          </span>
          {listing.preferences?.food && listing.preferences.food !== 'no_preference' && (
            <span className="badge badge-distance">
              {listing.preferences.food.replace('_', ' ').toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Price */}
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ₹{listing.rent?.toLocaleString()}
              <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>/mo</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Deposit: ₹{listing.deposit?.toLocaleString() || 0}
            </div>
          </div>

          {/* Action button */}
          <Link to={`/listings/${listing._id}`} className="btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
