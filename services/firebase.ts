
import { User, UserRole, Course } from '../types';
import { supabase } from './supabase';

function dbProfileToUser(row: any): User {
  return {
    id: row.id,
    email: row.email || '',
    name: row.name || (row.email ? row.email.split('@')[0] : 'Anonymous'),
    role: row.role as UserRole,
    avatar: row.avatar_url || `https://i.pravatar.cc/150?u=${row.id}`,
    authProvider: 'google',
    createdAt: row.created_at,
    status: ((row.status as string) || 'ACTIVE').toLowerCase() as 'active' | 'banned' | 'suspended',
    badge: row.badge || undefined,
  };
}

class FirebaseService {

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getUsers:', error); return []; }
    return (data || []).map(dbProfileToUser);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) console.error('updateUserRole:', error);
  }

  async assignBadge(userId: string, badge: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ badge: badge || null })
      .eq('id', userId);
    if (error) console.error('assignBadge:', error);
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BANNED' | 'SUSPENDED'): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);
    if (error) console.error('updateUserStatus:', error);
  }

  async addCourse(course: Course): Promise<void> {
    const { error } = await supabase.from('courses').upsert({
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
    });
    if (error) console.error('addCourse:', error);
  }

  async deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) console.error('deleteCourse:', error);
  }
}

export const db = new FirebaseService();
