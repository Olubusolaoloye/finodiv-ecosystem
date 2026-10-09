import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/backend';
import {
  CreditCard, Wallet, CheckCircle2, Loader2, ArrowRight, ShieldCheck,
} from 'lucide-react';

interface CheckoutProps {
  userId: string;
  userEmail: string;
  walletAddress: string | null;
}

const COURSE_PRICE_USD = 49;
const COURSE_PRICE_NGN = COURSE_PRICE_USD * 1600;
const COURSE_TITLE = 'Full Access Pass';

const INCLUDES = [
  'Lifetime access to course materials',
  'Certificate of completion',
  'Private community access',
  'Live Q&A sessions',
  'Mobile-friendly content',
];

type PayMethod = 'paystack' | 'usdt';
type Status = 'idle' | 'processing' | 'success' | 'error';

// ── Step indicator ─────────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number }> = ({ current }) => {
  const steps = ['Order', 'Payment', 'Confirmation'];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                style={{
                  backgroundColor: done || active ? 'var(--color-accent)' : 'var(--color-border)',
                  color: done || active ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-3 mb-4 transition-all duration-500"
                style={{ backgroundColor: i < current ? 'var(--color-accent)' : 'var(--color-border)' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Order summary (step 1) ─────────────────────────────────────────────────────

const OrderStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <motion.div
    key="order"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
  >
    {/* Course thumbnail — media placeholder, intentionally deep */}
    <div
      className="w-full aspect-video rounded-[16px] flex items-center justify-center mb-6"
      style={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid var(--color-border)' }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(139,92,246,0.15)' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 3l14 9-14 9V3z" fill="var(--color-accent)" />
        </svg>
      </div>
    </div>

    {/* Title & price */}
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{COURSE_TITLE}</h2>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          ₦{COURSE_PRICE_NGN.toLocaleString()}
        </span>
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>~${COURSE_PRICE_USD}</span>
      </div>
    </div>

    {/* Includes */}
    <div
      className="p-5 rounded-[14px] mb-8"
      style={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid var(--color-border)' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>
        What's included
      </p>
      <ul className="flex flex-col gap-2.5">
        {INCLUDES.map(item => (
          <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
            {item}
          </li>
        ))}
      </ul>
    </div>

    <button
      onClick={onNext}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-semibold text-white transition-colors duration-150"
      style={{ backgroundColor: 'var(--color-accent)' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
    >
      Proceed to payment
      <ArrowRight className="w-4 h-4" />
    </button>
  </motion.div>
);

// ── Payment step (step 2) ──────────────────────────────────────────────────────

const PaymentStep: React.FC<{
  method: PayMethod;
  onMethod: (m: PayMethod) => void;
  onPay: () => void;
  status: Status;
  walletAddress: string | null;
}> = ({ method, onMethod, onPay, status, walletAddress }) => {
  const METHODS: { id: PayMethod; icon: React.ReactNode; label: string; desc: string }[] = [
    {
      id: 'paystack',
      icon: <CreditCard className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />,
      label: 'Paystack',
      desc: 'Card, bank transfer, or USSD',
    },
    {
      id: 'usdt',
      icon: <Wallet className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />,
      label: 'USDT (BNB Chain)',
      desc: walletAddress ? `Wallet: ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : 'Connect wallet to pay with crypto',
    },
  ];

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text-primary)' }}>
        Choose payment method
      </h2>

      <div className="flex flex-col gap-3 mb-8">
        {METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => onMethod(m.id)}
            className="flex items-center gap-4 p-4 rounded-[14px] text-left transition-all duration-150"
            style={{
              backgroundColor: method === m.id ? 'rgba(139,92,246,0.08)' : 'var(--color-bg-card)',
              border: `1px solid ${method === m.id ? 'rgba(139,92,246,0.5)' : 'var(--color-border)'}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}
            >
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.label}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{m.desc}</p>
            </div>
            {/* Radio indicator */}
            <div
              className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
              style={{ border: `2px solid ${method === m.id ? 'var(--color-accent)' : 'var(--color-border)'}` }}
            >
              {method === m.id && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Security note */}
      <div
        className="flex items-start gap-3 p-4 rounded-[12px] mb-6"
        style={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid var(--color-border)' }}
      >
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          All payments are encrypted and secure. Paystack is PCI-DSS compliant.
          USDT payments are processed on-chain.
        </p>
      </div>

      <button
        onClick={onPay}
        disabled={status === 'processing' || (method === 'usdt' && !walletAddress)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-accent)' }}
        onMouseEnter={e => status !== 'processing' && (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
      >
        {status === 'processing' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
        ) : (
          <>Pay ₦{COURSE_PRICE_NGN.toLocaleString()} <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {method === 'usdt' && !walletAddress && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-muted)' }}>
          Connect your wallet from the navbar to pay with USDT.
        </p>
      )}
    </motion.div>
  );
};

// ── Confirmation step (step 3) ─────────────────────────────────────────────────

const ConfirmStep: React.FC<{ txId?: string; onDone: () => void }> = ({ txId, onDone }) => (
  <motion.div
    key="confirm"
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center text-center py-4"
  >
    {/* Animated checkmark */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
      className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
      style={{ backgroundColor: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.4)' }}
    >
      <CheckCircle2 className="w-9 h-9" style={{ color: 'var(--color-accent)' }} />
    </motion.div>

    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
      Payment confirmed!
    </h2>
    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
      You're now enrolled. Start learning at your own pace.
    </p>

    {txId && (
      <p className="text-xs font-mono mb-6 px-4 py-2 rounded-[8px]" style={{ backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-muted)' }}>
        Ref: {txId}
      </p>
    )}

    <button
      onClick={onDone}
      className="flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white"
      style={{ backgroundColor: 'var(--color-accent)' }}
    >
      Start your course
      <ArrowRight className="w-4 h-4" />
    </button>
  </motion.div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const Checkout: React.FC<CheckoutProps> = ({ userId, userEmail, walletAddress }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const courseId = params.get('course') || '1';

  const [step,   setStep]   = useState(0);
  const [method, setMethod] = useState<PayMethod>('paystack');
  const [status, setStatus] = useState<Status>('idle');
  const [txId,   setTxId]   = useState<string | undefined>();

  const handlePay = async () => {
    setStatus('processing');
    try {
      const payment = await api.initiatePayment(userId, courseId, method === 'paystack' ? 'fiat_paystack' : 'crypto_usdt', COURSE_PRICE_USD);

      if (method === 'paystack' && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          key: 'pk_test_demo',
          email: userEmail,
          amount: COURSE_PRICE_NGN * 100,
          currency: 'NGN',
          callback: async (response: any) => {
            const confirmed = await api.confirmPayment(payment.id, response.reference);
            await api.enrollCourse(userId, courseId);
            setTxId(confirmed?.id || response.reference);
            setStatus('success');
            setStep(2);
          },
          onClose: () => setStatus('idle'),
        });
        handler.openIframe();
      } else {
        // Fallback / USDT mock
        await new Promise(r => setTimeout(r, 2000));
        const ref = method === 'usdt'
          ? `0x${Math.random().toString(16).slice(2, 18)}`
          : `REF-${Date.now()}`;
        const confirmed = await api.confirmPayment(payment.id, ref);
        await api.enrollCourse(userId, courseId);
        setTxId(confirmed?.id || ref);
        setStatus('success');
        setStep(2);
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-[20px] p-6 sm:p-8"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <h1 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Checkout</h1>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {step === 0 && <OrderStep key="order" onNext={() => setStep(1)} />}
            {step === 1 && (
              <PaymentStep
                key="payment"
                method={method}
                onMethod={setMethod}
                onPay={handlePay}
                status={status}
                walletAddress={walletAddress}
              />
            )}
            {step === 2 && (
              <ConfirmStep
                key="confirm"
                txId={txId}
                onDone={() => navigate(`/learning/${courseId}`)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Back link — not shown on confirmation */}
        {step < 2 && (
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
            className="mt-4 text-xs w-full text-center transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {step === 0 ? '← Back to course' : '← Back to order summary'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Checkout;
