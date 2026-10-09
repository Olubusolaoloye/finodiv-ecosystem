
import { api as convexApi } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import {
  User, UserRole, WalletBinding, PaymentRecord, CertificateNFT,
  PaymentMethod, Course, Talent
} from '../types';
import { COURSES, TALENTS } from '../constants';
import { convex } from './convex';

// ── Convex → UI mappers ───────────────────────────────────────────────────────

function convexCourseToUI(row: any): Course {
  return {
    id: row._id as string,
    title: row.title,
    description: row.description,
    instructor: row.instructorName,
    price: row.price,
    category: row.category,
    level: row.level,
    duration: row.duration,
    image: row.imageUrl || `https://picsum.photos/seed/${row._id}/800/450`,
    rating: row.rating,
    niche: row.niche || row.category,
  };
}

function convexPaymentToUI(row: any): PaymentRecord {
  return {
    id: row._id as string,
    userId: row.userId,
    courseId: row.courseId as string,
    method: row.method as PaymentMethod,
    amount: row.amount,
    status: row.status as any,
    txHash: row.txHash,
    reference: row.reference,
    createdAt: new Date(row._creationTime).toISOString(),
  };
}

function convexCertToUI(row: any): CertificateNFT {
  return {
    id: row._id as string,
    userId: row.userId,
    walletAddress: row.walletAddress || '',
    courseId: row.courseId as string,
    tokenId: row.tokenId,
    txHash: row.txHash,
    status: row.status as 'unclaimed' | 'minting' | 'minted',
    issuedAt: row.issuedAt ? new Date(row.issuedAt).toISOString() : undefined,
  };
}

// ── LocalStorage fallback (wallet-only / demo users) ────────────────────────

const LS = {
  WALLETS: 'finodiv_wallets',
  PAYMENTS: 'finodiv_payments',
  CERTS: 'finodiv_certs',
};

function lsLoad<T>(key: string, def: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function lsSave(key: string, data: any) { localStorage.setItem(key, JSON.stringify(data)); }

// Is this a real Supabase UUID (not a mock u_xxx wallet id)?
const isUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// ── BackendService ────────────────────────────────────────────────────────────

class BackendService {

  // --- Auth ---

  async loginWithGoogle(email: string, _name: string): Promise<User> {
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
    try {
      const data = await convex.query(convexApi.courses.listPublished, {});
      return data.length ? data.map(convexCourseToUI) : [...COURSES];
    } catch {
      return [...COURSES];
    }
  }

  async addCourse(course: Course): Promise<Course> {
    try {
      await convex.mutation(convexApi.courses.create, {
        title: course.title,
        description: course.description,
        instructorId: 'admin',
        instructorName: course.instructor,
        price: course.price,
        category: course.category,
        level: (course.level as any) || 'Beginner',
        duration: course.duration,
        imageUrl: course.image || undefined,
        niche: course.niche || undefined,
      });
    } catch (e) {
      console.error('addCourse:', e);
    }
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await convex.mutation(convexApi.courses.deleteById, { id: id as Id<'courses'> });
    } catch (e) {
      console.error('deleteCourse:', e);
    }
  }

  async updateCourse(id: string, patch: Partial<Course>): Promise<void> {
    try {
      const args: Record<string, unknown> = { id: id as Id<'courses'> };
      if (patch.title       !== undefined) args.title    = patch.title;
      if (patch.description !== undefined) args.description = patch.description;
      if (patch.price       !== undefined) args.price    = patch.price;
      if (patch.category    !== undefined) args.category = patch.category;
      if (patch.level       !== undefined) args.level    = patch.level;
      if (patch.image       !== undefined) args.imageUrl = patch.image;
      await convex.mutation(convexApi.courses.update, args as any);
    } catch (e) {
      console.error('updateCourse:', e);
    }
  }

  // --- Talents ---

  async getTalents(): Promise<Talent[]> {
    try {
      const profiles = await convex.query(convexApi.profiles.getLeaderboard, { limit: 30 });
      if (!profiles.length) return [...TALENTS];
      return profiles.map((row: any): Talent => ({
        id: row.userId,
        name: row.name,
        title: 'Web3 Builder',
        bio: row.bio || 'A passionate Web3 professional on the FINODIV ecosystem.',
        skills: [],
        avatar: row.avatarUrl || `https://i.pravatar.cc/150?u=${row.userId}`,
        verified: row.xp > 100,
        rating: Math.min(5, 3.5 + (row.xp || 0) / 2000),
        portfolio: [],
        feedback: [],
      }));
    } catch {
      return [...TALENTS];
    }
  }

  // --- Jobs ---

  async getJobs(): Promise<Array<{
    id: string; title: string; company: string; description: string;
    location: string; salaryRange: string; tags: string[]; createdAt: string;
    postedBy?: string;
  }>> {
    try {
      const jobs = await convex.query(convexApi.jobs.listActive, {});
      return jobs.map((row: any) => ({
        id: row._id as string,
        title: row.title,
        company: row.company,
        description: row.description,
        location: row.location,
        salaryRange: row.salaryRange || '',
        tags: row.skills || [],
        createdAt: new Date(row._creationTime).toISOString(),
        postedBy: row.postedBy,
      }));
    } catch {
      return [];
    }
  }

  async applyToJob(userId: string, jobId: string, coverLetter: string): Promise<void> {
    if (!isUUID(userId)) return;
    try {
      await convex.mutation(convexApi.jobs.applyToJob, {
        jobId: jobId as Id<'jobs'>,
        userId,
        coverLetter,
      });
    } catch (e) {
      console.error('applyToJob:', e);
    }
  }

  async getUserApplications(userId: string): Promise<string[]> {
    if (!isUUID(userId)) return [];
    try {
      const apps = await convex.query(convexApi.jobs.getApplicationsForUser, { userId });
      return apps.map((a: any) => a.jobId as string);
    } catch {
      return [];
    }
  }

  // --- Wallet Binding (stored on profile in Convex) ---

  async generateBindingNonce(userId: string): Promise<string> {
    const nonce = Math.random().toString(36).substr(2, 9);
    return `Sign to bind your wallet to FINODIV account ${userId}. Nonce: ${nonce}`;
  }

  async bindWallet(userId: string, address: string, _signature: string): Promise<WalletBinding> {
    const binding: WalletBinding = { userId, address, chainId: 56, boundAt: new Date().toISOString(), isPrimary: true };
    if (isUUID(userId)) {
      try {
        // Fetch current profile to keep name/email
        const profile = await convex.query(convexApi.profiles.getByUserId, { userId });
        await convex.mutation(convexApi.profiles.upsert, {
          userId,
          name: profile?.name || '',
          email: profile?.email || '',
          walletAddress: address,
        });
      } catch (e) {
        console.error('bindWallet:', e);
      }
    } else {
      const wallets = lsLoad<any[]>(LS.WALLETS, []);
      const idx = wallets.findIndex((w: any) => w.userId === userId);
      if (idx >= 0) wallets[idx] = binding; else wallets.push(binding);
      lsSave(LS.WALLETS, wallets);
    }
    return binding;
  }

  async getBinding(userId: string): Promise<WalletBinding | undefined> {
    if (isUUID(userId)) {
      try {
        const profile = await convex.query(convexApi.profiles.getByUserId, { userId });
        if (!profile?.walletAddress) return undefined;
        return { userId, address: profile.walletAddress, chainId: 56, boundAt: '', isPrimary: true };
      } catch {
        return undefined;
      }
    }
    const wallets = lsLoad<any[]>(LS.WALLETS, []);
    return wallets.find((w: any) => w.userId === userId);
  }

  // --- Payments ---

  async initiatePayment(userId: string, courseId: string, method: PaymentMethod, amount: number): Promise<PaymentRecord> {
    if (isUUID(userId)) {
      try {
        const ref = method === 'fiat_paystack'
          ? `FINO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
          : undefined;
        const id = await convex.mutation(convexApi.payments.create, {
          userId,
          courseId: courseId as Id<'courses'>,
          amount,
          method,
          reference: ref,
        });
        return {
          id: id as string,
          userId,
          courseId,
          method,
          amount,
          status: 'pending',
          reference: ref,
          createdAt: new Date().toISOString(),
        };
      } catch (e) {
        console.error('initiatePayment:', e);
      }
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
      try {
          await convex.mutation(convexApi.payments.confirm, {
          paymentId: paymentId as Id<'payments'>,
          txHash: txHashOrRef,
          reference: txHashOrRef,
        });
        return {
          id: paymentId,
          userId: '',
          courseId: '',
          method: 'fiat_paystack',
          amount: 0,
          status: 'confirmed',
          txHash: txHashOrRef,
          createdAt: new Date().toISOString(),
        };
      } catch (e) {
        console.error('confirmPayment:', e);
      }
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
      try {
          const data = await convex.query(convexApi.payments.getByUserCourse, {
          userId,
          courseId: courseId as Id<'courses'>,
        });
        return data ? convexPaymentToUI(data) : undefined;
      } catch {
        return undefined;
      }
    }
    const payments = lsLoad<PaymentRecord[]>(LS.PAYMENTS, []);
    return payments.find(p => p.userId === userId && p.courseId === courseId && p.status === 'confirmed');
  }

  // --- Enrollments ---

  async enrollCourse(userId: string, courseId: string): Promise<void> {
    if (!isUUID(userId)) return;
    try {
      await convex.mutation(convexApi.enrollments.enroll, {
        userId,
        courseId: courseId as Id<'courses'>,
      });
    } catch (e) {
      console.error('enrollCourse:', e);
    }
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    if (!isUUID(userId)) return false;
    try {
      const enrollment = await convex.query(convexApi.enrollments.getEnrollment, {
        userId,
        courseId: courseId as Id<'courses'>,
      });
      return !!enrollment;
    } catch {
      return false;
    }
  }

  async getEnrollments(userId: string): Promise<Array<{ courseId: string; progress: number; course: Course | null }>> {
    if (!isUUID(userId)) return [];
    try {
      const enrollments = await convex.query(convexApi.enrollments.getForUser, { userId });
      const results = await Promise.all(
        enrollments.map(async (e: any) => {
          try {
            const course = await convex.query(convexApi.courses.getById, { id: e.courseId });
            return {
              courseId: e.courseId as string,
              progress: e.progress,
              course: course ? convexCourseToUI(course) : null,
            };
          } catch {
            return { courseId: e.courseId as string, progress: e.progress, course: null };
          }
        })
      );
      return results;
    } catch {
      return [];
    }
  }

  async markLessonComplete(userId: string, courseId: string, lessonId: string, _totalLessons: number): Promise<void> {
    if (!isUUID(userId)) return;
    try {
      await convex.mutation(convexApi.enrollments.completeLesson, {
        userId,
        courseId: courseId as Id<'courses'>,
        lessonId: lessonId as Id<'lessons'>,
      });
    } catch (e) {
      console.error('markLessonComplete:', e);
    }
  }

  // --- Certificates ---

  async getCertificates(userId: string): Promise<CertificateNFT[]> {
    if (isUUID(userId)) {
      try {
        const data = await convex.query(convexApi.certificates.getForUser, { userId });
        return data.map(convexCertToUI);
      } catch {
        return [];
      }
    }
    const certs = lsLoad<CertificateNFT[]>(LS.CERTS, []);
    return certs.filter(c => c.userId === userId);
  }

  async requestMint(userId: string, courseId: string, walletAddress: string): Promise<CertificateNFT> {
    if (isUUID(userId)) {
      try {
        // Find the cert for this user + course
        const existing = await convex.query(convexApi.certificates.getForUserCourse, {
          userId,
          courseId: courseId as Id<'courses'>,
        });
        const certId = existing?._id;
        if (certId) {
          await convex.mutation(convexApi.certificates.startMinting, {
            certificateId: certId,
            walletAddress,
          });
          // Simulate mint after 5s
          setTimeout(async () => {
            try {
              // No public confirmMinted — that's internal. Simulate locally.
              const cert = await convex.query(convexApi.certificates.getForUserCourse, {
                userId,
                courseId: courseId as Id<'courses'>,
              });
              if (cert) {
                // Use the internal mutation via backend — for now just leave as minting
              }
            } catch {}
          }, 5000);
          return convexCertToUI({ ...existing, status: 'minting', walletAddress });
        }
      } catch (e) {
        console.error('requestMint:', e);
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
