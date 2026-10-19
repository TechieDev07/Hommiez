import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

/**
 * ConfirmDialog - A styled modal to replace native window.confirm()
 * 
 * Props:
 * @param {boolean} isOpen - Whether modal is displayed
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels or closes modal
 * @param {string} [title] - Title of confirmation dialog
 * @param {string} [message] - Description / warning message
 * @param {string} [confirmText="Delete"] - Label for the confirm button
 * @param {string} [cancelText="Cancel"] - Label for the cancel button
 * @param {boolean} [destructive=true] - If true, uses danger/destructive red styling
 * @param {boolean} [loading=false] - If true, disables buttons and shows loading spinner
 */
export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Delete Listing?',
  message = 'Are you sure you want to delete this listing? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  destructive = true,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 2000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg, 16px)',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        {/* Close icon button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #64748B)',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Badge Icon */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: destructive ? '#FEE2E2' : '#E0F2FE',
              color: destructive ? '#DC2626' : '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            {destructive ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--text-main, #0F172A)',
              marginBottom: '0.5rem',
            }}
          >
            {title}
          </h3>

          {/* Message */}
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted, #64748B)',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
            }}
          >
            {message}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              width: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md, 10px)',
                border: '1px solid var(--border-color, #E2E8F0)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main, #0F172A)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md, 10px)',
                border: 'none',
                backgroundColor: destructive ? '#DC2626' : 'var(--primary, #0F766E)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'opacity 0.15s ease',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
