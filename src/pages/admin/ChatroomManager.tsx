import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Monitor, 
  ArrowLeft, 
  Activity, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  X,
  MessageSquare,
  ShieldOff
} from 'lucide-react';

export default function ChatroomManager() {
  const [chatrooms, setChatrooms] = useState<any[]>([]);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', topic: 'general', description: '' });

  // Live monitor
  const [monitoringRoom, setMonitoringRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchRooms();
    const socket = io('http://127.0.0.1:5000');
    socketRef.current = socket;

    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        if (!prev.find(m => m._id === msg._id)) return [...prev, msg];
        return prev;
      });
    });

    socket.on('message_deleted', (msgId) => {
      setMessages(prev => prev.filter(m => m._id !== msgId));
    });

    return () => { socket.disconnect(); };
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/chatrooms');
      const data = await res.json();
      setChatrooms(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = isCreating ? 'POST' : 'PUT';
      const url = isCreating ? 'http://127.0.0.1:5000/api/chatrooms' : `http://127.0.0.1:5000/api/chatrooms/${editingRoom._id}`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsCreating(false);
        setEditingRoom(null);
        fetchRooms();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this chatroom and all messages?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/chatrooms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchRooms();
    } catch (e) { console.error(e); }
  };

  const startMonitoring = async (room: any) => {
    setMonitoringRoom(room);
    setMessages([]);
    socketRef.current.emit('join_room', room._id);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/chatrooms/${room._id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const stopMonitoring = () => {
    if (monitoringRoom) socketRef.current.emit('leave_room', monitoringRoom._id);
    setMonitoringRoom(null);
    setMessages([]);
  };

  const deleteMessage = (msgId: string) => {
    if (monitoringRoom && socketRef.current) {
      socketRef.current.emit('admin_delete_message', { messageId: msgId, roomId: monitoringRoom._id });
    }
  };

  const banUser = (userId: string) => {
    if (window.confirm('Ban this user? Their account will be restricted.')) {
      if (monitoringRoom && socketRef.current) {
        socketRef.current.emit('admin_ban_user', { userId, roomId: monitoringRoom._id });
      }
    }
  };

  if (monitoringRoom) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px] animate-in slide-in-from-bottom-2 duration-500 font-sans">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button onClick={stopMonitoring} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors border border-transparent hover:border-slate-200">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 <Activity className="w-5 h-5 text-emerald-500" /> Live Monitor: {monitoringRoom.name}
               </h2>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Real-time supervision enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Link</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
               <MessageSquare className="w-12 h-12 mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest">Awaiting messages...</p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div key={msg._id} className="group bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50 flex items-start justify-between hover:bg-white hover:border-primary-100 hover:shadow-lg hover:shadow-primary-50 transition-all duration-300">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center font-black text-[10px] text-primary-600 border border-primary-200">
                       {msg.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-bold text-sm text-slate-800">{msg.username}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium pl-11">{msg.message}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all ml-4">
                  <button onClick={() => deleteMessage(msg._id)} className="p-2 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors" title="Delete Message"><Trash2 className="w-4 h-4" /></button>
                  {msg.userId && msg.userId !== 'anonymous' && (
                    <button onClick={() => banUser(msg.userId)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors" title="Restrict User"><ShieldOff className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (editingRoom || isCreating) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-200 p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-500 max-w-2xl mx-auto font-sans">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{isCreating ? 'Deploy New Environment' : 'Refine Space Parameters'}</h2>
              <p className="text-sm text-slate-400 font-medium">Configure the technical details of the support room.</p>
           </div>
           <button onClick={() => { setIsCreating(false); setEditingRoom(null); }} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary-600 ml-1">Room Designation (Name)</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all" placeholder="e.g. Anxiety Recovery Support" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary-600 ml-1">Categorical Topic</label>
              <input value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value.toLowerCase()})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all uppercase placeholder:normal-case" placeholder="anxiety" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary-600 ml-1">Functional Description</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all resize-none leading-relaxed" placeholder="What is the primary objective of this space?" />
           </div>
           <div className="pt-8 flex gap-4">
              <button onClick={handleSave} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-4 text-sm font-bold shadow-xl shadow-primary-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Finalize Changes
              </button>
              <button onClick={() => { setIsCreating(false); setEditingRoom(null); }} className="px-8 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl py-4 text-sm font-bold hover:bg-slate-100 transition-all">Cancel</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Room Infrastructure</h1>
          <p className="text-sm text-slate-500 font-medium">Coordinate live support spaces and manage operational parameters.</p>
        </div>
        <button 
          onClick={() => { setIsCreating(true); setFormData({ name: '', topic: 'general', description: '' }); }} 
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Initialize New Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {chatrooms.map((room) => (
          <div key={room._id} className="group bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <MessageSquare className="w-24 h-24 -mr-8 -mt-8" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-center text-primary-600 shadow-inner">
                   <Activity className="w-6 h-6 transition-transform group-hover:scale-110 duration-500" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                   <Users className="w-3 h-3 text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{room.memberCount || 0} Live</span>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                 <div className="text-[10px] font-black uppercase tracking-widest text-primary-600">{room.topic}</div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">{room.name}</h4>
                 <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2 h-10">{room.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10">
               <button 
                onClick={() => startMonitoring(room)} 
                className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Monitor className="w-3.5 h-3.5" /> Monitor
              </button>
               <button 
                onClick={() => { setEditingRoom(room); setFormData({ name: room.name, topic: room.topic, description: room.description }); }} 
                className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
               <button 
                onClick={() => handleDelete(room._id)} 
                className="p-3 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {chatrooms.length === 0 && (
           <div className="col-span-full h-80 flex flex-col items-center justify-center text-center p-12 bg-white rounded-[32px] border-2 border-dashed border-slate-100 animate-pulse">
              <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
              <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No Active Nodes</h3>
              <p className="text-sm text-slate-300 font-medium">Ready for deployment.</p>
           </div>
        )}
      </div>
    </div>
  );
}
