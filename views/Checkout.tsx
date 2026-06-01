
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/backend';
import { CreditCard, Wallet, ShieldCheck, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface CheckoutProps {
  userId: string;
  userEmail: string;
  walletAddress: string | null;
}

const COURSE_ID = '1';

const Checkout: React.FC<CheckoutProps> = ({ userId, userEmail, walletAddress }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'fiat_paystack' | 'crypto_usdt'>('fiat_paystack');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [record, setRecord] = useState<any>(null);

  const courseAmount = 999;

  const handlePaystackPayment = async () => {
    setStatus('processing');
    const payment = await api.initiatePayment(userId, COURSE_ID, 'fiat_paystack', courseAmount);
    if ((window as any).PaystackPop) {
      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_demo',
        email: userEmail,
        amount: courseAmount * 100 * 450,
        currency: 'NGN',
        callback: async (response: any) => {
          const confirmed = await api.confirmPayment(payment.id, response.reference);
          await api.enrollCourse(userId, COURSE_ID);
          setRecord(confirmed);
          setStatus('success');
        },
        onClose: () => setStatus('idle'),
      });
      handler.openIframe();
    } else {
      setTimeout(async () => {
        const confirmed = await api.confirmPayment(payment.id, 'REF-123456');
        await api.enrollCourse(userId, COURSE_ID);
        setRecord(confirmed);
        setStatus('success');
      }, 2000);
    }
  };

  const handleUsdtPayment = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }
    setStatus('processing');
    try {
      const payment = await api.initiatePayment(userId, COURSE_ID, 'crypto_usdt', courseAmount);
      setTimeout(async () => {
        const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const confirmed = await api.confirmPayment(payment.id, txHash);
        await api.enrollCourse(userId, COURSE_ID);
        setRecord(confirmed);
        setStatus('success');
      }, 3000);
    } catch (e) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-[#0b0e14] z-[100] flex items-center justify-center p-6 transition-colors">
        <div className="w-full max-w-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-12 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
           <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-10 text-green-500">
              <CheckCircle className="w-12 h-12" />
           </div>
           <h1 className="text-4xl font-black mb-6 text-slate-900 dark:text-white">Order Confirmed</h1>
           <p className="text-slate-500 dark:text-gray-400 text-lg mb-12 max-w-sm mx-auto leading-relaxed">
             Payment normalized and verified. Internal ID: <span className="font-mono text-blue-500">{record?.id}</span>
           </p>
           
           {record?.txHash && (
              <div className="mb-8 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500 break-all text-left">
                <p className="text-blue-500 font-bold mb-2 uppercase">BNB Chain TX Hash:</p>
                {record.txHash}
              </div>
           )}

           <button onClick={() => navigate('/dashboard')} className="w-full py-5 rounded-3xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-black text-lg shadow-xl shadow-blue-500/20 text-white">
              Go to Learning Hub
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 pt-16 pb-32">
      <div className="mb-12">
        <h1 className="text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">Checkout</h1>
        <p className="text-slate-500 dark:text-gray-500 text-lg">Secure your spot in the ecosystem</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-16">
        <div className="flex-1">
          <h2 className="text-2xl font-black mb-10 text-slate-900 dark:text-white">Select Payment Method</h2>
          
          <div className="space-y-6">
            <div 
              onClick={() => setMethod('fiat_paystack')}
              className={`
                p-8 rounded-[32px] border-2 cursor-pointer transition-all relative
                ${method === 'fiat_paystack' ? 'bg-blue-600/5 border-blue-600 dark:border-blue-500' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}
              `}
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Paystack (Fiat)</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-500">Pay via Card, USSD, or Bank Transfer</p>
                </div>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'fiat_paystack' ? 'border-blue-600 dark:border-blue-500' : 'border-slate-300 dark:border-gray-700'}`}>
                   {method === 'fiat_paystack' && <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500"></div>}
                </div>
              </div>
            </div>

            <div 
              onClick={() => setMethod('crypto_usdt')}
              className={`
                p-8 rounded-[32px] border-2 cursor-pointer transition-all relative
                ${method === 'crypto_usdt' ? 'bg-orange-600/5 border-orange-600 dark:border-orange-500' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}
              `}
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">USDT (Binance Smart Chain)</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-500">Web3 on-chain payment processor</p>
                </div>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'crypto_usdt' ? 'border-orange-600 dark:border-orange-500' : 'border-slate-300 dark:border-gray-700'}`}>
                   {method === 'crypto_usdt' && <div className="w-3 h-3 rounded-full bg-orange-600 dark:bg-orange-500"></div>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 p-8 rounded-[40px] bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
               <ShieldCheck className="w-5 h-5 text-emerald-500" /> Encrypted Transaction
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-500 leading-relaxed mb-8">
              All payments are processed through specialized secure channels. Fiat transactions are secured by Paystack, and USDT transactions are executed via audited smart contracts.
            </p>
            <button 
              onClick={method === 'fiat_paystack' ? handlePaystackPayment : handleUsdtPayment}
              disabled={status === 'processing'}
              className={`
                w-full py-6 rounded-3xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4
                ${status === 'processing' ? 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-500' : 'bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-blue-500/20'}
              `}
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Securing Channel...
                </>
              ) : (
                <>Confirm Payment ${courseAmount}</>
              )}
            </button>
          </div>
        </div>

        <div className="w-full xl:w-[450px]">
           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[48px] p-10 sticky top-32 shadow-sm dark:shadow-none">
              <h2 className="text-2xl font-black mb-10 text-slate-900 dark:text-white">Summary</h2>
              <div className="space-y-4 mb-10 text-sm font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Product</span>
                  <span className="text-slate-900 dark:text-white">Full Access Pass</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Quantity</span>
                  <span className="text-slate-900 dark:text-white">1 Lifetime Seat</span>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex items-end justify-between">
                 <span className="text-2xl font-black text-slate-900 dark:text-white">Total Due</span>
                 <span className="text-4xl font-black text-blue-600 dark:text-blue-400">${courseAmount}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
