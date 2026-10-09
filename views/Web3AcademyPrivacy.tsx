import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{
      fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#a78bfa', marginBottom: 12,
    }}>
      {title}
    </h2>
    <div style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.7)' }}>
      {children}
    </div>
  </div>
);

const Web3AcademyPrivacy: React.FC = () => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f0a2e 0%, #0b0e14 50%, #0a0e1a 100%)', color: '#fff' }}>
    {/* Nav */}
    <div style={{ borderBottom: '1px solid rgba(167,139,250,0.12)', padding: '16px clamp(20px, 5vw, 64px)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
            fontSize: 13, fontWeight: 600,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back to FINODIV
        </Link>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em',
          color: '#a78bfa',
        }}>
          <ShieldCheck style={{ width: 11, height: 11 }} /> Web3 Academy
        </span>
      </div>
    </div>

    {/* Content */}
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px) 100px' }}>

      {/* Header */}
      <div style={{ marginBottom: 56, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 16 }}>
          Legal
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Web3 Academy · Last updated: 9 October 2026
        </p>
      </div>

      {/* Lead */}
      <p style={{
        fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,0.85)',
        marginBottom: 48, padding: '20px 24px',
        background: 'rgba(124,58,237,0.07)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 14,
        fontWeight: 500,
      }}>
        Web3 Academy does not collect, store, or share any personal information.
      </p>

      <Section title="What We Don't Do">
        The app has no accounts, no sign-in, and no analytics, advertising, or tracking software
        of any kind. We cannot identify you and we do not build a profile of you.
      </Section>

      <Section title="Data Stored on Your Device">
        Your learning progress — completed lessons, mastered terms, quiz results, XP, streaks
        and badges — is stored only on your device. It is never transmitted to us. Uninstalling
        the app or using "Reset all progress" in Profile erases it permanently. We cannot recover
        or access it.
      </Section>

      <Section title="Network Requests">
        The app downloads lesson and reference content from our content server (Supabase) so
        material stays current. These requests only fetch content; they send no information
        about you. Like any internet service, our provider's servers process your device's IP
        address to deliver the response. We do not use it to identify you.
      </Section>

      <Section title="Links to Other Sites">
        Tapping a project or app link opens it in your browser. Those sites have their own
        privacy policies and we are not responsible for them.
      </Section>

      <Section title="Children">
        The app is not directed at children under 13 and collects no data from anyone.
      </Section>

      <Section title="Changes">
        We'll update this page and its date if this ever changes.
      </Section>

      <Section title="Contact">
        <a
          href="mailto:devolufinodiv@gmail.com"
          style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          devolufinodiv@gmail.com
        </a>
      </Section>

      {/* Footer divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, marginTop: 8 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          This privacy policy applies solely to the Web3 Academy mobile app available on Google Play.
          For the FINODIV platform privacy policy, visit{' '}
          <Link to="/" style={{ color: 'rgba(167,139,250,0.6)', textDecoration: 'none' }}>finodiv.com</Link>.
        </p>
      </div>
    </div>
  </div>
);

export default Web3AcademyPrivacy;
