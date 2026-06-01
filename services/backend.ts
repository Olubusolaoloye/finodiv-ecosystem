
import {
  User, UserRole, WalletBinding, PaymentRecord, CertificateNFT,
  PaymentMethod, Course, Talent
} from '../types';
import { COURSES, TALENTS } from '../constants';
import { supabase } from './supabase';

// ── helpers ──────────────────────────────────────────────────────────────────

function dbCourseToUI(row: any): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    instructor: row.instructor,
    price: Number(row.price_usd),
    category: row.category,
    level: row.level,
    duration: row.duration,
    image: row.thumbnail_url || `https://picsum.photos/seed/${row.id}/800/450`,
    rating: row.rating,
    niche: row.category,
  };
}

function dbPaymentToUI(row: any): PaymentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    method: row.method === 'PAYSTACK' ? 'fiat_paystack' : 'crypto_usdt',
    amount: Number(row.amount_usd),
    status: (row.status as string).toLowerCase() as any,
    txHash: row.tx_hash ?? undefined,
    reference: row.tx_ref ?? undefined,
    createdAt: row.created_at,
  };
}

function dbCertToUI(row: any): CertificateNFT {
  const s = (row.status as string).toUpperCase();
  return {
    id: row.id,
    userId: row.user_id,
    walletAddress: row.wallet_address || '',
    courseId: row.course_id,
    tokenId: row.token_id ?? undefined,
    txHash: row.tx_hash ?? undefined,
    status: s === 'MINTED' ? 'minted' : 'unclaimed',
    issuedAt: row.issued_at ?? undefined,
  };
}

function dbBindingToUI(row: any): WalletBinding {
  return {
    userId: row.user_id,
    address: row.address,
    chainId: 56,
    boundAt: row.bound_at,
    isPrimary: true,
  };
}

// ── LocalStorage fallback keys (wallet mock users) ───────────────────────────

const LS = {
  WALLETS: 'finodiv_wallets',
  PAYMENTS: 'finodiv_payments',
  CERTS: 'finodiv_certs',
};

function lsLoad<T>(key: string, def: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function lsSave(key: string, data: any) { localStorage.setItem(key, JSON.stringify(data)); }

// Is this a real Supabase UUID (not a mock u_xxx id)?
const isUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// ── BackendService ────────────────────────────────────────────────────────────

class BackendService {

  // --- Auth ---

  async loginWithGoogle(email: string, _name: string): Promise<User> {
    // Legacy shim: returns a minimal user object; real auth is via supabase.auth.signInWithOtp in App.tsx
    return {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name: email.split('@')[0],
      role: UserRole.LEARNER,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      status: 'active',
    };
  }

  async verifyWalletSignature(_address: string, _sig: string, _nonce: string): Promise<User | null> {
    return null;
  }

  // --- Courses ---

  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').eq('is_published', true).order('enrolled_count', { ascending: false });
    if (error || !data?.length) return [...COURSES];
    return data.map(dbCourseToUI);
  }

  async addCourse(course: Course): Promise<Course> {
    const row = {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price_usd: course.price,
      price_usdt: course.price,
      thumbnail_url: course.image || null,
    };
    const { error } = await supabase.from('courses').upsert(row);
    if (error) console.error('addCourse:', error);
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) console.error('deleteCourse:', error);
  }

  // --- Talents ---

  async getTalents(): Promise<Talent[]> {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, title, bio, skills, avatar_url, xp, level, verified, github_url, linkedin_url')
      .not('name', 'is', null)
      .neq('name', '')
      .order('xp', { ascending: false })
      .limit(30);
    if (!data?.length) return [...TALENTS];
    return data.map((row: any): Talent => ({
      id: row.id,
      name: row.name,
      title: row.title || 'Web3 Builder',
      bio: row.bio || 'A passionate Web3 professional on the FINODIV ecosystem.',
      skills: row.skills || [],
      avatar: row.avatar_url || `https://i.pravatar.cc/150?u=${row.id}`,
      verified: row.verified || row.level > 1,
      rating: Math.min(5, 3.5 + (row.xp || 0) / 2000),
      portfolio: [],
      feedback: [],
    }));
  }

  // --- Jobs ---

  async getJobs(): Promise<Array<{
    id: string; title: string; company: string; description: string;
    location: string; salaryRange: string; tags: string[]; createdAt: string;
  }>> {
    const { data } = await supabase
      .from('job_posts')
      .select('id, title, company, description, location, salary_range, tags, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!data) return [];
    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      description: row.description,
      location: row.location || 'Remote',
      salaryRange: row.salary_range || '',
      tags: row.tags || [],
      createdAt: row.created_at,
    }));
  }

  async applyToJob(userId: string, jobId: string, coverLetter: string): Promise<void> {
    if (!isUUID(userId)) return;
    // Check first to avoid duplicate key errors (no unique constraint guaranteed)
    const { data: existing } = await supabase
      .from('job_applications')
      .select('id')
      .eq('applicant_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();
    if (existing) return;
    await supabase.from('job_applications').insert({
      applicant_id: userId,
      job_id: jobId,
      cover_letter: coverLetter,
      status: 'PENDING',
    });
  }

  async getUserApplications(userId: string): Promise<string[]> {
    if (!isUUID(userId)) return [];
    const { data } = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('applicant_id', userId);
    return (data || []).map((r: any) => r.job_id);
  }

  // --- Wallet Binding ---

  async generateBindingNonce(userId: string): Promise<string> {
    const nonce = Math.random().toString(36).substr(2, 9);
    if (isUUID(userId)) {
      await supabase.from('wallet_bindings').upsert({ user_id: userId, address: 'pending', nonce }, { onConflict: 'user_id' });
    }
    return `Sign to bind your wallet to FINODIV account ${userId}. Nonce: ${nonce}`;
  }

  async bindWallet(userId: string, address: string, _signature: string): Promise<WalletBinding> {
    if (isUUID(userId)) {
      const { error } = await supabase.from('wallet_bindings').upsert(
        { user_id: userId, address, chain: 'BSC' },
        { onConflict: 'user_id' }
      );
      if (error) console.error('bindWallet:', error);
      // Also store address on profile
      await supabase.from('profiles').update({ wallet_address: address }).eq('id', userId);
    } else {
      const wallets = lsLoad<any[]>(LS.WALLETS, []);
      const existing = wallets.findIndex((w: any) => w.userId === userId);
      const binding = { userId, address, chainId: 56, boundAt: new Date().toISOString(), isPrimary: true };
      if (existing >= 0) wallets[existing] = binding; else wallets.push(binding);
      lsSave(LS.WALLETS, wallets);
    }
    return { userId, address, chainId: 56, boundAt: new Date().toISOString(), isPrimary: true };
  }

  async getBinding(userId: string): Promise<WalletBinding | undefined> {
    if (isUUID(userId)) {
      const { data } = await supabase.from('wallet_bindings').select('*').eq('user_id', userId).maybeSingle();
      return data ? dbBindingToUI(data) : undefined;
    }
    const wallets = lsLoad<any[]>(LS.WALLETS, []);
    return wallets.find((w: any) => w.userId === userId);
  }

  // --- Payments ---

  async initiatePayment(userId: string, courseId: string, method: PaymentMethod, amount: number): Promise<PaymentRecord> {
    if (isUUID(userId)) {
      const row = {
        user_id: userId,
        course_id: courseId,
        method: method === 'fiat_paystack' ? 'PAYSTACK' : 'USDT_BSC',
        amount_usd: amount,
        status: 'PENDING',
      };
      const { data, error } = await supabase.from('payments').insert(row).select().single();
      if (error) console.error('initiatePayment:', error);
      return data ? dbPaymentToUI(data) : this._mockPayment(userId, courseId, method, amount);
    }
    return this._mockPayment(userId, courseId, method, amount);
  }

  private _mockPayment(userId: string, courseId: string, method: PaymentMethod, amount: number): PaymentRecord {
    const p: PaymentRecord = {
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      userId, courseId, method, amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reference: method === 'fiat_paystack' ? `FINO-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined,
    };
    const payments = lsLoad<PaymentRecord[]>(LS.PAYMENTS, []);
    payments.push(p);
    lsSave(LS.PAYMENTS, payments);
    return p;
  }

  async confirmPayment(paymentId: string, txHashOrRef: string): Promise<PaymentRecord> {
    if (!paymentId.startsWith('pay_')) {
      const { data, error } = await supabase
        .from('payments')
        .update({ status: 'COMPLETED', tx_hash: txHashOrRef, tx_ref: txHashOrRef })
        .eq('id', paymentId)
        .select()
        .single();
      if (error) console.error('confirmPayment:', error);
      if (data) return dbPaymentToUI(data);
    }
    const payments = lsLoad<PaymentRecord[]>(LS.PAYMENTS, []);
    const p = payments.find(p => p.id === paymentId);
    if (p) {
      p.status = 'confirmed';
      p.txHash = txHashOrRef;
      lsSave(LS.PAYMENTS, payments);
      return new Promise(resolve => setTimeout(() => resolve(p!), 800));
    }
    return { id: paymentId, userId: '', courseId: '', method: 'fiat_paystack', amount: 0, status: 'confirmed', createdAt: '' };
  }

  async getPaymentForCourse(userId: string, courseId: string): Promise<PaymentRecord | undefined> {
    if (isUUID(userId)) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'COMPLETED')
        .maybeSingle();
      return data ? dbPaymentToUI(data) : undefined;
    }
    const payments = lsLoad<PaymentRecord[]>(LS.PAYMENTS, []);
    return payments.find(p => p.userId === userId && p.courseId === courseId && p.status === 'confirmed');
  }

  // --- Enrollments ---

  async enrollCourse(userId: string, courseId: string): Promise<void> {
    if (!isUUID(userId)) return;
    await supabase.from('enrollments').upsert(
      { user_id: userId, course_id: courseId, progress: 0 },
      { onConflict: 'user_id,course_id' }
    );
    // Bump enrolled_count
    await supabase.rpc('increment_enrolled_count', { course_id_arg: courseId }).catch(() => {});
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    if (!isUUID(userId)) return false;
    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    return !!data;
  }

  async getEnrollments(userId: string): Promise<Array<{ courseId: string; progress: number; course: Course | null }>> {
    if (!isUUID(userId)) return [];
    const { data } = await supabase
      .from('enrollments')
      .select('course_id, progress, courses(*)')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });
    if (!data) return [];
    return data.map((row: any) => ({
      courseId: row.course_id,
      progress: row.progress,
      course: row.courses ? dbCourseToUI(row.courses) : null,
    }));
  }

  async markLessonComplete(userId: string, courseId: string, lessonId: string, totalLessons: number): Promise<void> {
    if (!isUUID(userId)) return;
    // Check if lesson was already completed to avoid double XP
    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    const isNew = !existing;

    await supabase.from('lesson_progress').upsert(
      { user_id: userId, course_id: courseId, lesson_id: lessonId },
      { onConflict: 'user_id,course_id,lesson_id' }
    );

    const { count } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (count !== null && totalLessons > 0) {
      const pct = Math.round((count / totalLessons) * 100);
      await supabase.from('enrollments')
        .update({ progress: pct, completed_at: pct >= 100 ? new Date().toISOString() : null })
        .eq('user_id', userId)
        .eq('course_id', courseId);
    }

    // Award XP only for new completions
    if (isNew) {
      await supabase.rpc('award_lesson_xp', { user_id_arg: userId, xp_amount: 100 });
    }
  }

  // --- Certificates ---

  async getCertificates(userId: string): Promise<CertificateNFT[]> {
    if (isUUID(userId)) {
      const { data } = await supabase.from('certificates').select('*').eq('user_id', userId);
      return (data || []).map(dbCertToUI);
    }
    const certs = lsLoad<CertificateNFT[]>(LS.CERTS, []);
    return certs.filter(c => c.userId === userId);
  }

  async requestMint(userId: string, courseId: string, walletAddress: string): Promise<CertificateNFT> {
    if (isUUID(userId)) {
      const { data, error } = await supabase
        .from('certificates')
        .upsert(
          { user_id: userId, course_id: courseId, wallet_address: walletAddress, status: 'PENDING' },
          { onConflict: 'user_id,course_id' }
        )
        .select()
        .single();
      if (error) console.error('requestMint:', error);
      if (data) {
        // Simulate minting after 5s
        setTimeout(async () => {
          await supabase.from('certificates').update({
            status: 'MINTED',
            token_id: Math.floor(Math.random() * 100000).toString(),
            tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          }).eq('id', data.id);
        }, 5000);
        return dbCertToUI(data);
      }
    }
    // Mock fallback
    const cert: CertificateNFT = {
      id: `cert_${Math.random().toString(36).substr(2, 9)}`,
      userId, courseId, walletAddress, status: 'minting',
    };
    const certs = lsLoad<CertificateNFT[]>(LS.CERTS, []);
    certs.push(cert);
    lsSave(LS.CERTS, certs);
    setTimeout(() => {
      const idx = certs.findIndex(c => c.id === cert.id);
      if (idx >= 0) {
        certs[idx].status = 'minted';
        certs[idx].tokenId = Math.floor(Math.random() * 100000).toString();
        certs[idx].txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        certs[idx].issuedAt = new Date().toISOString();
        lsSave(LS.CERTS, certs);
      }
    }, 5000);
    return cert;
  }
}

export const api = new BackendService();
