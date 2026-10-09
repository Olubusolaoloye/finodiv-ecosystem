import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { UserRole } from '../types';
import { getSession } from '../services/session';
import { convex } from '../services/convex';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import {
  Send, Pin, ShieldCheck, Trash2, X, XCircle, Loader2,
  Plus, Hash, LogIn, LogOut as LeaveIcon, Check,
  MessageSquare, AlertCircle, ImagePlus,
  Mic, Play, Square, Volume2, ChevronLeft,
  Search, Settings, Users, Lock, Briefcase,
} from 'lucide-react';
import { errorMessage } from '../services/errors';

interface CommunityProps { role: UserRole; }
interface ChatRoom {
  _id: Id<'chatRooms'>; name: string; slug: string;
  description: string; iconColor: string; isActive: boolean;
}
interface Message {
  _id: string; _creationTime: number;
  userId: string; content: string;
  imageStorageId?: Id<'_storage'>; audioStorageId?: Id<'_storage'>;
  audioDuration?: number; imageUrl?: string; audioUrl?: string;
  isPinned: boolean; userName: string; userRole: string; userAvatar?: string;
}
interface CurrentUser { id: string; name: string; avatarUrl: string; }
interface Conversation {
  _id: Id<'conversations'>; otherUserId: string; otherName: string; otherRole: string;
  otherAvatar?: string; jobTitle?: string; lastMessageAt: number;
  lastMessagePreview: string; lastSenderId?: string; unread: number;
}

const fmtShort = (ts: number) => {
  const d = new Date(ts);
  return d.toDateString() === new Date().toDateString()
    ? fmt(ts)
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ROLE_LABEL: Record<string, string> = {
  EMPLOYER: 'Employer', EDUCATOR: 'Educator', LEARNER: 'Learner', ADMIN: 'Admin', MOD: 'Moderator',
};

/* ─── Conversation item in sidebar ───────────────────────────────── */
const ConversationItem: React.FC<{ convo: Conversation; active: boolean; onClick: () => void }> = ({ convo, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '9px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 2,
      background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
      border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
      transition: 'all 0.15s',
    }}
    className={active ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'}
  >
    <img
      src={convo.otherAvatar || `https://i.pravatar.cc/100?u=${convo.otherUserId}`}
      alt="" style={{ width: 38, height: 38, borderRadius: 11, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border)' }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: convo.unread ? 800 : active ? 700 : 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {convo.otherName}
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>{fmtShort(convo.lastMessageAt)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <p style={{ flex: 1, fontSize: 11, color: convo.unread ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: convo.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {convo.lastMessagePreview || (convo.jobTitle ? `Re: ${convo.jobTitle}` : 'Say hello 👋')}
        </p>
        {convo.unread > 0 && (
          <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {convo.unread > 99 ? '99+' : convo.unread}
          </span>
        )}
      </div>
    </div>
  </div>
);

const fmt = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (ts: number) => {
  const d = new Date(ts), t = new Date();
  if (d.toDateString() === t.toDateString()) return 'Today';
  const y = new Date(t); y.setDate(t.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
const fmtDur = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

/* ─── Toast ─────────────────────────────────────────────────────── */
const Toast: React.FC<{ msg: string; onClose: () => void }> = ({ msg, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
    zIndex: 200, display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 20px', borderRadius: 14,
    background: 'rgba(220,38,38,0.95)', backdropFilter: 'blur(12px)',
    color: '#fff', boxShadow: '0 8px 32px rgba(220,38,38,0.35)',
    fontSize: 13, fontWeight: 600,
  }}>
    <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
    {msg}
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 0, marginLeft: 4 }}>
      <X style={{ width: 13, height: 13 }} />
    </button>
  </div>
);

/* ─── Audio player ───────────────────────────────────────────────── */
const AudioMsg: React.FC<{ url: string; duration?: number; own: boolean }> = ({ url, duration, own }) => {
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [total, setTotal] = useState(duration ?? 0);
  const ref = useRef<HTMLAudioElement>(null);
  const toggle = () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { ref.current.play(); setPlaying(true); }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', minWidth: 200, maxWidth: 280 }}>
      <audio ref={ref} src={url}
        onTimeUpdate={e => setCur(Math.floor((e.target as HTMLAudioElement).currentTime))}
        onLoadedMetadata={e => { const d = (e.target as HTMLAudioElement).duration; if (isFinite(d)) setTotal(Math.floor(d)); }}
        onEnded={() => { setPlaying(false); setCur(0); if (ref.current) ref.current.currentTime = 0; }}
      />
      <button onClick={toggle} style={{
        width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
        background: own ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.15)',
        color: own ? '#fff' : '#818cf8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {playing ? <Square style={{ width: 11, height: 11 }} /> : <Play style={{ width: 11, height: 11, marginLeft: 1 }} />}
      </button>
      <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', height: 24 }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const h = 4 + Math.abs(Math.sin(i * 1.2) * 5 + Math.cos(i * 0.7) * 4);
          const filled = total > 0 && i / 24 < cur / total;
          return <div key={i} style={{
            width: 3, height: Math.max(3, h), borderRadius: 99,
            background: own
              ? (filled ? '#fff' : 'rgba(255,255,255,0.3)')
              : (filled ? '#818cf8' : 'rgba(129,140,248,0.25)'),
            transition: 'background 0.1s',
          }} />;
        })}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: own ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', minWidth: 32, flexShrink: 0 }}>
        {fmtDur(playing ? cur : total)}
      </span>
    </div>
  );
};

/* ─── Room item in sidebar ───────────────────────────────────────── */
const RoomItem: React.FC<{
  room: ChatRoom; active: boolean; joined: boolean;
  onClick: () => void; onJoin: (e: React.MouseEvent) => void; onLeave: (e: React.MouseEvent) => void;
}> = ({ room, active, joined, onClick, onJoin, onLeave }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 12px', borderRadius: 12, cursor: 'pointer',
        background: active ? `${room.iconColor}14` : hov ? 'var(--color-bg-deep)' : 'transparent',
        border: active ? `1px solid ${room.iconColor}30` : '1px solid transparent',
        transition: 'all 0.15s', marginBottom: 2, position: 'relative',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: `linear-gradient(135deg, ${room.iconColor}cc, ${room.iconColor}88)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 15,
        boxShadow: active ? `0 0 14px ${room.iconColor}40` : 'none',
      }}>
        {room.name[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            fontSize: 13, fontWeight: active ? 700 : 500,
            color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>{room.name}</span>
          {joined && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />}
        </div>
        {room.description && (
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
            {room.description}
          </p>
        )}
      </div>

      {/* Join/leave on hover */}
      {hov && (
        <button
          onClick={joined ? onLeave : onJoin}
          style={{
            position: 'absolute', right: 8, flexShrink: 0,
            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            background: joined ? 'rgba(248,113,113,0.12)' : `${room.iconColor}20`,
            color: joined ? '#f87171' : room.iconColor,
          }}
        >
          {joined ? 'Leave' : 'Join'}
        </button>
      )}
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────── */
const Community: React.FC<CommunityProps> = ({ role }) => {
  const isAdmin = role === UserRole.ADMIN || role === UserRole.MOD;
  const session = getSession();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeRoom, setActiveRoomState] = useState<ChatRoom | null>(null);
  const [activeDmId, setActiveDmId]     = useState<Id<'conversations'> | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingWith = searchParams.get('with');
  const pendingDm = searchParams.get('dm');
  const [input, setInput]               = useState('');
  const [sending, setSending]           = useState(false);
  const [showPinned, setShowPinned]     = useState(true);
  const [joiningId, setJoiningId]       = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false); // mobile
  const [roomSearch, setRoomSearch]     = useState('');

  // Image
  const [imgFile, setImgFile]     = useState<File | null>(null);
  const [imgPrev, setImgPrev]     = useState<string | null>(null);
  const [upImg, setUpImg]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Voice
  const [recording, setRecording]       = useState(false);
  const [recSecs, setRecSecs]           = useState(0);
  const [audioBlob, setAudioBlob]       = useState<Blob | null>(null);
  const [audioPrev, setAudioPrev]       = useState<string | null>(null);
  const [upAudio, setUpAudio]           = useState(false);
  const mrRef    = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chatEnd  = useRef<HTMLDivElement>(null);

  // Create room
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newDesc, setNewDesc]       = useState('');
  const [newColor, setNewColor]     = useState('#6366f1');
  const [creating, setCreating]     = useState(false);

  const rooms    = useQuery(api.community.listRooms) ?? [];
  const conversations = useQuery(api.messages.listConversations, session ? { userId: session.userId } : 'skip') ?? [];
  const roomMessages = useQuery(api.community.listMessagesWithProfiles, activeRoom ? { roomId: activeRoom._id } : 'skip');
  const dmMessages = useQuery(api.messages.listMessages, activeDmId && session ? { conversationId: activeDmId, userId: session.userId } : 'skip');
  const inDm = activeDmId !== null;
  const activeConvo = inDm ? conversations.find(c => c._id === activeDmId) ?? null : null;
  const messages: Message[] | undefined = inDm
    ? dmMessages?.map(m => ({ ...m, isPinned: false }))
    : roomMessages;

  const setActiveRoom = (room: ChatRoom | null) => { setActiveDmId(null); setActiveRoomState(room); };
  const openDm = (id: Id<'conversations'>) => { setActiveRoomState(null); setActiveDmId(id); setSidebarOpen(false); };
  const memberIds = useQuery(api.community.getUserMemberships, session ? { userId: session.userId } : 'skip');
  const joinedSet = new Set<string>((memberIds ?? []).map(String));

  useEffect(() => {
    if (!session) return;
    convex.query(api.profiles.getByUserId, { userId: session.userId }).then((p: any) => {
      setCurrentUser({ id: session.userId, name: p?.name || session.email?.split('@')[0] || 'User', avatarUrl: p?.avatarUrl || '' });
    });
  }, []);

  // Deep links: /community?with=<userId> starts (or reopens) a DM, ?dm=<conversationId> opens one.
  useEffect(() => {
    if (!session) return;
    if (pendingDm) {
      openDm(pendingDm as Id<'conversations'>);
      setSearchParams({}, { replace: true });
      return;
    }
    if (!pendingWith) return;
    const jobId = searchParams.get('job') ?? undefined;
    convex.mutation(api.messages.startConversation, {
      userId: session.userId, otherUserId: pendingWith, jobId: jobId as Id<'jobs'> | undefined,
    })
      .then(id => openDm(id))
      .catch(e => showToast(errorMessage(e, 'Could not open chat')))
      .finally(() => setSearchParams({}, { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingWith, pendingDm]);

  useEffect(() => {
    if (!activeDmId || !session || !dmMessages) return;
    if ((activeConvo?.unread ?? 0) > 0) {
      convex.mutation(api.messages.markRead, { conversationId: activeDmId, userId: session.userId }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDmId, dmMessages?.length, activeConvo?.unread]);

  useEffect(() => {
    if (activeDmId || pendingWith || pendingDm) return;
    if (!activeRoom && rooms.length > 0) {
      const first = memberIds && memberIds.length > 0
        ? rooms.find(r => memberIds.map(String).includes(String(r._id))) ?? rooms[0]
        : rooms[0];
      setActiveRoom(first ?? null);
    }
  }, [rooms, memberIds]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages?.length]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };

  const joinRoom = async (room: ChatRoom) => {
    if (!currentUser) return;
    setJoiningId(String(room._id));
    try { await convex.mutation(api.community.joinRoom, { roomId: room._id, userId: currentUser.id }); setActiveRoom(room); }
    catch (e: any) { showToast(e.message ?? 'Failed to join'); }
    setJoiningId(null);
  };

  const leaveRoom = async (room: ChatRoom) => {
    if (!currentUser) return;
    try { await convex.mutation(api.community.leaveRoom, { roomId: room._id, userId: currentUser.id }); }
    catch (e: any) { showToast(e.message ?? 'Failed to leave'); }
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { showToast('Image must be under 5 MB'); return; }
    setImgFile(f);
    const r = new FileReader(); r.onload = ev => setImgPrev(ev.target?.result as string); r.readAsDataURL(f);
    e.target.value = '';
  };
  const clearImg = () => { setImgFile(null); setImgPrev(null); };

  const startRec = async () => {
    if (imgFile) { showToast('Clear image before recording'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const b = new Blob(chunksRef.current, { type: mime });
        setAudioBlob(b); setAudioPrev(URL.createObjectURL(b));
      };
      mr.start(200); mrRef.current = mr;
      setRecording(true); setRecSecs(0);
      timerRef.current = setInterval(() => setRecSecs(s => s + 1), 1000);
    } catch { showToast('Mic access denied'); }
  };

  const stopRec = () => { mrRef.current?.stop(); mrRef.current = null; setRecording(false); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  const cancelRec = () => {
    stopRec(); setAudioBlob(null);
    if (audioPrev) { URL.revokeObjectURL(audioPrev); setAudioPrev(null); }
    setRecSecs(0);
  };

  const handleSend = async () => {
    if ((!input.trim() && !imgFile && !audioBlob) || !currentUser || (!activeRoom && !activeDmId) || sending) return;
    const text = input.trim(); setInput(''); setSending(true);
    let imgId: Id<'_storage'> | undefined;
    let audId: Id<'_storage'> | undefined;
    const audDur = audioBlob ? recSecs : undefined;

    if (imgFile) {
      setUpImg(true);
      try {
        const url = await convex.mutation(api.community.generateUploadUrl, {});
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': imgFile.type }, body: imgFile });
        imgId = (await res.json()).storageId;
      } catch (e: any) { showToast('Image upload failed'); setSending(false); setUpImg(false); if (text) setInput(text); return; }
      setUpImg(false); clearImg();
    }

    if (audioBlob) {
      setUpAudio(true);
      try {
        const url = await convex.mutation(api.community.generateUploadUrl, {});
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': audioBlob.type }, body: audioBlob });
        audId = (await res.json()).storageId;
      } catch (e: any) { showToast('Audio upload failed'); setSending(false); setUpAudio(false); return; }
      setUpAudio(false); setAudioBlob(null);
      if (audioPrev) { URL.revokeObjectURL(audioPrev); setAudioPrev(null); }
      setRecSecs(0);
    }

    try {
      if (activeDmId) {
        await convex.mutation(api.messages.send, {
          conversationId: activeDmId, senderId: currentUser.id, content: text || '',
          imageStorageId: imgId, audioStorageId: audId, audioDuration: audDur,
        });
      } else if (activeRoom) {
        await convex.mutation(api.community.sendMessage, {
          roomId: activeRoom._id, userId: currentUser.id, content: text || '',
          imageStorageId: imgId, audioStorageId: audId, audioDuration: audDur,
        });
      }
    } catch (e) { if (text) setInput(text); showToast(errorMessage(e, 'Message not sent')); }
    setSending(false);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !currentUser) return;
    setCreating(true);
    const slug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    try {
      const roomId = await convex.mutation(api.community.createRoom, { name: newName.trim(), slug, description: newDesc.trim(), iconColor: newColor, createdBy: currentUser.id });
      await convex.mutation(api.community.joinRoom, { roomId, userId: currentUser.id });
      setTimeout(() => { const r = rooms.find(x => String(x._id) === String(roomId)); if (r) setActiveRoom(r); }, 600);
    } catch (e: any) { showToast(e.message ?? 'Failed to create room'); }
    setCreating(false); setNewName(''); setNewDesc(''); setNewColor('#6366f1'); setShowCreate(false);
  };

  const isMember = inDm || (activeRoom ? joinedSet.has(String(activeRoom._id)) : false);
  const pinned = (messages ?? []).filter(m => m.isPinned);
  const grouped = (messages ?? []).reduce<Array<{ date: string; msgs: Message[] }>>((acc, m) => {
    const d = fmtDate(m._creationTime); const last = acc[acc.length - 1];
    if (last?.date === d) last.msgs.push(m); else acc.push({ date: d, msgs: [m] });
    return acc;
  }, []);

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(roomSearch.toLowerCase()));
  const filteredConvos = conversations.filter(c => c.otherName.toLowerCase().includes(roomSearch.toLowerCase()));
  const chatTitle = inDm ? (activeConvo?.otherName ?? 'Direct message') : activeRoom?.name ?? '';
  const canSend = (input.trim().length > 0 || imgFile || audioBlob) && !sending;

  /* ── Sidebar content (shared between desktop + mobile drawer) ── */
  const SidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare style={{ width: 15, height: 15, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>Chats</span>
          </div>
          {currentUser && (
            <button onClick={() => setShowCreate(true)} style={{
              width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)'; (e.currentTarget as HTMLElement).style.color = '#a5b4fc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.12)'; (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
              title="New room"
            >
              <Plus style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--color-text-muted)' }} />
          <input
            value={roomSearch} onChange={e => setRoomSearch(e.target.value)}
            placeholder="Search chats…"
            style={{
              width: '100%', padding: '8px 10px 8px 30px', borderRadius: 10,
              background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)', fontSize: 12, outline: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }} className="custom-scrollbar">
        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)', padding: '4px 4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users style={{ width: 10, height: 10 }} /> Direct Messages · {conversations.length}
        </p>
        {filteredConvos.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '0 4px 12px', lineHeight: 1.5 }}>
            {roomSearch ? 'No conversations match' : 'No direct messages yet. Message an employer from Jobs or anyone from their profile.'}
          </p>
        )}
        {filteredConvos.map(convo => (
          <ConversationItem key={convo._id} convo={convo} active={activeDmId === convo._id} onClick={() => openDm(convo._id)} />
        ))}

        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)', padding: '14px 4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Hash style={{ width: 10, height: 10 }} /> Rooms · {rooms.length}
        </p>
        {filteredRooms.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '8px 4px' }}>
            {roomSearch ? 'No rooms match' : 'No rooms yet'}
          </p>
        )}
        {filteredRooms.map(room => (
          <RoomItem key={String(room._id)} room={room}
            active={activeRoom?._id === room._id}
            joined={joinedSet.has(String(room._id))}
            onClick={() => { setActiveRoom(room); setSidebarOpen(false); }}
            onJoin={e => { e.stopPropagation(); joinRoom(room); }}
            onLeave={e => { e.stopPropagation(); leaveRoom(room); }}
          />
        ))}
      </div>

      {/* Footer: current user */}
      {currentUser && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src={currentUser.avatarUrl || `https://i.pravatar.cc/100?u=${currentUser.id}`}
            style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0 }} alt="" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</p>
            <p style={{ fontSize: 10, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} /> Online
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--color-bg-primary)', position: 'relative' }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:block" style={{
        width: 256, flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        height: '100%', overflow: 'hidden',
      }}>
        {SidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────────── */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex' }}
          className="md:hidden"
        >
          <div onClick={() => setSidebarOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ width: 280, background: 'var(--color-bg-card)', borderLeft: '1px solid var(--color-border)', height: '100%', overflow: 'hidden' }}>
            {SidebarContent}
          </div>
        </div>
      )}

      {/* ── Main chat area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Top bar ────────────────────────────────────────────── */}
        <header style={{
          height: 64, flexShrink: 0,
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
        }}>
          {/* Mobile menu */}
          <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--color-bg-deep)',
            border: '1px solid var(--color-border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', flexShrink: 0,
          }}>
            <ChevronLeft style={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
          </button>

          {inDm ? (
            <>
              <Link to={activeConvo ? `/profile/${activeConvo.otherUserId}` : '#'} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, textDecoration: 'none' }}>
                <img
                  src={activeConvo?.otherAvatar || `https://i.pravatar.cc/100?u=${activeConvo?.otherUserId ?? ''}`}
                  alt="" style={{ width: 38, height: 38, borderRadius: 11, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border)' }}
                />
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{chatTitle}</h2>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeConvo?.jobTitle ? <><Briefcase style={{ width: 11, height: 11, flexShrink: 0 }} /> {activeConvo.jobTitle}</> : (ROLE_LABEL[activeConvo?.otherRole ?? ''] ?? 'Direct message')}
                  </p>
                </div>
              </Link>
            </>
          ) : activeRoom ? (
            <>
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: `linear-gradient(135deg, ${activeRoom.iconColor}cc, ${activeRoom.iconColor}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 16,
                boxShadow: `0 0 16px ${activeRoom.iconColor}30`,
              }}>{activeRoom.name[0].toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{activeRoom.name}</h2>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                  {activeRoom.description || 'Chat room'}
                </p>
              </div>

              {/* Pinned toggle */}
              {pinned.length > 0 && (
                <button onClick={() => setShowPinned(v => !v)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                  borderRadius: 9, background: showPinned ? 'rgba(99,102,241,0.1)' : 'var(--color-bg-deep)',
                  border: `1px solid ${showPinned ? 'rgba(99,102,241,0.25)' : 'var(--color-border)'}`,
                  color: showPinned ? '#818cf8' : 'var(--color-text-muted)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Pin style={{ width: 11, height: 11 }} /> {pinned.length}
                </button>
              )}

              {/* Join / Leave */}
              {currentUser && (
                isMember ? (
                  <button onClick={() => leaveRoom(activeRoom)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                    borderRadius: 10, background: 'transparent',
                    border: '1px solid var(--color-border)', cursor: 'pointer',
                    color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#f87171'; el.style.color = '#f87171'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--color-border)'; el.style.color = 'var(--color-text-muted)'; }}
                  >
                    <LeaveIcon style={{ width: 13, height: 13 }} /> Leave
                  </button>
                ) : (
                  <button onClick={() => joinRoom(activeRoom)} disabled={joiningId === String(activeRoom._id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                    borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                  }}>
                    {joiningId === String(activeRoom._id) ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <LogIn style={{ width: 13, height: 13 }} />}
                    Join
                  </button>
                )
              )}
            </>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Chats</span>
          )}
        </header>

        {/* ── Pinned strip ───────────────────────────────────────── */}
        {showPinned && pinned.length > 0 && (
          <div style={{
            flexShrink: 0, background: 'rgba(99,102,241,0.05)',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Pin style={{ width: 12, height: 12, color: '#818cf8', flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 16 }}>
              {pinned.map(p => (
                <span key={String(p._id)} style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                  {p.content || (p.audioUrl ? '🎤 Voice note' : p.imageUrl ? '🖼 Image' : '…')}
                </span>
              ))}
            </div>
            <button onClick={() => setShowPinned(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, borderRadius: 6 }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────── */}
        {!activeRoom && !inDm ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare style={{ width: 34, height: 34, color: '#818cf8', opacity: 0.7 }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Pick a chat to start messaging</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Open a direct message or a room from the sidebar, or create your own room.</p>
            </div>
            {currentUser && (
              <button onClick={() => setShowCreate(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}>
                <Plus style={{ width: 15, height: 15 }} /> Create a Room
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Messages ─────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scrollbar">
              {messages === undefined ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
                  <Loader2 style={{ width: 24, height: 24, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, opacity: 0.35, color: 'var(--color-text-muted)' }}>
                  <Hash style={{ width: 40, height: 40 }} />
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{inDm ? `Start your conversation with ${chatTitle}` : 'No messages yet — say hello!'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {grouped.map(({ date, msgs }) => (
                    <div key={date}>
                      {/* Date divider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                        <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>
                          {date}
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                      </div>

                      {/* Messages in group */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {msgs.map((msg, idx) => {
                          const own = msg.userId === currentUser?.id;
                          const isStaff = msg.userRole === 'ADMIN' || msg.userRole === 'MOD';
                          const avatar = msg.userAvatar || `https://i.pravatar.cc/100?u=${msg.userId}`;
                          // Cluster: same user as previous message
                          const prev = idx > 0 ? msgs[idx - 1] : null;
                          const clustered = prev && prev.userId === msg.userId && (msg._creationTime - prev._creationTime) < 120000;

                          return (
                            <div key={String(msg._id)}
                              style={{ display: 'flex', gap: 10, flexDirection: own ? 'row-reverse' : 'row', alignItems: 'flex-end' }}
                              className="group"
                            >
                              {/* Avatar (hidden in clusters) */}
                              {!own && (
                                <div style={{ width: 34, flexShrink: 0, alignSelf: 'flex-end' }}>
                                  {!clustered && (
                                    <img src={avatar} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--color-border)', display: 'block' }} />
                                  )}
                                </div>
                              )}

                              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%', alignItems: own ? 'flex-end' : 'flex-start' }}>
                                {/* Name row — only at top of cluster */}
                                {!clustered && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexDirection: own ? 'row-reverse' : 'row', paddingLeft: own ? 0 : 2, paddingRight: own ? 2 : 0 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{own ? 'You' : msg.userName}</span>
                                    {isStaff && (
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', fontSize: 9, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        <ShieldCheck style={{ width: 8, height: 8 }} /> Staff
                                      </span>
                                    )}
                                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{fmt(msg._creationTime)}</span>
                                  </div>
                                )}

                                {/* Bubble */}
                                <div style={{
                                  position: 'relative',
                                  borderRadius: own ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                  background: own
                                    ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                    : 'var(--color-bg-card)',
                                  border: own ? 'none' : '1px solid var(--color-border)',
                                  boxShadow: own ? '0 4px 20px rgba(99,102,241,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
                                  outline: msg.isPinned ? '2px solid rgba(99,102,241,0.4)' : 'none',
                                  outlineOffset: 2, overflow: 'hidden',
                                }}>
                                  {/* Text content */}
                                  {msg.content && (
                                    <p style={{
                                      fontSize: 14, lineHeight: 1.55,
                                      padding: msg.imageUrl || msg.audioUrl ? '12px 14px 8px' : '11px 14px',
                                      color: own ? '#fff' : 'var(--color-text-primary)',
                                      wordBreak: 'break-word',
                                    }}>{msg.content}</p>
                                  )}

                                  {/* Image */}
                                  {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="attachment" style={{
                                      display: 'block', maxWidth: 280, maxHeight: 220, objectFit: 'cover',
                                      borderRadius: msg.content ? '0 0 16px 16px' : 'inherit',
                                    }} />
                                  )}

                                  {/* Audio */}
                                  {msg.audioUrl && (
                                    <AudioMsg url={msg.audioUrl} duration={msg.audioDuration} own={own} />
                                  )}

                                  {/* Time (clustered, no name shown) */}
                                  {clustered && (
                                    <span style={{
                                      position: 'absolute', bottom: 6, [own ? 'left' : 'right']: 10,
                                      fontSize: 9, color: own ? 'rgba(255,255,255,0.45)' : 'var(--color-text-muted)',
                                      opacity: 0, transition: 'opacity 0.15s',
                                    }} className="group-hover:opacity-100">
                                      {fmt(msg._creationTime)}
                                    </span>
                                  )}

                                  {/* Admin actions */}
                                  {isAdmin && !inDm && (
                                    <div className="opacity-0 group-hover:opacity-100" style={{
                                      position: 'absolute', top: 6, [own ? 'right' : 'left']: 'calc(100% + 6px)',
                                      display: 'flex', gap: 3, padding: '4px',
                                      background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)',
                                      borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 10,
                                      transition: 'opacity 0.15s',
                                    }}>
                                      <button onClick={() => convex.mutation(api.community.pinMessage, { messageId: msg._id as Id<'communityMessages'>, isPinned: !msg.isPinned })} style={{
                                        padding: '5px', borderRadius: 7,
                                        background: msg.isPinned ? 'rgba(99,102,241,0.15)' : 'none',
                                        border: 'none', cursor: 'pointer',
                                        color: msg.isPinned ? '#818cf8' : 'var(--color-text-muted)',
                                      }}>
                                        <Pin style={{ width: 12, height: 12 }} />
                                      </button>
                                      <button onClick={() => convex.mutation(api.community.deleteMessage, { messageId: msg._id as Id<'communityMessages'> })} style={{
                                        padding: '5px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
                                      }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                                      >
                                        <Trash2 style={{ width: 12, height: 12 }} />
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
                  <div ref={chatEnd} />
                </div>
              )}
            </div>

            {/* ── Input area ─────────────────────────────────────── */}
            <div style={{ flexShrink: 0, background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)', padding: '12px 16px' }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />

              {/* Image preview */}
              {imgPrev && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imgPrev} style={{ height: 72, width: 'auto', borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(99,102,241,0.35)', display: 'block' }} alt="preview" />
                    <button onClick={clearImg} style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', background: '#dc2626', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X style={{ width: 11, height: 11 }} />
                    </button>
                    {upImg && <div style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Loader2 style={{ width: 18, height: 18, color: '#fff', animation: 'spin 1s linear infinite' }} />
                    </div>}
                  </div>
                </div>
              )}

              {/* Audio preview */}
              {audioPrev && !recording && (
                <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                    <AudioMsg url={audioPrev} duration={recSecs} own={false} />
                  </div>
                  <button onClick={cancelRec} style={{ width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              )}

              {/* Not a member */}
              {!currentUser ? (
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', padding: '8px 0' }}>Sign in to participate</p>
              ) : !isMember ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock style={{ width: 14, height: 14, color: '#818cf8' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Join <strong>{activeRoom.name}</strong> to chat</span>
                  </div>
                  <button onClick={() => joinRoom(activeRoom)} disabled={joiningId === String(activeRoom._id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                    fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  }}>
                    {joiningId === String(activeRoom._id) ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <LogIn style={{ width: 13, height: 13 }} />}
                    Join Room
                  </button>
                </div>
              ) : recording ? (
                /* Recording UI */
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Recording</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{fmtDur(recSecs)}</span>
                  <div style={{ flex: 1 }} />
                  <button onClick={cancelRec} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Cancel</button>
                  <button onClick={stopRec} style={{ padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Square style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ) : (
                /* Normal input */
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--color-bg-deep)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 16, padding: '5px 6px 5px 12px',
                  transition: 'border-color 0.15s',
                }}
                  onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  {/* Image */}
                  <button onClick={() => fileRef.current?.click()} disabled={!!audioBlob} title="Attach image" style={{
                    padding: '7px', borderRadius: 9, background: imgFile ? 'rgba(99,102,241,0.12)' : 'none',
                    border: 'none', cursor: 'pointer', color: imgFile ? '#818cf8' : 'var(--color-text-muted)', flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!imgFile) (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
                    onMouseLeave={e => { if (!imgFile) (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
                  >
                    <ImagePlus style={{ width: 16, height: 16 }} />
                  </button>

                  {/* Text */}
                  <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={audioBlob ? 'Add a caption… (optional)' : inDm ? `Message ${chatTitle}…` : `Message #${chatTitle}…`}
                    disabled={sending}
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      color: 'var(--color-text-primary)', fontSize: 14, padding: '7px 4px',
                      fontFamily: 'inherit', opacity: sending ? 0.5 : 1,
                    }}
                  />

                  {/* Mic */}
                  {!audioBlob && (
                    <button onClick={startRec} disabled={!!imgFile || sending} title="Record voice note" style={{
                      padding: '7px', borderRadius: 9, border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: 'none', color: 'var(--color-text-muted)', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <Mic style={{ width: 16, height: 16 }} />
                    </button>
                  )}

                  {/* Send */}
                  <button onClick={handleSend} disabled={!canSend} style={{
                    width: 36, height: 36, borderRadius: 11, border: 'none', cursor: canSend ? 'pointer' : 'default', flexShrink: 0,
                    background: canSend ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'var(--color-bg-card)',
                    color: canSend ? '#fff' : 'var(--color-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: canSend ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                    {upImg || upAudio
                      ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                      : <Send style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Create Room Modal ──────────────────────────────────────── */}
      {showCreate && currentUser && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div style={{
            width: '100%', maxWidth: 440,
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            borderRadius: 22, padding: 28, boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${newColor}cc, ${newColor}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
                  {newName ? newName[0].toUpperCase() : '#'}
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>Create Room</h2>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 7 }}>Room Name *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. DeFi Signals"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 11, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 7 }}>Description</label>
                <textarea rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What's this room about?"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 11, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 10 }}>Room Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)} style={{
                      width: 30, height: 30, borderRadius: 9, background: c, cursor: 'pointer',
                      border: newColor === c ? '3px solid var(--color-text-primary)' : '3px solid transparent',
                      transform: newColor === c ? 'scale(1.2)' : 'none',
                      transition: 'all 0.15s', boxShadow: newColor === c ? `0 0 10px ${c}60` : 'none',
                    }} />
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleCreate} disabled={!newName.trim() || creating} style={{
              width: '100%', marginTop: 22, padding: '13px', borderRadius: 12,
              background: newName.trim() ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'var(--color-bg-deep)',
              color: newName.trim() ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 800, fontSize: 14, border: 'none', cursor: newName.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: newName.trim() ? '0 4px 20px rgba(99,102,241,0.35)' : 'none',
              transition: 'all 0.15s',
            }}>
              {creating ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Creating…</> : <><Plus style={{ width: 15, height: 15 }} /> Create Room</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
