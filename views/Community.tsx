
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';
import {
  Send, Pin, ShieldCheck, Trash2, X, Loader2,
  Plus, Hash, Users, LogIn, LogOut as LeaveIcon, Check,
  TrendingUp, DollarSign, Globe, AlertCircle,
} from 'lucide-react';

interface CommunityProps { role: UserRole; }

interface ChatRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_color: string;
  memberCount?: number;
}

interface Message {
  id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
  profiles: { name: string; role: string; avatar_url: string | null } | null;
}

interface CurrentUser { id: string; name: string; avatarUrl: string; }

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ROOM_ICONS: Record<string, React.ReactNode> = {
  'forex-hub': <DollarSign className="w-5 h-5" />,
  'web3-live': <TrendingUp className="w-5 h-5" />,
};

const PRESET_COLORS = ['#2F6DF2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

/* ── Toast helper ──────────────────────────────────────────────────────────── */
const Toast: React.FC<{ msg: string; onDismiss: () => void }> = ({ msg, onDismiss }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-red-600 text-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
    <AlertCircle className="w-4 h-4 shrink-0" />
    <span className="text-sm font-semibold">{msg}</span>
    <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const Community: React.FC<CommunityProps> = ({ role }) => {
  const isAdmin = role === UserRole.ADMIN || role === UserRole.MOD;

  const [currentUser, setCurrentUser]     = useState<CurrentUser | null>(null);
  const [rooms, setRooms]                 = useState<ChatRoom[]>([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState<Set<string>>(new Set());
  const [activeRoom, setActiveRoom]       = useState<ChatRoom | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [loadingRooms, setLoadingRooms]   = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [inputValue, setInputValue]       = useState('');
  const [sending, setSending]             = useState(false);
  const [showPinned, setShowPinned]       = useState(true);
  const [joiningId, setJoiningId]         = useState<string | null>(null);
  const [toastMsg, setToastMsg]           = useState<string | null>(null);

  /* admin create-room modal */
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [newColor, setNewColor]       = useState('#2F6DF2');
  const [creating, setCreating]       = useState(false);

  const chatEndRef  = useRef<HTMLDivElement>(null);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  /* ── Load current user ─────────────────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase
        .from('profiles').select('name, avatar_url').eq('id', user.id).maybeSingle();
      setCurrentUser({
        id: user.id,
        name: p?.name || user.email?.split('@')[0] || 'User',
        avatarUrl: p?.avatar_url || `https://i.pravatar.cc/100?u=${user.id}`,
      });
    });
  }, []);

  /* ── Load rooms + memberships ──────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const { data: roomData, error } = await supabase
        .from('chat_rooms').select('id,name,slug,description,icon_color')
        .eq('is_active', true).order('created_at', { ascending: true });

      if (error) { console.error('load rooms:', error); setLoadingRooms(false); return; }
      if (!roomData?.length) { setLoadingRooms(false); return; }

      /* member counts */
      const withCounts = await Promise.all(
        roomData.map(async (r: any) => {
          const { count } = await supabase
            .from('room_memberships').select('*', { count: 'exact', head: true }).eq('room_id', r.id);
          return { ...r, memberCount: count ?? 0 } as ChatRoom;
        })
      );
      setRooms(withCounts);

      /* user's memberships */
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: membs } = await supabase
          .from('room_memberships').select('room_id').eq('user_id', user.id);
        const ids = new Set((membs || []).map((m: any) => m.room_id as string));
        setJoinedRoomIds(ids);
        const first = withCounts.find(r => ids.has(r.id)) ?? withCounts[0];
        setActiveRoom(first ?? null);
      } else {
        setActiveRoom(withCounts[0] ?? null);
      }
      setLoadingRooms(false);
    })();
  }, []);

  /* ── Load messages + realtime per active room ──────────────────────────── */
  const loadMessages = useCallback(async (room: ChatRoom) => {
    setLoadingMsgs(true);
    setMessages([]);
    const { data, error } = await supabase
      .from('community_messages')
      .select('id, content, is_pinned, created_at, user_id, profiles(name, role, avatar_url)')
      .eq('channel', room.slug)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) console.error('load messages:', error);
    setMessages((data as Message[]) || []);
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);

    loadMessages(activeRoom);
    setShowPinned(true);

    const sub = supabase
      .channel(`comm_${activeRoom.slug}_${Date.now()}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `channel=eq.${activeRoom.slug}` },
        async (payload) => {
          /* Fetch full row with profiles JOIN now that SELECT is public */
          const { data } = await supabase
            .from('community_messages')
            .select('id, content, is_pinned, created_at, user_id, profiles(name, role, avatar_url)')
            .eq('id', payload.new.id).single();
          if (data) {
            setMessages(prev => prev.some(m => m.id === (data as any).id)
              ? prev
              : [...prev, data as unknown as Message]);
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_messages' },
        (payload) => {
          setMessages(prev => prev.map(m =>
            m.id === payload.new.id ? { ...m, is_pinned: payload.new.is_pinned } : m));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_messages' },
        (payload) => setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') console.error('Realtime channel error for', activeRoom.slug);
      });

    realtimeRef.current = sub;
    return () => { supabase.removeChannel(sub); };
  }, [activeRoom?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Join ──────────────────────────────────────────────────────────────── */
  const joinRoom = async (room: ChatRoom) => {
    if (!currentUser) { toast('You must be signed in to join a room.'); return; }
    setJoiningId(room.id);
    const { error } = await supabase
      .from('room_memberships')
      .insert({ user_id: currentUser.id, room_id: room.id });
    if (error) {
      console.error('join room:', error);
      toast(`Could not join room: ${error.message}`);
      setJoiningId(null);
      return;
    }
    setJoinedRoomIds(prev => new Set([...prev, room.id]));
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, memberCount: (r.memberCount ?? 0) + 1 } : r));
    setActiveRoom(room);
    setJoiningId(null);
  };

  /* ── Leave ─────────────────────────────────────────────────────────────── */
  const leaveRoom = async (room: ChatRoom) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('room_memberships')
      .delete().eq('user_id', currentUser.id).eq('room_id', room.id);
    if (error) { toast(`Could not leave room: ${error.message}`); return; }
    setJoinedRoomIds(prev => { const s = new Set(prev); s.delete(room.id); return s; });
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, memberCount: Math.max(0, (r.memberCount ?? 1) - 1) } : r));
  };

  /* ── Send message ──────────────────────────────────────────────────────── */
  const handleSend = async () => {
    if (!inputValue.trim() || !currentUser || !activeRoom || sending) return;
    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    const { data, error } = await supabase
      .from('community_messages')
      .insert({ user_id: currentUser.id, channel: activeRoom.slug, content })
      .select('id, content, is_pinned, created_at, user_id, profiles(name, role, avatar_url)')
      .single();

    setSending(false);

    if (error) {
      console.error('send message:', error);
      setInputValue(content); // restore so they don't lose their text
      toast(`Message not sent: ${error.message}`);
      return;
    }

    /* Optimistic add — Realtime will also fire but deduplicated by id */
    if (data) {
      setMessages(prev => prev.some(m => m.id === (data as any).id)
        ? prev
        : [...prev, data as unknown as Message]);
    }
  };

  /* ── Admin: pin / delete ───────────────────────────────────────────────── */
  const togglePin = async (msgId: string, current: boolean) => {
    const { error } = await supabase
      .from('community_messages').update({ is_pinned: !current }).eq('id', msgId);
    if (error) toast(`Pin failed: ${error.message}`);
  };

  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase
      .from('community_messages').delete().eq('id', msgId);
    if (error) toast(`Delete failed: ${error.message}`);
  };

  /* ── Admin: create room ────────────────────────────────────────────────── */
  const handleCreateRoom = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const slug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({ name: newName.trim(), slug, description: newDesc.trim(), icon_color: newColor, created_by: user?.id ?? null })
      .select().single();

    setCreating(false);
    if (error) {
      console.error('create room:', error);
      toast(`Could not create room: ${error.message}`);
      return;
    }
    if (data) {
      setRooms(prev => [...prev, { ...data, memberCount: 0 } as ChatRoom]);
      setActiveRoom({ ...data, memberCount: 0 } as ChatRoom);
    }
    setNewName(''); setNewDesc(''); setNewColor('#2F6DF2');
    setShowCreate(false);
  };

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  const isMember   = activeRoom ? joinedRoomIds.has(activeRoom.id) : false;
  const pinned     = messages.filter(m => m.is_pinned);
  const getAvatar  = (m: Message) => m.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${m.user_id}`;
  const getName    = (m: Message) => m.profiles?.name || 'User';
  const getRole    = (m: Message): UserRole => (m.profiles?.role as UserRole) || UserRole.LEARNER;
  const isOwn      = (m: Message) => m.user_id === currentUser?.id;

  /* Group by date */
  const grouped = messages.reduce<Array<{ date: string; msgs: Message[] }>>((acc, msg) => {
    const d = formatDate(msg.created_at);
    const last = acc[acc.length - 1];
    if (last?.date === d) last.msgs.push(msg);
    else acc.push({ date: d, msgs: [msg] });
    return acc;
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-[#0b0e14]">

      {/* Toast */}
      {toastMsg && <Toast msg={toastMsg} onDismiss={() => setToastMsg(null)} />}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-white/5 flex-col bg-white dark:bg-[#0b0e14] hidden md:flex">
        <div className="p-5 border-b border-slate-200 dark:border-white/5">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Chat Rooms</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingRooms ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
          ) : rooms.map(room => {
            const joined = joinedRoomIds.has(room.id);
            const active = activeRoom?.id === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                  style={{ backgroundColor: room.icon_color }}>
                  {ROOM_ICONS[room.slug] ?? <Hash className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold truncate ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                      {room.name}
                    </span>
                    {joined && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-gray-600">
                    <Users className="w-3 h-3" />
                    <span>{room.memberCount ?? 0} members</span>
                  </div>
                </div>
                {currentUser && (
                  <div className="opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    {joined ? (
                      <button onClick={e => { e.stopPropagation(); leaveRoom(room); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Leave">
                        <LeaveIcon className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); joinRoom(room); }}
                        disabled={joiningId === room.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Join">
                        {joiningId === room.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <LogIn className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <div className="p-3 border-t border-slate-200 dark:border-white/5">
            <button onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Create New Room
            </button>
          </div>
        )}
      </aside>

      {/* ── Chat area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-gray-600">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold">Select a room to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-[68px] bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: activeRoom.icon_color }}>
                  {ROOM_ICONS[activeRoom.slug] ?? <Hash className="w-4 h-4" />}
                </div>
                <div>
                  <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">{activeRoom.name}</h1>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Live · {activeRoom.memberCount ?? 0} members
                  </p>
                </div>
              </div>
              {currentUser && (
                isMember ? (
                  <button onClick={() => leaveRoom(activeRoom)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 transition-all">
                    <LeaveIcon className="w-3.5 h-3.5" /> Leave
                  </button>
                ) : (
                  <button onClick={() => joinRoom(activeRoom)} disabled={joiningId === activeRoom.id}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all disabled:opacity-60">
                    {joiningId === activeRoom.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                    Join Room
                  </button>
                )
              )}
            </div>

            {/* Pinned */}
            {pinned.length > 0 && showPinned && (
              <div className="bg-blue-50 dark:bg-blue-600/10 border-b border-blue-200 dark:border-blue-500/20 px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <div className="flex gap-4 overflow-x-auto whitespace-nowrap">
                    {pinned.map(pm => (
                      <span key={pm.id} className="text-xs font-bold text-blue-700 dark:text-blue-200/80 truncate max-w-xs pr-4 border-r border-blue-200 dark:border-blue-500/10 last:border-none">
                        {pm.content}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowPinned(false)} className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-white/5 text-blue-400 transition-all shrink-0 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-40 text-slate-500 dark:text-gray-500 select-none">
                  <Hash className="w-10 h-10 mb-3" />
                  <p className="font-bold text-sm">No messages yet — be the first!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {grouped.map(({ date, msgs }) => (
                    <div key={date}>
                      <div className="flex items-center gap-3 my-6 select-none">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 px-3">{date}</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                      </div>
                      <div className="space-y-4">
                        {msgs.map(msg => {
                          const own = isOwn(msg);
                          const sRole = getRole(msg);
                          return (
                            <div key={msg.id} className={`flex gap-3 group ${own ? 'flex-row-reverse' : ''}`}>
                              <img src={getAvatar(msg)} alt={getName(msg)}
                                className="w-9 h-9 rounded-2xl object-cover border-2 border-slate-200 dark:border-white/10 shrink-0" />
                              <div className={`flex flex-col max-w-[68%] ${own ? 'items-end' : ''}`}>
                                <div className={`flex items-center gap-2 mb-1.5 ${own ? 'flex-row-reverse' : ''}`}>
                                  <span className="text-xs font-black text-slate-700 dark:text-gray-300">{own ? 'You' : getName(msg)}</span>
                                  {(sRole === UserRole.ADMIN || sRole === UserRole.MOD) && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-400/20 text-[8px] font-black text-red-500 dark:text-red-400 uppercase tracking-widest flex items-center gap-1">
                                      <ShieldCheck className="w-2.5 h-2.5" /> Staff
                                    </span>
                                  )}
                                  <span className="text-[9px] text-slate-400 dark:text-gray-600">{formatTime(msg.created_at)}</span>
                                </div>
                                <div className={`
                                  relative px-4 py-3 rounded-[20px] group/bubble
                                  ${own
                                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-500/10'
                                    : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-gray-200 rounded-tl-sm shadow-sm dark:shadow-none'}
                                  ${msg.is_pinned ? 'ring-2 ring-blue-500/40' : ''}
                                `}>
                                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                                  {isAdmin && (
                                    <div className={`absolute top-1 opacity-0 group-hover/bubble:opacity-100 transition-all flex items-center gap-0.5 p-1 bg-white dark:bg-black/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/10 shadow-lg z-10 ${own ? 'right-full mr-2' : 'left-full ml-2'}`}>
                                      <button onClick={() => togglePin(msg.id, msg.is_pinned)}
                                        className={`p-1.5 rounded-lg transition-all ${msg.is_pinned ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/20' : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                        <Pin className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => deleteMessage(msg.id)}
                                        className="p-1.5 rounded-lg text-slate-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0e14] shrink-0">
              {!currentUser ? (
                <p className="text-center py-3 text-sm text-slate-400 dark:text-gray-600">Sign in to participate in the conversation</p>
              ) : !isMember ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                    Join <span className="font-black">{activeRoom.name}</span> to send messages
                  </p>
                  <button onClick={() => joinRoom(activeRoom)} disabled={joiningId === activeRoom.id}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all disabled:opacity-60">
                    {joiningId === activeRoom.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Join Room
                  </button>
                </div>
              ) : (
                <div className={`flex items-center gap-3 bg-slate-100 dark:bg-white/5 border rounded-2xl px-4 py-2 transition-all ${sending ? 'border-blue-400 dark:border-blue-500/50' : 'border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/30'}`}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={`Message #${activeRoom.name}...`}
                    disabled={sending}
                    className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 disabled:opacity-50"
                  />
                  <button onClick={handleSend} disabled={!inputValue.trim() || sending}
                    className={`p-2 rounded-xl transition-all shrink-0 ${inputValue.trim() && !sending ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20' : 'text-slate-300 dark:text-gray-700 cursor-not-allowed'}`}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
              <p className="text-[10px] text-center text-slate-300 dark:text-gray-700 font-bold uppercase tracking-widest mt-2">
                Be respectful · No spam · Follow community guidelines
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Create Room Modal ─────────────────────────────────────────────── */}
      {showCreate && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#0f1218] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Create Chat Room</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Room Name *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Crypto Signals"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Description</label>
                <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  placeholder="What is this room about?"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Room Colour</label>
                <div className="flex gap-3 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className={`w-9 h-9 rounded-xl transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-[#0f1218] scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleCreateRoom} disabled={!newName.trim() || creating}
              className="w-full mt-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {creating ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
