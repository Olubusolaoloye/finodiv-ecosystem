
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';
import {
  Send, Image as ImageIcon, Pin, Info, MoreHorizontal,
  ShieldCheck, Trash2, Bell, X, Loader2
} from 'lucide-react';

interface CommunityProps {
  role: UserRole;
}

interface Message {
  id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
  profiles: { name: string; role: string; avatar_url: string | null } | null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const Community: React.FC<CommunityProps> = ({ role }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showPinned, setShowPinned] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatarUrl: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === UserRole.ADMIN || role === UserRole.MOD;
  const pinnedMessages = messages.filter(m => m.is_pinned);

  // Load current user profile
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      setCurrentUser({
        id: user.id,
        name: profile?.name || user.email?.split('@')[0] || 'User',
        avatarUrl: profile?.avatar_url || `https://i.pravatar.cc/100?u=${user.id}`,
      });
    });
  }, []);

  // Load messages and subscribe to Realtime
  useEffect(() => {
    const channel = 'general';

    const loadMessages = async () => {
      const { data } = await supabase
        .from('community_messages')
        .select('*, profiles(name, role, avatar_url)')
        .eq('channel', channel)
        .order('created_at', { ascending: true })
        .limit(100);
      setMessages((data as Message[]) || []);
      setLoading(false);
    };

    loadMessages();

    // Realtime subscription
    const sub = supabase
      .channel('community_general')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `channel=eq.${channel}` },
        async (payload) => {
          // Fetch the full row with profile join
          const { data } = await supabase
            .from('community_messages')
            .select('*, profiles(name, role, avatar_url)')
            .eq('id', payload.new.id)
            .single();
          if (data) setMessages(prev => [...prev, data as Message]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_messages' },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_messages' },
        (payload) => {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, is_pinned: payload.new.is_pinned } : m));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentUser) return;
    const content = inputValue.trim();
    setInputValue('');
    await supabase.from('community_messages').insert({
      user_id: currentUser.id,
      channel: 'general',
      content,
    });
  };

  const togglePin = async (messageId: string, current: boolean) => {
    if (!isAdmin) return;
    await supabase.from('community_messages').update({ is_pinned: !current }).eq('id', messageId);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isAdmin) return;
    await supabase.from('community_messages').delete().eq('id', messageId);
  };

  const getAvatar = (msg: Message) =>
    msg.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${msg.user_id}`;
  const getSenderName = (msg: Message) =>
    msg.profiles?.name || 'User';
  const getSenderRole = (msg: Message): UserRole =>
    (msg.profiles?.role as UserRole) || UserRole.LEARNER;
  const isOwnMessage = (msg: Message) => msg.user_id === currentUser?.id;

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] relative overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Ecosystem General</h1>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Info className="w-4 h-4 text-blue-400" /> Powered by Supabase Realtime
          </div>
          <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pinned Announcements */}
      {pinnedMessages.length > 0 && showPinned && (
        <div className="bg-blue-600/10 border-b border-blue-500/20 px-8 py-3 flex items-center justify-between group">
          <div className="flex items-center gap-4 overflow-hidden">
            <Pin className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex gap-4 overflow-x-auto whitespace-nowrap py-1">
              {pinnedMessages.map(pm => (
                <div key={pm.id} className="text-xs font-bold text-blue-200/80 hover:text-blue-100 cursor-pointer flex items-center gap-2 pr-6 border-r border-blue-500/10 last:border-none">
                  <span className="truncate max-w-[300px]">{pm.content}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setShowPinned(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 group-hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 opacity-40 select-none">
            <p className="text-white font-bold">No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center py-6 opacity-30 select-none">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live Community Chat</span>
            </div>

            {messages.map((msg) => {
              const own = isOwnMessage(msg);
              const senderRole = getSenderRole(msg);
              return (
                <div key={msg.id} className={`flex gap-4 group ${own ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                    <img src={getAvatar(msg)} alt={getSenderName(msg)} className="w-full h-full object-cover" />
                  </div>
                  <div className={`flex flex-col max-w-[70%] ${own ? 'items-end' : ''}`}>
                    <div className={`flex items-center gap-2 mb-2 ${own ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-black text-gray-300">{own ? 'You' : getSenderName(msg)}</span>
                      {(senderRole === UserRole.ADMIN || senderRole === UserRole.MOD) && (
                        <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[8px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Staff
                        </span>
                      )}
                      <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{formatTime(msg.created_at)}</span>
                    </div>

                    <div className={`
                      p-4 rounded-[24px] relative group/bubble
                      ${own ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-500/10' : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'}
                      ${msg.is_pinned ? 'ring-2 ring-blue-500/50' : ''}
                    `}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>

                      {isAdmin && (
                        <div className={`
                          absolute top-0 opacity-0 group-hover/bubble:opacity-100 transition-all flex items-center gap-1 p-1 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl
                          ${own ? 'right-full mr-2' : 'left-full ml-2'}
                        `}>
                          <button
                            onClick={() => togglePin(msg.id, msg.is_pinned)}
                            className={`p-1.5 rounded-lg transition-all ${msg.is_pinned ? 'text-blue-400 bg-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-8 pt-0">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-2 flex items-center gap-2 group hover:border-blue-500/30 transition-all shadow-2xl">
          {isAdmin && (
            <button className="p-3.5 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-blue-500 transition-all">
              <ImageIcon className="w-5 h-5" />
            </button>
          )}
          <input
            type="text"
            placeholder={currentUser ? (isAdmin ? 'Post an announcement...' : 'Type a message...') : 'Sign in to chat...'}
            className="flex-1 bg-transparent border-none outline-none py-4 px-4 text-sm text-white placeholder-gray-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!currentUser}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !currentUser}
            className={`p-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 ${
              inputValue.trim() && currentUser
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest mt-4">
          Please follow our community guidelines. Offensive content may result in a permanent ban.
        </p>
      </div>
    </div>
  );
};

export default Community;
