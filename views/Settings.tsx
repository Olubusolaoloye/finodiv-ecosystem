import React, { useState, useEffect } from 'react';
import { UserRole, WalletBinding } from '../types';
import { api } from '../services/backend';
import { convex } from '../services/convex';
import { api as convexApi } from '../convex/_generated/api';
import {
  User, Lock, CreditCard, Wallet, ShieldCheck, Globe,
  Camera, Check, Mail, Link2, Loader2, CheckCircle,
} from 'lucide-react';

interface SettingsProps {
  userId: string;
  role: UserRole;
  authEmail: string | null;
  walletAddress: string | null;
  onBindWallet: () => void;
}

const Settings: React.FC<SettingsProps> = ({ userId, role, authEmail, walletAddress, onBindWallet }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [binding, setBinding] = useState<WalletBinding | null>(null);
  const [isBinding, setIsBinding] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    api.getBinding(userId).then(b => { if (b) setBinding(b); });
    convex.query(convexApi.profiles.getByUserId, { userId }).then((data) => {
      if (data) {
        setDisplayName(data.name || '');
        setProfessionalTitle((data as any).title || '');
      }
    });
  }, [userId]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await convex.mutation(convexApi.profiles.upsert, {
      userId,
      name: displayName,
      email: (await convex.query(convexApi.profiles.getByUserId, { userId }))?.email || '',
    });
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleBindClick = async () => {
    setIsBinding(true);
    try {
      await api.generateBindingNonce(userId);
      setTimeout(async () => {
        const newBinding = await api.bindWallet(userId, walletAddress || '0xDemoAddress', 'sig_verify');
        setBinding(newBinding);
        setIsBinding(false);
        onBindWallet();
      }, 1500);
    } catch { setIsBinding(false); }
  };

  const tabs = [
    { id: 'Profile', icon: User },
    { id: 'Security', icon: Lock },
    { id: 'Identity', icon: ShieldCheck },
    ...(role === UserRole.LEARNER ? [{ id: 'Payments', icon: CreditCard }] : []),
    { id: 'Integrations', icon: Globe },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'var(--color-bg-deep)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 36 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Account</p>
        <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2rem)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 6 }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          Manage your profile, security, and linked identities.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--color-text-muted)',
                border: activeTab === tab.id ? 'none' : '1px solid transparent',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; } }}
              onMouseLeave={e => { if (activeTab !== tab.id) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; } }}
            >
              <tab.icon style={{ width: 15, height: 15 }} />
              {tab.id}
            </button>
          ))}
        </aside>

        {/* Main panel */}
        <main style={{
          flex: 1, minWidth: 280,
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 20, padding: '32px',
        }}>
          {/* ── Profile tab ── */}
          {activeTab === 'Profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                  <img
                    src={`https://i.pravatar.cc/150?u=${userId}`}
                    style={{ width: 88, height: 88, borderRadius: 20, objectFit: 'cover', border: '2px solid var(--color-border)', display: 'block' }}
                    alt="Avatar"
                  />
                  <button style={{
                    position: 'absolute', bottom: -6, right: -6,
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--color-accent)', color: '#fff',
                    border: '2px solid var(--color-bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <Camera style={{ width: 12, height: 12 }} />
                  </button>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {displayName || authEmail?.split('@')[0] || 'My Profile'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{authEmail}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
                    Display Name
                  </label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name" style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
                    Professional Title
                  </label>
                  <input type="text" value={professionalTitle} onChange={e => setProfessionalTitle(e.target.value)}
                    placeholder="e.g. Smart Contract Developer" style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 24px', borderRadius: 10,
                    background: 'var(--color-accent)', color: '#fff',
                    fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
                    opacity: savingProfile ? 0.7 : 1,
                  }}
                >
                  {savingProfile ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                    : profileSaved ? <CheckCircle style={{ width: 15, height: 15, color: '#86efac' }} /> : null}
                  {profileSaved ? 'Saved!' : 'Update Profile'}
                </button>
              </div>
            </div>
          )}

          {/* ── Security tab ── */}
          {activeTab === 'Security' && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Security Controls</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Password change, 2FA, and session management will appear here.
              </p>
            </div>
          )}

          {/* ── Identity tab ── */}
          {activeTab === 'Identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Connected Identities</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  Bind your wallet to your email for multi-factor auth and verified proof-of-work.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Email identity */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 14, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail style={{ width: 16, height: 16, color: 'var(--color-accent)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Google Account</p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{authEmail || 'Not Connected'}</p>
                      </div>
                    </div>
                    {authEmail && (
                      <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(5,150,105,0.12)', color: '#34d399', border: '1px solid rgba(5,150,105,0.2)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Primary
                      </span>
                    )}
                  </div>

                  {/* Web3 identity */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 14, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(249,115,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet style={{ width: 16, height: 16, color: '#f97316' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Web3 Identity (BSC)</p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {binding ? `${binding.address.slice(0,6)}…${binding.address.slice(-4)}` : (walletAddress ? 'Pending Binding' : 'Not Connected')}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {binding ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.12)', color: 'var(--color-accent)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                            <Check style={{ width: 10, height: 10 }} /> Bound
                          </div>
                          <button style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Unbind</button>
                        </>
                      ) : walletAddress ? (
                        <button
                          onClick={handleBindClick}
                          disabled={isBinding}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'var(--color-accent)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: isBinding ? 0.7 : 1 }}
                        >
                          {isBinding ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : null}
                          Sign to Bind
                        </button>
                      ) : (
                        <button onClick={onBindWallet} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                          Connect Wallet
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 20, borderRadius: 14, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Link2 style={{ width: 16, height: 16, color: 'var(--color-accent)' }} />
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Identity Sync</h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  By syncing your identities, NFT certificates will be automatically associated with your professional profile regardless of how you sign in.
                </p>
              </div>
            </div>
          )}

          {/* ── Payments tab ── */}
          {activeTab === 'Payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Payment Channels</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Choose between Fiat via Paystack or USDT on the Binance Smart Chain.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                {[
                  { icon: CreditCard, label: 'Fiat Payments', sub: 'Card & bank transfers', color: 'var(--color-accent)', bg: 'rgba(139,92,246,0.1)', badge: 'Paystack Ready' },
                  { icon: Wallet,     label: 'Blockchain',    sub: 'USDT on BSC',           color: '#f97316', bg: 'rgba(249,115,22,0.1)', badge: 'USDT / BSC' },
                ].map(({ icon: Icon, label, sub, color, bg, badge }) => (
                  <div key={label} style={{ padding: '20px', borderRadius: 14, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 18, height: 18, color }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>{badge}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Integrations tab ── */}
          {activeTab === 'Integrations' && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>External Integrations</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                API keys and third-party platform connections will appear here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
