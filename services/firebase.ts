import { User, UserRole, Course } from '../types';
import { convex } from './convex';
import { api as convexApi } from '../convex/_generated/api';

function profileToUser(row: any): User {
  return {
    id: row.userId,
    email: row.email || '',
    name: row.name || (row.email ? row.email.split('@')[0] : 'Anonymous'),
    role: row.role as UserRole,
    avatar: row.avatarUrl || `https://i.pravatar.cc/150?u=${row.userId}`,
    authProvider: 'google',
    createdAt: new Date(row._creationTime).toISOString(),
    status: ((row.status as string) || 'active').toLowerCase() as 'active' | 'banned' | 'suspended',
    badge: row.badge || undefined,
  };
}

class FirebaseService {

  async getUsers(): Promise<User[]> {
    try {
      const data = await convex.query(convexApi.profiles.getLeaderboard, { limit: 200 });
      return (data || []).map(profileToUser);
    } catch (e) { console.error('getUsers:', e); return []; }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      await convex.mutation(convexApi.profiles.updateRole, { userId, role: role as any });
    } catch (e) { console.error('updateUserRole:', e); }
  }

  async assignBadge(userId: string, badge: string): Promise<void> {
    try {
      const prof = await convex.query(convexApi.profiles.getByUserId, { userId });
      if (prof) {
        await convex.mutation(convexApi.profiles.upsert, {
          userId,
          name: prof.name,
          email: prof.email,
        });
      }
    } catch (e) { console.error('assignBadge:', e); }
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BANNED' | 'SUSPENDED'): Promise<void> {
    // Convex status is lowercase; map accordingly
    const mapped = status.toLowerCase() as 'active' | 'banned' | 'suspended';
    try {
      const prof = await convex.query(convexApi.profiles.getByUserId, { userId });
      if (prof) {
        await convex.mutation(convexApi.profiles.upsert, {
          userId,
          name: prof.name,
          email: prof.email,
        });
      }
    } catch (e) { console.error('updateUserStatus:', e); }
    // Note: status mutation uses internal; call backend api instead
    console.warn('updateUserStatus mapped to', mapped, '— use backend.ts updateUserStatus for full support');
  }

  async addCourse(_course: Course): Promise<void> {
    console.warn('addCourse: use backend.ts api.addCourse instead');
  }

  async deleteCourse(_courseId: string): Promise<void> {
    console.warn('deleteCourse: use backend.ts api.deleteCourse instead');
  }
}

export const db = new FirebaseService();
