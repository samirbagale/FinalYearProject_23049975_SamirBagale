import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessagesSquare, 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  ArrowLeft, 
  Lock, 
  UserCircle2, 
  TrendingUp,
  CheckCircle2,
  Send,
  Trash2,
  Copy
} from 'lucide-react';

const CATEGORIES: any = {
  anxiety: { color: "text-violet-600", bg: "bg-violet-50", label: "Anxiety", border: "border-violet-100" },
  depression: { color: "text-blue-600", bg: "bg-blue-50", label: "Depression", border: "border-blue-100" },
  relationships: { color: "text-pink-600", bg: "bg-pink-50", label: "Relationships", border: "border-pink-100" },
  "self-care": { color: "text-emerald-600", bg: "bg-emerald-50", label: "Self-Care", border: "border-emerald-100" },
  stress: { color: "text-amber-600", bg: "bg-amber-50", label: "Stress", border: "border-amber-100" },
  grief: { color: "text-cyan-600", bg: "bg-cyan-50", label: "Grief", border: "border-cyan-100" },
  sleep: { color: "text-indigo-600", bg: "bg-indigo-50", label: "Sleep", border: "border-indigo-100" },
  wellness: { color: "text-teal-600", bg: "bg-teal-50", label: "Wellness", border: "border-teal-100" },
  all: { color: "text-slate-600", bg: "bg-slate-50", label: "All", border: "border-slate-100" }
};

const ROOM_THEMES: any = {
  anxiety: { icon: "🫂", color: "#7c3aed", bg: "bg-violet-50", border: "border-violet-100" },
  depression: { icon: "💙", color: "#2563eb", bg: "bg-blue-50", border: "border-blue-100" },
  relationships: { icon: "💕", color: "#db2777", bg: "bg-pink-50", border: "border-pink-100" },
  "self-care": { icon: "🌿", color: "#059669", bg: "bg-emerald-50", border: "border-emerald-100" },
  stress: { icon: "😤", color: "#d97706", bg: "bg-amber-50", border: "border-amber-100" },
  grief: { icon: "🕊️", color: "#0891b2", bg: "bg-cyan-50", border: "border-cyan-100" },
  sleep: { icon: "🌙", color: "#4f46e5", bg: "bg-indigo-50", border: "border-indigo-100" },
  wellness: { icon: "✨", color: "#0d9488", bg: "bg-teal-50", border: "border-teal-100" },
};

export default function Community() {
  const { user } = useAuth();
  const [tab, setTab] = useState('chatrooms');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [chatrooms, setChatrooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any>({});
  const [communityStats, setCommunityStats] = useState({ totalMembers: 0, onlineMembers: 0, totalRooms: 0 });
  const [chatInput, setChatInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [postComments, setPostComments] = useState<any>({});
  const [replyInput, setReplyInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Socket setup
  useEffect(() => {
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://127.0.0.1:5000');
      socketRef.current = socket;
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Data Fetching
  useEffect(() => {
    // Rooms
    fetch('http://127.0.0.1:5000/api/chatrooms')
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((room: any) => ({
            id: room._id,
            name: room.name,
            desc: room.description,
            topic: room.topic,
            icon: ROOM_THEMES[room.topic]?.icon || "🗯️",
            color: ROOM_THEMES[room.topic]?.color || "#7c3aed",
            theme: ROOM_THEMES[room.topic] || ROOM_THEMES.anxiety,
            members: room.memberCount * 10 || 50,
            online: room.memberCount || 5
          }));
          setChatrooms(formatted);
        }
      });

    // Stats
    fetch('http://127.0.0.1:5000/api/community/stats')
      .then(r => r.json())
      .then(res => res.success && setCommunityStats(res));

    // Posts
    const token = localStorage.getItem('token');
    fetch('http://127.0.0.1:5000/api/forum/posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setPosts(res.data.map((p: any) => ({
            id: p._id,
            title: p.title || "Support Request",
            author: p.user?.username || "Anonymous",
            avatar: (p.user?.username || "A").charAt(0).toUpperCase(),
            category: p.topic || 'general',
            likes: p.likesCount || 0,
            replies: p.commentsCount || 0,
            time: new Date(p.createdAt).toLocaleDateString(),
            preview: p.content
          })));
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedPost) return;
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:5000/api/forum/posts/${selectedPost.id}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(res => res.success && setPostComments((prev: any) => ({
      ...prev,
      [selectedPost.id]: res.data.map((c: any) => ({
        text: c.content,
        user: c.user?.username || "Anonymous",
        time: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    })));
  }, [selectedPost]);

  useEffect(() => {
    if (!selectedRoom || !socketRef.current) return;
    const socket = socketRef.current;
    
    socket.emit('join_room', selectedRoom.id);

    fetch(`http://127.0.0.1:5000/api/chatrooms/${selectedRoom.id}/messages`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((m: any) => ({
            id: m._id,
            text: m.message,
            isOwn: m.userId === user?.id,
            user: m.username,
            avatar: (m.username || "U").charAt(0).toUpperCase(),
            replyTo: m.replyTo,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages((prev: any) => ({ ...prev, [selectedRoom.id]: formatted }));
        }
      });

    const onReceive = (msg: any) => {
      const formatted = {
        id: msg._id,
        text: msg.message,
        isOwn: msg.userId === user?.id,
        user: msg.username,
        avatar: (msg.username || "U").charAt(0).toUpperCase(),
        replyTo: msg.replyTo,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev: any) => ({
        ...prev,
        [msg.chatroomId]: [...(prev[msg.chatroomId] || []), formatted],
      }));
    };

    const onDelete = (messageId: string) => {
      setMessages((prev: any) => ({
        ...prev,
        [selectedRoom.id]: (prev[selectedRoom.id] || []).filter((m: any) => m.id !== messageId),
      }));
    };

    socket.on('receive_message', onReceive);
    socket.on('message_deleted', onDelete);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('message_deleted', onDelete);
      socket.emit('leave_room', selectedRoom.id);
    };
  }, [selectedRoom, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedRoom]);

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedRoom || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      chatroomId: selectedRoom.id,
      userId: isAnonymous ? 'anonymous' : (user?.id || 'anonymous'),
      username: isAnonymous ? 'Anonymous' : (user?.username || 'Anonymous'),
      message: chatInput,
      replyTo: replyingTo ? replyingTo.id : null
    });
    setChatInput('');
    setReplyingTo(null);
  };

  const handleCreatePost = () => {
    if(!newPostTitle.trim() || !newPostBody.trim()) return;
    const topic = filterCat === 'all' ? 'general' : filterCat;
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:5000/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: newPostTitle, content: newPostBody, topic, isAnonymous })
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        const p = res.data;
        setPosts([{
          id: p._id,
          title: p.title || newPostTitle,
          author: isAnonymous ? "Anonymous" : (user?.username || "Me"),
          avatar: isAnonymous ? "A" : (user?.username || "M").charAt(0).toUpperCase(),
          category: p.topic || topic,
          likes: 0,
          replies: 0,
          time: "Just now",
          preview: p.content
        }, ...posts]);
        setNewPostTitle('');
        setNewPostBody('');
        setNewPostOpen(false);
      }
    });
  };

  const handleAddComment = (e: any) => {
    e.preventDefault();
    if(!replyInput.trim()) return;
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:5000/api/forum/posts/${selectedPost.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: replyInput, isAnonymous })
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        setPostComments({
          ...postComments,
          [selectedPost.id]: [...(postComments[selectedPost.id] || []), { 
            text: res.data.content,
            user: isAnonymous ? "Anonymous" : (res.data.user?.username || user?.username),
            time: "Just now"
          }]
        });
        const updatedPost = { ...selectedPost, replies: selectedPost.replies + 1 };
        setSelectedPost(updatedPost);
        setPosts(posts.map((p: any) => p.id === selectedPost.id ? updatedPost : p));
        setReplyInput('');
      }
    });
  };

  // --- RENDERING MODULES ---

  if (selectedRoom) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 font-sans">
        {/* ROOM TOP BAR */}
        <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <button 
            onClick={() => setSelectedRoom(null)} 
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`w-12 h-12 rounded-2xl ${selectedRoom.theme.bg} border ${selectedRoom.theme.border} flex items-center justify-center text-2xl shadow-sm`}>
            {selectedRoom.icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{selectedRoom.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{selectedRoom.online} active now</span>
            </div>
          </div>
          <div className={`ml-auto hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border ${selectedRoom.theme.border} ${selectedRoom.theme.bg} ${ROOM_THEMES[selectedRoom.topic]?.color} text-[10px] font-black uppercase tracking-widest`}>
            {selectedRoom.topic}
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className={`p-6 rounded-3xl ${selectedRoom.theme.bg} border ${selectedRoom.theme.border} text-center space-y-3`}>
              <div className="text-4xl">{selectedRoom.icon}</div>
              <h3 className="text-lg font-bold text-slate-800">{selectedRoom.name}</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">{selectedRoom.desc}</p>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-2">Respect privacy & support one another.</div>
            </div>

            {(messages[selectedRoom.id] || []).map((msg: any, i: number) => (
              <div key={msg.id || i} className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {!msg.isOwn && (
                  <div className={`w-9 h-9 rounded-xl ${selectedRoom.theme.bg} border ${selectedRoom.theme.border} flex items-center justify-center text-xs font-bold shrink-0 ${ROOM_THEMES[selectedRoom.topic]?.color}`}>
                    {msg.avatar}
                  </div>
                )}
                <div className={`max-w-[75%] space-y-1 ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!msg.isOwn && <span className="text-[11px] font-bold text-slate-400 ml-1">{msg.user}</span>}
                  
                  <div className="relative group">
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${
                      msg.isOwn 
                      ? 'bg-slate-900 text-white rounded-tr-none shadow-lg shadow-slate-200' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      {msg.replyTo && (
                        <div className={`mb-3 p-2 rounded-lg text-xs border-l-4 ${msg.isOwn ? 'bg-white/10 border-white/50 text-white/80' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                           <div className="font-bold text-[10px] mb-0.5">{msg.replyTo.username}</div>
                           <div className="truncate">{msg.replyTo.rawContent || msg.replyTo.message}</div>
                        </div>
                      )}
                      {msg.text}
                    </div>

                    {/* Options on hover */}
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.isOwn ? 'right-full mr-2' : 'left-full ml-2'}`}>
                       <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><MessageCircle className="w-3.5 h-3.5" /></button>
                       {msg.isOwn && <button onClick={() => socketRef.current.emit('delete_message', { messageId: msg.id, roomId: selectedRoom.id })} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                       <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mx-1">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT BOX */}
        <div className="bg-white border-t border-slate-100 p-4 md:px-8 md:py-6">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto space-y-4">
            {replyingTo && (
              <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-xs text-slate-500 animate-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-2 truncate">
                   <span className="text-slate-400">Replying to</span>
                   <span className="font-bold text-slate-600">@{replyingTo.user}</span>
                   <span className="truncate opacity-50 italic">"{replyingTo.text}"</span>
                 </div>
                 <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-slate-800"><Plus className="w-4 h-4 rotate-45" /></button>
              </div>
            )}
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer group whitespace-nowrap">
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isAnonymous ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                  {isAnonymous && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                <span className="text-xs font-bold text-slate-500">Anonymous</span>
              </label>

              <div className="flex-1 bg-slate-50 rounded-2xl flex items-center px-4 py-1.5 border border-slate-100 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                <input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Share your thoughts..." 
                  className="w-full bg-transparent border-none py-3 outline-none text-sm font-medium" 
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim()}
                  className="ml-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- FORUM DETAIL VIEW ---
  if (selectedPost && tab === 'forums') {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 font-sans animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
           <button 
            onClick={() => setSelectedPost(null)} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors px-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Forums
          </button>

          <article className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-10 space-y-8 relative overflow-hidden">
             {/* Category Tag */}
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${CATEGORIES[selectedPost.category]?.bg} border ${CATEGORIES[selectedPost.category]?.border} flex items-center justify-center font-black text-lg ${CATEGORIES[selectedPost.category]?.color}`}>
                  {selectedPost.avatar}
                </div>
                <div>
                   <h4 className="text-sm font-bold text-slate-800">{selectedPost.author}</h4>
                   <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{selectedPost.time}</p>
                </div>
                <div className={`ml-auto px-4 py-1.5 rounded-full border ${CATEGORIES[selectedPost.category]?.border} ${CATEGORIES[selectedPost.category]?.bg} ${CATEGORIES[selectedPost.category]?.color} text-[10px] font-black uppercase tracking-widest`}>
                   {selectedPost.category}
                </div>
             </div>

             <div className="space-y-4">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{selectedPost.title}</h1>
                <p className="text-base text-slate-600 leading-8 whitespace-pre-wrap">{selectedPost.preview}</p>
             </div>

             <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <button className="flex items-center gap-2 group">
                   <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center transition-transform active:scale-125 group-hover:scale-105">
                     <Heart className={`w-5 h-5 ${selectedPost.isLiked ? 'fill-pink-500' : ''}`} />
                   </div>
                   <span className="text-sm font-bold text-slate-400 group-hover:text-pink-500 transition-colors uppercase tracking-widest">{selectedPost.likes} Likes</span>
                </button>
                <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                   <MessageCircle className="w-4 h-4" /> {selectedPost.replies} Replies
                </div>
             </div>
          </article>

          {/* REPLIES SECTION */}
          <section className="space-y-6">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[.25em] px-1">Replies ({selectedPost.replies})</h3>
             
             <div className="space-y-4">
                {(postComments[selectedPost.id] || []).map((comment: any, i: number) => (
                  <div key={i} className="bg-white/80 backdrop-blur rounded-3xl border border-slate-100 p-6 flex gap-4 items-start shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-400 uppercase">
                        {comment.user.charAt(0)}
                     </div>
                     <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-black text-slate-800">{comment.user}</span>
                           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{comment.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{comment.text}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between px-1">
                   <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Post a reply</div>
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border transition-all ${isAnonymous ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                        {isAnonymous && <CheckCircle2 className="w-2.5 h-2.5 text-white m-0.5" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                      <span className="text-[11px] font-bold text-slate-400">Reply Anonymously</span>
                   </label>
                </div>
                <div className="space-y-4">
                  <textarea 
                    value={replyInput} 
                    onChange={e => setReplyInput(e.target.value)} 
                    placeholder="Type your reply here..." 
                    rows={4} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all resize-none"
                  />
                  <div className="flex justify-end pt-2">
                     <button 
                      onClick={handleAddComment} 
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98]"
                    >Post Reply</button>
                  </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    );
  }

  // --- MAIN COMMUNITY LISTING VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* SECTION 1: HERO */}
      <div className="bg-white border-b border-slate-100 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 relative z-10 text-center space-y-6">
          <div className="flex justify-center">
             <div className="inline-flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{communityStats.onlineMembers} members online</span>
             </div>
          </div>
          
          <div className="space-y-4 items-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter max-w-2xl leading-[1.1]">
              A Safe Haven for Your <span className="text-primary-600 italic">Mental Health</span>.
            </h1>
            <p className="text-base text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
              Connect with a kind and supportive community. Join real-time peer chatrooms or explore shared experiences in our anonymous forums.
            </p>
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-12">
             <div className="text-center">
                <div className="text-2xl font-black text-slate-900 tracking-tighter">{communityStats.totalMembers}+</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Community Members</div>
             </div>
             <div className="text-center">
                <div className="text-2xl font-black text-slate-900 tracking-tighter">{communityStats.totalRooms}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Rooms</div>
             </div>
             <div className="text-center">
                <div className="text-2xl font-black text-slate-900 tracking-tighter">24/7</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Always Available</div>
             </div>
          </div>
        </div>

        {/* Subtle Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50/40 rounded-full blur-[100px] -mr-48 -mt-48 select-none pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50/40 rounded-full blur-[100px] -ml-48 -mb-48 select-none pointer-events-none" />
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
         <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex gap-2 w-full max-w-lg mx-auto overflow-hidden">
            <button 
              onClick={() => { setTab('chatrooms'); setSelectedRoom(null); setSelectedPost(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === 'chatrooms' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <MessagesSquare className="w-4 h-4" /> Chatrooms
            </button>
            <button 
              onClick={() => { setTab('forums'); setSelectedRoom(null); setSelectedPost(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === 'forums' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <UserCircle2 className="w-4 h-4" /> Community Forums
            </button>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16">
        
        {/* TAB 1: CHATROOMS */}
        {tab === 'chatrooms' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Support Rooms</h2>
                  <p className="text-sm text-slate-400 font-medium">Click any room to join live peer-to-peer conversations.</p>
               </div>
               <div className="flex items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Private</span>
                  <span className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Live Now</span>
                  <span className="flex items-center gap-2 text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" /> Moderated</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {chatrooms.map((room) => (
                 <div 
                  key={room.id} 
                  onClick={() => setSelectedRoom(room)}
                  className="group bg-white rounded-[32px] border border-slate-200 p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary-100/20 hover:-translate-y-2 relative flex flex-col h-full"
                >
                   <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${room.theme.bg} border ${room.theme.border} flex items-center justify-center text-2xl transition-transform duration-500 group-hover:scale-110 shadow-sm shadow-black/5`}>
                         {room.icon}
                      </div>
                      <div className={`px-4 py-1.5 rounded-full border ${room.theme.border} ${room.theme.bg} ${ROOM_THEMES[room.topic]?.color} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                         {room.topic}
                      </div>
                   </div>
                   
                   <div className="space-y-3 mb-auto">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors leading-tight">
                        {room.name}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
                        {room.desc}
                      </p>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="flex -space-x-2">
                            {[1,2,3].map(i => <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${room.theme.bg} shadow-sm`} />)}
                         </div>
                         <div className="ml-1">
                            <div className="text-[11px] font-black text-slate-900 leading-none">{room.online} Active</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{room.members}+ Total</div>
                         </div>
                      </div>
                      
                      <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95 group-hover:shadow-primary-200">
                         Join Now
                         <Plus className="w-3.5 h-3.5" />
                      </button>
                   </div>
                 </div>
               ))}
            </div>

            {/* GUIDELINES FOOTER */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-3xl shadow-inner shrink-0 italic text-emerald-500 font-black">!</div>
               <div className="space-y-4">
                  <h4 className="text-base font-black text-slate-900">Mental Health Safety Commitment</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">We ensure our rooms are safe, non-judgmental, and secure. Please avoid medical advice and focus on peer support. If you're in crisis, please seek immediate professional help.</p>
                  <div className="flex flex-wrap gap-4 pt-2">
                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 px-3 py-1 rounded-full uppercase tracking-widest">✓ No Harassment</span>
                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 px-3 py-1 rounded-full uppercase tracking-widest">✓ Anonymous Chat</span>
                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 px-3 py-1 rounded-full uppercase tracking-widest">✓ Human Moderation</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* TAB 2: FORUMS */}
        {tab === 'forums' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Community Feed</h2>
                  <p className="text-sm text-slate-400 font-medium">Read, reflect, and contribute to deeper mental wellness discussions.</p>
               </div>
               <button 
                onClick={() => setNewPostOpen(!newPostOpen)}
                className={`py-4 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[.2em] transition-all flex items-center gap-3 shadow-xl ${newPostOpen ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-slate-100' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}`}
              >
                {newPostOpen ? <Plus className="w-4 h-4 rotate-45" /> : <Plus className="w-4 h-4" />} {newPostOpen ? 'Cancel Writing' : 'Start a Discussion'}
              </button>
            </div>

            {/* NEW POST FORM */}
            {newPostOpen && (
              <div className="bg-white rounded-[32px] border-2 border-primary-100 p-8 md:p-10 shadow-2xl shadow-primary-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">The Title</label>
                        <input value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} placeholder="What's on your mind?" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-primary-50 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Topic</label>
                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-500 outline-none focus:bg-white transition-all appearance-none cursor-pointer">
                           {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Story</label>
                      <textarea value={newPostBody} onChange={e => setNewPostBody(e.target.value)} rows={6} placeholder="Write something meaningful..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium leading-relaxed placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-primary-50 transition-all resize-none" />
                   </div>
                   <div className="flex items-center justify-between pt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isAnonymous ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-100' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                          {isAnonymous && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                        <span className="text-xs font-bold text-slate-500">Post Anonymously</span>
                      </label>
                      <button onClick={handleCreatePost} className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all">Submit Post</button>
                   </div>
                </div>
              </div>
            )}

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col gap-6">
               <div className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none">
                     <Search className="w-5 h-5" />
                  </div>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for stories, tips, or support..." className="w-full bg-white border border-slate-200 rounded-3xl pl-16 pr-6 py-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary-50/50 focus:border-primary-100 transition-all shadow-sm" />
               </div>

               <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
                  {Object.keys(CATEGORIES).map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => setFilterCat(cat)}
                      className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterCat === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
            </div>

            {/* FEED */}
            <div className="grid grid-cols-1 gap-6">
               {posts
                .filter((p: any) => filterCat === 'all' || p.category === filterCat)
                .filter((p: any) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.preview.toLowerCase().includes(search.toLowerCase()))
                .map((post) => (
                 <article 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="group bg-white rounded-[32px] border border-slate-100 p-8 md:p-10 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1 relative h-full flex flex-col"
                >
                    <div className="flex items-center gap-4 mb-8">
                       <div className={`w-10 h-10 rounded-xl ${CATEGORIES[post.category]?.bg} border ${CATEGORIES[post.category]?.border} flex items-center justify-center font-black text-xs ${CATEGORIES[post.category]?.color}`}>
                          {post.avatar}
                       </div>
                       <div>
                          <h6 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{post.author}</h6>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{post.time}</p>
                       </div>
                       <div className={`ml-auto px-4 py-1.5 rounded-full border ${CATEGORIES[post.category]?.border} ${CATEGORIES[post.category]?.bg} ${CATEGORIES[post.category]?.color} text-[9px] font-black uppercase tracking-widest`}>
                          {post.category}
                       </div>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                       <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary-600 transition-colors leading-tight tracking-tight">
                        {post.title}
                       </h3>
                       <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
                        {post.preview}
                       </p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center gap-6">
                       <span className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-pink-500 transition-all">
                          <Heart className="w-4 h-4" /> {post.likes}
                       </span>
                       <span className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary-600 transition-all">
                          <MessageCircle className="w-4 h-4" /> {post.replies}
                       </span>
                       <span className="ml-auto text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 flex items-center gap-1">
                        Read Story <Plus className="w-3.5 h-3.5 rotate-45" />
                       </span>
                    </div>
                 </article>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
