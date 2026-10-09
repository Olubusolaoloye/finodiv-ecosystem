import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const ResetPassword: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
    <div
      className="w-full max-w-md rounded-[20px] p-10 text-center"
      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: 'rgba(47,109,242,0.1)', border: '1px solid rgba(47,109,242,0.25)' }}
      >
        <Mail className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Reset your password
      </h2>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        Email-based password reset is not currently available. Please contact our support team and we'll help you regain access to your account.
      </p>
      <a
        href="mailto:devolufinodiv@gmail.com?subject=Password%20Reset%20Request"
        className="block w-full py-3 rounded-[10px] text-sm font-semibold text-white text-center mb-4"
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        Email Support
      </a>
      <Link
        to="/login"
        className="text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-muted)' }}
      >
        ← Back to Sign In
      </Link>
    </div>
  </div>
);

export default ResetPassword;
