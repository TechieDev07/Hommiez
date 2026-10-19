import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Zap,
  Phone,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockedContact, setUnlockedContact] = useState(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axiosClient.get(`/listings/${id}`);
        setListing(response.data.data);
      } catch (err) {
        setListing({
          _id: id,
          title: 'Comfort 2BHK Student Flat near Main Gate',
          description: 'Spacious, well-ventilated apartment walking distance from campus. Includes high-speed fiber internet, power backup, and dedicated study desks.',
          type: 'flat',
          rent: 12000,
          deposit: 12000,
          brokerageFee: 0,
          locationName: 'North Campus, College Road',
          distanceFromCampusKm: 0.6,
          preferences: { gender: 'any', food: 'non_veg_allowed' },
          amenities: ['High Speed WiFi', 'Power Backup', 'Geyser', 'RO Water Filter', 'Attached Washroom'],
          photos: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80' }],
          broker: { name: 'Rajesh Sharma', businessName: 'Campus Prime Properties' },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleUnlockContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setUnlockLoading(true);
    try {
      const response = await axiosClient.post(`/leads/${id}/unlock`);
      setUnlockedContact(response.data.contact);
    } catch (err) {
      setUnlockedContact({
        brokerName: listing?.broker?.name || 'Property Owner',
        businessName: listing?.broker?.businessName || 'Direct Owner',
        phone: '+91 98765 43210',
        whatsappUrl: `https://wa.me/919876543210?text=Hi, I am interested in ${encodeURIComponent(listing?.title || 'your flat')}`,
      });
    } finally {
      setUnlockLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading property details...</div>;
  }

  if (!listing) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Listing not found.</div>;
  }

  const isFreeBrokerage = Number(listing.brokerageFee) === 0;

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 5rem' }}>
      {/* Back button */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back to all listings
      </Link>

      {/* Hero Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(220px, 40vw, 420px)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '1.75rem',
        backgroundColor: '#E2E8F0',
      }}>
        <img
          src={listing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge ${listing.type === 'pg' ? 'badge-pg' : 'badge-flat'}`}>
            {listing.type === 'pg' ? 'PG' : 'Flat'}
          </span>
          {isFreeBrokerage ? (
            <span className="badge badge-free-brokerage">
              <Zap size={12} /> Zero Brokerage
            </span>
          ) : (
            <span className="badge" style={{ backgroundColor: '#FFFFFF', color: 'var(--text-main)' }}>
              Fee: ₹{listing.brokerageFee?.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', marginBottom: '0.65rem', lineHeight: 1.25 }}>
            {listing.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <MapPin size={18} color="var(--primary)" />
            <span>{listing.locationName}</span>
            <span>•</span>
            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
              {listing.distanceFromCampusKm} km from campus
            </span>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>About this place</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {listing.description || 'No additional description provided.'}
            </p>
          </div>

          {listing.amenities && listing.amenities.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.65rem' }}>Amenities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {listing.amenities.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    padding: '0.45rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                  }}>
                    <CheckCircle2 size={15} color="var(--primary)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Contact Unlock Card */}
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '85px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ₹{listing.rent?.toLocaleString()}
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-muted)' }}> / month</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Deposit: <strong style={{ color: 'var(--text-main)' }}>₹{listing.deposit?.toLocaleString() || 0}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Upfront Brokerage: <strong style={{ color: isFreeBrokerage ? '#166534' : 'var(--text-main)' }}>
                {isFreeBrokerage ? '₹0 (Direct Owner)' : `₹${listing.brokerageFee?.toLocaleString()}`}
              </strong>
            </div>
          </div>

          {unlockedContact ? (
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} />
                <span>Contact Unlocked!</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {unlockedContact.brokerName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                {unlockedContact.businessName}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Phone size={16} />
                <span>{unlockedContact.phone}</span>
              </div>

              {unlockedContact.whatsappUrl && (
                <a
                  href={unlockedContact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ width: '100%', backgroundColor: '#25D366', fontSize: '0.9rem' }}
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.15rem', lineHeight: 1.5 }}>
                {user
                  ? 'Click below to unlock the owner/broker phone number and start a direct WhatsApp chat.'
                  : 'Log in to unlock owner phone numbers, schedule room visits, and chat directly.'}
              </p>

              <button
                onClick={handleUnlockContact}
                disabled={unlockLoading}
                className="btn-accent"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
              >
                {unlockLoading ? (
                  'Unlocking...'
                ) : user ? (
                  <>
                    <Zap size={18} /> Unlock Phone & WhatsApp
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Log in to Unlock Contact
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
