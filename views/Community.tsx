import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { UserRole } from '../types';
import { getSession } from '../services/session';
import { convex } from '../services/convex';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import {
  Send, Pin, ShieldCheck, Trash2, X, XCircle, Loader2,
  Plus, Hash, Users, LogIn, LogOut as LeaveIcon, Check,
  MessageSquare, DollarSign, Globe, AlertCircle, ImagePlus,
  ChevronDown, Mic, MicOff, Play, Square, Volume2,
} from 'lucide-react';

interface CommunityProps { role: UserRole; }

interface ChatRoom {
  _id: Id<'chatRooms'>;
  name: string; slug: string; description: string;
  iconColor: string; isActive: boolean;
}

interface Message {
  _id: Id<'communityMessages'>;
  _creationTime: number;
  roomId: Id<'chatRooms'>;
  userId: string;
  content: string;
  imageStorageId?: Id<'_storage'>;
  audioStorageId?: Id<'_storage'>;
  audioDuration?: number;
  imageUrl?: string;
  audioUrl?: string;
  isPinned: boolean;
  userName: string;
  userRole: string;
  userAvatar?: string;
}

interface CurrentUser { id: string; name: string; avatarUrl: string; }

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PRESET_COLORS = ['#2F6DF2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const Toast: React.FC<{ msg: string; onDismiss: () => void }> = ({ msg, onDismiss }) => (
  <div style={{
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    zIndex: 100, display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 18px', background: '#dc2626', color: '#fff',
    borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  }}>
    <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
    <span style={{ fontSize: 13, fontWeight: 600 }}>{msg}</span>
    <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>
      <X style={{ width: 14, height: 14 }} />
    </button>
  </div>
);

/* ── Audio player bubble ─────────────────────────────────────────── */
const AudioBubble: React.FC<{ url: string; duration?: number; own: boolean }> = ({ url, duration, own }) => {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(duration ?? 0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play(); setPlaying(true); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', minWidth: 180, maxWidth: 260 }}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={e => setCurrent(Math.floor((e.target as HTMLAudioElement).currentTime))}
        onLoadedMetadata={e => { const d = (e.target as HTMLAudioElement).duration; if (isFinite(d)) setTotal(Math.floor(d)); }}
        onEnded={() => { setPlaying(false); setCurrent(0); if (audioRef.current) audioRef.current.currentTime = 0; }}
      />
      <button
        onClick={toggle}
        style={{
          width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
          background: own ? 'rgba(255,255,255,0.25)' : 'rgba(47,109,242,0.15)',
          color: own ? '#fff' : 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
      >
        {playing
          ? <Square style={{ width: 12, height: 12 }} />
          : <Play style={{ width: 12, height: 12, marginLeft: 1 }} />}
      </button>

      {/* Waveform bars */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const h = 4 + Math.sin(i * 1.3) * 4 + Math.cos(i * 0.8) * 3;
          const pct = total > 0 ? current / total : 0;
          const filled = i / 20 < pct;
          return (
            <div key={i} style={{
              width: 3, height: Math.max(4, h),
              borderRadius: 999,
              background: own
                ? (filled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)')
                : (filled ? 'var(--color-accent)' : 'rgba(47,109,242,0.25)'),
              transition: 'background 0.1s',
            }} />
          );
        })}
      </div>

      <span style={{ fontSize: 10, fontWeight: 700, color: own ? 'rgba(255,255,255,0.75)' : 'var(--color-text-muted)', flexShrink: 0, minWidth: 28 }}>
        {formatDuration(playing ? current : total)}
      </span>
      <Volume2 style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.5, color: own ? '#fff' : 'var(--color-text-muted)' }} />
    </div>
  );
};

const Community: React.FC<CommunityProps> = ({ role }) => {
  const isAdmin = role === UserRole.ADMIN || role === UserRole.MOD;
  const session = getSession();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeRoom, setActiveRoom]   = useState<ChatRoom | null>(null);
  const [inputValue, setInputValue]   = useState('');
  const [sending, setSending]         = useState(false);
  const [showPinned, setShowPinned]   = useState(true);
  const [joiningId, setJoiningId]     = useState<string | null>(null);
  const [toastMsg, setToastMsg]       = useState<string | null>(null);
  const [showMobileRooms, setShowMobileRooms] = useState(false);

  // Image state
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [recording,         setRecording]         = useState(false);
  const [recordingSecs,     setRecordingSecs]      = useState(0);
  const [audioBlob,         setAudioBlob]          = useState<Blob | null>(null);
  const [audioPreviewUrl,   setAudioPreviewUrl]    = useState<string | null>(null);
  const [uploadingAudio,    setUploadingAudio]     = useState(false);
  const mediaRecorderRef   = useRef<MediaRecorder | null>(null);
  const recordingTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef     = useRef<Blob[]>([]);

  // Create room modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newDesc, setNewDesc]       = useState('');
  const [newColor, setNewColor]     = useState('#2F6DF2');
  const [creating, setCreating]     = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const rooms = useQuery(api.community.listRooms) ?? [];
  const messages = useQuery(
    api.community.listMessagesWithProfiles,
    activeRoom ? { roomId: activeRoom._id } : 'skip',
  ) as Message[] | undefined;
  const membershipIds = useQuery(
    api.community.getUserMemberships,
    session ? { userId: session.userId } : 'skip',
  );

  const joinedRoomIds = new Set<string>((membershipIds ?? []).map(String));
  const loadingRooms  = rooms === undefined;
  const loadingMsgs   = activeRoom !== null && messages === undefined;

  useEffect(() => {
    if (!session) return;
    convex.query(api.profiles.getByUserId, { userId: session.userId }).then((p: any) => {
      setCurrentUser({
        id: session.userId,
        name: p?.name || session.email?.split('@')[0] || 'User',
        avatarUrl: p?.avatarUrl || `https://i.pravatar.cc/100?u=${session.userId}`,
      });
    });
  }, []);

  useEffect(() => {
    if (!activeRoom && rooms && rooms.length > 0) {
      const first = (membershipIds && membershipIds.length > 0)
        ? rooms.find(r => membershipIds.map(String).includes(String(r._id))) ?? rooms[0]
        : rooms[0];
      setActiveRoom(first ?? null);
    }
  }, [rooms, membershipIds]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages?.length]);

  // Cleanup recording timer on unmount
  useEffect(() => () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); }, []);

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 4000); };

  const joinRoom = async (room: ChatRoom) => {
    if (!currentUser) { toast('You must be signed in to join a room.'); return; }
    setJoiningId(String(room._id));
    try {
      await convex.mutation(api.community.joinRoom, { roomId: room._id, userId: currentUser.id });
      setActiveRoom(room);
    } catch (e: any) { toast(`Could not join room: ${e.message ?? 'Unknown error'}`); }
    setJoiningId(null);
  };

  const leaveRoom = async (room: ChatRoom) => {
    if (!currentUser) return;
    try { await convex.mutation(api.community.leaveRoom, { roomId: room._id, userId: currentUser.id }); }
    catch (e: any) { toast(`Could not leave room: ${e.message ?? 'Unknown error'}`); }
  };

  // ── Image handling ────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5 MB.'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const clearImage = () => { setImageFile(null); setImagePreview(null); };

  // ── Voice recording ───────────────────────────────────────────────
  const startRecording = async () => {
    if (imageFile) { toast('Clear the image before recording a voice note.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
      };
      mr.start(200);
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSecs(0);
      recordingTimerRef.current = setInterval(() => setRecordingSecs(s => s + 1), 1000);
    } catch {
      toast('Microphone access denied. Please allow microphone in your browser.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  };

  const cancelRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setRecordingSecs(0);
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  };

  // ── Send message ──────────────────────────────────────────────────
  const handleSend = async () => {
    const hasText  = inputValue.trim().length > 0;
    const hasImage = imageFile !== null;
    const hasAudio = audioBlob !== null;
    if ((!hasText && !hasImage && !hasAudio) || !currentUser || !activeRoom || sending) return;

    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    let imageStorageId: Id<'_storage'> | undefined;
    let audioStorageId: Id<'_storage'> | undefined;
    const audioDuration = hasAudio ? recordingSecs : undefined;

    // Upload image if present
    if (imageFile) {
      setUploadingImg(true);
      try {
        const uploadUrl = await convex.mutation(api.community.generateUploadUrl, {});
        const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': imageFile.type }, body: imageFile });
        const { storageId } = await res.json();
        imageStorageId = storageId as Id<'_storage'>;
      } catch (e: any) {
        toast(`Image upload failed: ${e.message ?? 'Unknown error'}`);
        setSending(false); setUploadingImg(false);
        if (content) setInputValue(content);
        return;
      }
      setUploadingImg(false);
      clearImage();
    }

    // Upload audio if present
    if (audioBlob) {
      setUploadingAudio(true);
      try {
        const uploadUrl = await convex.mutation(api.community.generateUploadUrl, {});
        const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': audioBlob.type }, body: audioBlob });
        const { storageId } = await res.json();
        audioStorageId = storageId as Id<'_storage'>;
      } catch (e: any) {
        toast(`Audio upload failed: ${e.message ?? 'Unknown error'}`);
        setSending(false); setUploadingAudio(false);
        return;
      }
      setUploadingAudio(false);
      setAudioBlob(null);
      if (audioPreviewUrl) { URL.revokeObjectURL(audioPreviewUrl); setAudioPreviewUrl(null); }
      setRecordingSecs(0);
    }

    try {
      await convex.mutation(api.community.sendMessage, {
        roomId: activeRoom._id,
        userId: currentUser.id,
        content: content || '',
        imageStorageId,
        audioStorageId,
        audioDuration,
      });
    } catch (e: any) {
      if (content) setInputValue(content);
      toast(`Message not sent: ${e.message ?? 'Unknown error'}`);
    }
    setSending(false);
  };

  const togglePin = async (msgId: Id<'communityMessages'>, current: boolean) => {
    try { await convex.mutation(api.community.pinMessage, { messageId: msgId, isPinned: !current }); }
    catch (e: any) { toast(`Pin failed: ${e.message ?? 'Unknown error'}`); }
  };

  const deleteMessage = async (msgId: Id<'communityMessages'>) => {
    try { await convex.mutation(api.community.deleteMessage, { messageId: msgId }); }
    catch (e: any) { toast(`Delete failed: ${e.message ?? 'Unknown error'}`); }
  };

  const handleCreateRoom = async () => {
    if (!newName.trim() || !currentUser) return;
    setCreating(true);
    const slug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    try {
      const roomId = await convex.mutation(api.community.createRoom, {
        name: newName.trim(), slug, description: newDesc.trim(), iconColor: newColor, createdBy: currentUser.id,
      });
      // Auto-join the room the user just created
      await convex.mutation(api.community.joinRoom, { roomId, userId: currentUser.id });
      // Navigate to the new room (it'll appear after the query refreshes)
      setTimeout(() => {
        const newRoom = rooms.find(r => String(r._id) === String(roomId));
        if (newRoom) setActiveRoom(newRoom);
      }, 600);
    } catch (e: any) { toast(`Could not create room: ${e.message ?? 'Unknown error'}`); }
    setCreating(false); setNewName(''); setNewDesc(''); setNewColor('#2F6DF2'); setShowCreate(false);
  };

  const isMember = activeRoom ? joinedRoomIds.has(String(activeRoom._id)) : false;
  const pinned   = (messages ?? []).filter(m => m.isPinned);
  const grouped  = (messages ?? []).reduce<Array<{ date: string; msgs: Message[] }>>((acc, msg) => {
    const d = formatDate(msg._creationTime);
    const last = acc[acc.length - 1];
    if (last?.date === d) last.msgs.push(msg); else acc.push({ date: d, msgs: [msg] });
    return acc;
  }, []);

  const canSend = (inputValue.trim().length > 0 || imageFile !== null || audioBlob !== null) && !sending;
  const isUploading = uploadingImg || uploadingAudio;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--color-bg-primary)' }}
      className="md:flex-row"
    >
      {toastMsg && <Toast msg={toastMsg} onDismiss={() => setToastMsg(null)} />}

      {/* ── Mobile room picker ─────────────────────────────────────── */}
      <div className="md:hidden" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-card)', flexShrink: 0 }}>
        <button onClick={() => setShowMobileRooms(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          {activeRoom && (
            <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeRoom.iconColor, color: '#fff', flexShrink: 0 }}>
              <Hash style={{ width: 14, height: 14 }} />
            </div>
          )}
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {activeRoom?.name ?? 'Select a room'}
          </span>
          <ChevronDown style={{ width: 14, height: 14, color: 'var(--color-text-muted)', transform: showMobileRooms ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {showMobileRooms && (
          <div style={{ borderTop: '1px solid var(--color-border)', maxHeight: 240, overflowY: 'auto' }}>
            {rooms.map(room => (
              <button key={String(room._id)} onClick={() => { setActiveRoom(room); setShowMobileRooms(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  background: activeRoom?._id === room._id ? 'rgba(47,109,242,0.08)' : 'none',
                  border: 'none', cursor: 'pointer',
                }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: room.iconColor, color: '#fff', flexShrink: 0 }}>
                  <Hash style={{ width: 13, height: 13 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'left', color: activeRoom?._id === room._id ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                  {room.name}
                </span>
                {joinedRoomIds.has(String(room._id)) && <Check style={{ width: 12, height: 12, color: '#34d399', flexShrink: 0 }} />}
              </button>
            ))}
            <button onClick={() => { setShowMobileRooms(false); setShowCreate(true); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', borderTop: '1px solid var(--color-border)' }}>
              <Plus style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Create a room</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside className="hidden md:flex" style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--color-border)', flexDirection: 'column', background: 'var(--color-bg-card)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare style={{ width: 14, height: 14, color: 'var(--color-accent)' }} />
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Chat Rooms</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }} className="custom-scrollbar">
          {loadingRooms ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <Loader2 style={{ width: 18, height: 18, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : rooms.map(room => {
            const joined = joinedRoomIds.has(String(room._id));
            const active = activeRoom?._id === room._id;
            return (
              <div
                key={String(room._id)}
                onClick={() => setActiveRoom(room)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 10,
                  cursor: 'pointer',
                  background: active ? 'rgba(47,109,242,0.08)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(47,109,242,0.2)' : 'transparent'}`,
                  marginBottom: 3, transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-deep)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                className="group"
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: room.iconColor, color: '#fff', flexShrink: 0, fontSize: 14, fontWeight: 700 }}>
                  {room.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: active ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                      {room.name}
                    </span>
                    {joined && <Check style={{ width: 10, height: 10, color: '#34d399', flexShrink: 0 }} />}
                  </div>
                  {room.description && (
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {room.description}
                    </div>
                  )}
                </div>
                <div style={{ opacity: 0, position: 'absolute', right: 8, transition: 'opacity 0.15s' }} className="group-hover:opacity-100">
                  {currentUser && (joined ? (
                    <button onClick={e => { e.stopPropagation(); leaveRoom(room); }}
                      style={{ padding: '4px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                    >
                      <LeaveIcon style={{ width: 12, height: 12 }} />
                    </button>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); joinRoom(room); }}
                      disabled={joiningId === String(room._id)}
                      style={{ padding: '4px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                    >
                      {joiningId === String(room._id)
                        ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
                        : <LogIn style={{ width: 12, height: 12 }} />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Any user can create a room */}
        {currentUser && (
          <div style={{ padding: '10px', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={() => setShowCreate(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              <Plus style={{ width: 14, height: 14 }} /> Create Room
            </button>
          </div>
        )}
      </aside>

      {/* ── Chat area ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeRoom ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(47,109,242,0.08)', border: '1px solid rgba(47,109,242,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare style={{ width: 28, height: 28, color: 'var(--color-accent)', opacity: 0.6 }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>No room selected</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Pick a chat room or create your own</p>
            </div>
            {currentUser && (
              <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                <Plus style={{ width: 15, height: 15 }} /> Create a Room
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ height: 60, background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)', padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeRoom.iconColor, color: '#fff', fontWeight: 700, fontSize: 15 }}>
                  {activeRoom.name[0].toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>{activeRoom.name}</h1>
                  <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Live · {activeRoom.description || 'Chat room'}
                  </p>
                </div>
              </div>
              {currentUser && (
                isMember ? (
                  <button onClick={() => leaveRoom(activeRoom)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'none', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f87171'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
                  >
                    <LeaveIcon style={{ width: 12, height: 12 }} /> Leave
                  </button>
                ) : (
                  <button onClick={() => joinRoom(activeRoom)} disabled={joiningId === String(activeRoom._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, background: 'var(--color-accent)', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    {joiningId === String(activeRoom._id)
                      ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
                      : <LogIn style={{ width: 12, height: 12 }} />}
                    Join Room
                  </button>
                )
              )}
            </div>

            {/* Pinned strip */}
            {pinned.length > 0 && showPinned && (
              <div style={{ background: 'rgba(47,109,242,0.06)', borderBottom: '1px solid rgba(47,109,242,0.15)', padding: '8px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                  <Pin style={{ width: 12, height: 12, color: 'var(--color-accent)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', gap: 16, overflow: 'hidden' }}>
                    {pinned.map(pm => (
                      <span key={String(pm._id)} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        {pm.content || (pm.audioUrl ? '🎤 Voice note' : pm.imageUrl ? '🖼️ Image' : '...')}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowPinned(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', borderRadius: 6 }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }} className="custom-scrollbar">
              {loadingMsgs ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Loader2 style={{ width: 22, height: 22, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (messages ?? []).length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, color: 'var(--color-text-muted)', textAlign: 'center', userSelect: 'none' }}>
                  <Hash style={{ width: 36, height: 36, marginBottom: 10 }} />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>No messages yet — say hello!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {grouped.map(({ date, msgs }) => (
                    <div key={date}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', userSelect: 'none' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', padding: '0 8px' }}>{date}</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {msgs.map(msg => {
                          const own    = msg.userId === currentUser?.id;
                          const isStaff = msg.userRole === 'ADMIN' || msg.userRole === 'MOD';
                          const avatar = msg.userAvatar || `https://i.pravatar.cc/100?u=${msg.userId}`;
                          return (
                            <div key={String(msg._id)} style={{ display: 'flex', gap: 10, flexDirection: own ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
                              className="group"
                            >
                              <img src={avatar} alt={msg.userName}
                                style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0, marginTop: 2 }} />
                              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '72%', alignItems: own ? 'flex-end' : 'flex-start' }}>
                                {/* Name + badge row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexDirection: own ? 'row-reverse' : 'row' }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)' }}>{own ? 'You' : msg.userName}</span>
                                  {isStaff && (
                                    <span style={{ padding: '2px 6px', borderRadius: 5, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 8, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 3 }}>
                                      <ShieldCheck style={{ width: 9, height: 9 }} /> Staff
                                    </span>
                                  )}
                                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{formatTime(msg._creationTime)}</span>
                                </div>

                                {/* Bubble */}
                                <div style={{
                                  position: 'relative',
                                  borderRadius: 16,
                                  borderTopRightRadius: own ? 4 : 16,
                                  borderTopLeftRadius: own ? 16 : 4,
                                  background: own ? 'var(--color-accent)' : 'var(--color-bg-card)',
                                  border: own ? 'none' : '1px solid var(--color-border)',
                                  boxShadow: own ? '0 4px 16px rgba(47,109,242,0.2)' : 'none',
                                  outline: msg.isPinned ? '2px solid rgba(47,109,242,0.3)' : 'none',
                                  outlineOffset: 2,
                                  overflow: 'hidden',
                                }}>
                                  {/* Text */}
                                  {msg.content && (
                                    <p style={{ fontSize: 13, lineHeight: 1.6, padding: '10px 14px', color: own ? '#fff' : 'var(--color-text-primary)', wordBreak: 'break-word', paddingBottom: msg.imageUrl || msg.audioUrl ? 4 : 10 }}>
                                      {msg.content}
                                    </p>
                                  )}
                                  {/* Image */}
                                  {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="attachment"
                                      style={{ display: 'block', maxWidth: 260, maxHeight: 200, objectFit: 'cover', borderRadius: msg.content ? '0 0 14px 14px' : 'inherit' }} />
                                  )}
                                  {/* Audio */}
                                  {msg.audioUrl && (
                                    <AudioBubble url={msg.audioUrl} duration={msg.audioDuration} own={own} />
                                  )}

                                  {/* Admin actions */}
                                  {isAdmin && (
                                    <div className="opacity-0 group-hover:opacity-100" style={{
                                      position: 'absolute', top: 4, [own ? 'right' : 'left']: 'calc(100% + 6px)',
                                      display: 'flex', alignItems: 'center', gap: 2, padding: '4px',
                                      background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)',
                                      borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 10,
                                      transition: 'opacity 0.15s',
                                    }}>
                                      <button onClick={() => togglePin(msg._id, msg.isPinned)}
                                        style={{ padding: '5px', borderRadius: 6, background: msg.isPinned ? 'rgba(47,109,242,0.12)' : 'none', border: 'none', cursor: 'pointer', color: msg.isPinned ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                                        <Pin style={{ width: 12, height: 12 }} />
                                      </button>
                                      <button onClick={() => deleteMessage(msg._id)}
                                        style={{ padding: '5px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
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
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ── Input area ───────────────────────────────────────── */}
            <div style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-card)', flexShrink: 0 }}>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleImageSelect} />

              {/* Image preview */}
              {imagePreview && (
                <div style={{ padding: '12px 16px 0' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imagePreview} alt="preview" style={{ height: 80, width: 'auto', borderRadius: 10, objectFit: 'cover', border: '1.5px solid rgba(47,109,242,0.4)' }} />
                    <button onClick={clearImage} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <XCircle style={{ width: 14, height: 14 }} />
                    </button>
                    {uploadingImg && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 style={{ width: 18, height: 18, color: '#fff', animation: 'spin 1s linear infinite' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audio preview (recorded, not yet sent) */}
              {audioPreviewUrl && !recording && (
                <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, background: 'rgba(47,109,242,0.06)', border: '1px solid rgba(47,109,242,0.2)', borderRadius: 12, overflow: 'hidden' }}>
                    <AudioBubble url={audioPreviewUrl} duration={recordingSecs} own={false} />
                  </div>
                  <button onClick={cancelRecording}
                    style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              )}

              <div style={{ padding: '10px 14px' }}>
                {!currentUser ? (
                  <p style={{ textAlign: 'center', padding: '10px', fontSize: 12, color: 'var(--color-text-muted)' }}>Sign in to participate</p>
                ) : !isMember ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(47,109,242,0.06)', border: '1px solid rgba(47,109,242,0.2)' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Join <strong>{activeRoom.name}</strong> to send messages
                    </p>
                    <button onClick={() => joinRoom(activeRoom)} disabled={joiningId === String(activeRoom._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--color-accent)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      {joiningId === String(activeRoom._id)
                        ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                        : <LogIn style={{ width: 13, height: 13 }} />}
                      Join Room
                    </button>
                  </div>
                ) : recording ? (
                  /* ── Active recording UI ────────── */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 14px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Recording…</span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 4 }}>{formatDuration(recordingSecs)}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={cancelRecording}
                      style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button onClick={stopRecording}
                      style={{ padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Square style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ) : (
                  /* ── Normal input bar ─────────────── */
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--color-bg-deep)',
                    border: `1px solid ${sending ? 'rgba(47,109,242,0.4)' : 'var(--color-border)'}`,
                    borderRadius: 14, padding: '4px 8px',
                    transition: 'border-color 0.15s',
                  }}>
                    {/* Image button */}
                    <button onClick={() => fileInputRef.current?.click()} disabled={sending || !!audioBlob} title="Attach image"
                      style={{ padding: '7px', borderRadius: 8, background: imageFile ? 'rgba(47,109,242,0.12)' : 'none', border: 'none', cursor: 'pointer', color: imageFile ? 'var(--color-accent)' : 'var(--color-text-muted)', flexShrink: 0 }}>
                      <ImagePlus style={{ width: 16, height: 16 }} />
                    </button>

                    {/* Text input */}
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder={audioBlob ? 'Add a caption… (optional)' : `Message #${activeRoom.name}…`}
                      disabled={sending}
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: 13, flex: 1, padding: '8px 4px', fontFamily: 'inherit', opacity: sending ? 0.5 : 1 }}
                    />

                    {/* Mic button (only when no audio blob staged) */}
                    {!audioBlob && (
                      <button
                        onClick={startRecording}
                        disabled={sending || !!imageFile}
                        title="Record voice note"
                        style={{
                          padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0,
                          background: 'none', color: 'var(--color-text-muted)',
                          transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        <Mic style={{ width: 16, height: 16 }} />
                      </button>
                    )}

                    {/* Send button */}
                    <button onClick={handleSend} disabled={!canSend}
                      style={{
                        padding: '8px', borderRadius: 10, border: 'none', cursor: canSend ? 'pointer' : 'default', flexShrink: 0,
                        background: canSend ? 'var(--color-accent)' : 'transparent',
                        color: canSend ? '#fff' : 'var(--color-text-muted)',
                        transition: 'background 0.15s',
                      }}>
                      {isUploading
                        ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
                        : <Send style={{ width: 15, height: 15 }} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Create Room Modal ─────────────────────────────────────── */}
      {showCreate && currentUser && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'var(--color-overlay)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div style={{ width: '100%', maxWidth: 460, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: newColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                  {newName ? newName[0].toUpperCase() : '#'}
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>Create a Chat Room</h2>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ padding: '6px', borderRadius: 8, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 7 }}>Room Name *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Web3 Signals"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(47,109,242,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 7 }}>Description</label>
                <textarea rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What's this room about?"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(47,109,242,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 10 }}>Room Color</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      style={{ width: 32, height: 32, borderRadius: 8, background: c, border: newColor === c ? '3px solid var(--color-text-primary)' : '3px solid transparent', cursor: 'pointer', transform: newColor === c ? 'scale(1.15)' : 'none', transition: 'all 0.15s' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleCreateRoom} disabled={!newName.trim() || creating}
              style={{ width: '100%', marginTop: 22, padding: '13px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !newName.trim() || creating ? 0.5 : 1 }}>
              {creating
                ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Creating…</>
                : <><Plus style={{ width: 15, height: 15 }} /> Create Room</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
