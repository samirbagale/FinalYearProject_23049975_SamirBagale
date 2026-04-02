import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Helper functions
function isToday(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isTomorrow(dateStr: string) {
    const date = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getFullYear() === tomorrow.getFullYear();
}

function isUrgent(dateStr: string, timeStr: string) {
    if (!isToday(dateStr)) return false;
    const now = new Date();
    const [timePart, modifier] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const sessionTime = new Date();
    sessionTime.setHours(hours, minutes, 0, 0);
    const diffMins = (sessionTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMins > -15 && diffMins <= 30;
}

const PsychiatristDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'today' | 'urgent'>('all');
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [confirmingApt, setConfirmingApt] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');
    const [videoRooms, setVideoRooms] = useState<any[]>([]);
    
    // Messaging State
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [msgInput, setMsgInput] = useState('');
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [patientMenuId, setPatientMenuId] = useState<string | null>(null);
    const [msgMenuId, setMsgMenuId] = useState<string | null>(null);
    const [replyToMsg, setReplyToMsg] = useState<any | null>(null);
    
    const [patients, setPatients] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);

    const totalUnread = patients.reduce((acc, p) => acc + p.unread, 0);

    const handleClearChat = async () => {
        if (!selectedPatientId) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://127.0.0.1:5000/api/messages/clear/${selectedPatientId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages([]);
            setShowChatMenu(false);
        } catch (e) {
            console.error("Failed to clear chat", e);
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedPatientId) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://127.0.0.1:5000/api/messages/clear/${selectedPatientId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(prev => prev.filter(p => p.id !== selectedPatientId));
            setSelectedPatientId(null);
            setMessages([]);
            setShowChatMenu(false);
        } catch (e) {
            console.error("Failed to delete conversation", e);
        }
    };

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || msgInput;
        if (!text.trim() || !selectedPatientId) {
            console.warn("[Dashboard] Missing text or patient selection", { text, selectedPatientId });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Session expired. Please log in again.");
            return;
        }

        const newMsg = { 
            _id: 'temp-' + Date.now(),
            sender: user?.id, 
            recipient: selectedPatientId,
            content: text, 
            replyTo: replyToMsg ? { _id: replyToMsg._id, content: replyToMsg.content, sender: replyToMsg.sender } : null,
            createdAt: new Date().toISOString() 
        };
        
        console.log("[Dashboard] Attempting to send message to:", selectedPatientId);
        setMessages(prev => [...prev, newMsg]);
        setMsgInput('');
        const sentReplyToId = replyToMsg?._id;
        setReplyToMsg(null);

        try {
            const response = await fetch('http://127.0.0.1:5000/api/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId: selectedPatientId,
                    content: text,
                    replyTo: sentReplyToId
                })
            });
            const data = await response.json();
            if (!data.success) {
                console.error("[Dashboard] Server error sending message:", data.error);
                alert("Failed to send: " + data.error);
            }
        } catch (e) {
            console.error("[Dashboard] Network error sending message:", e);
        }
    };

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Caregiver Daily Tip
    const dailyTip = "Remember to take short breathing breaks between sessions to maintain your own emotional balance.";

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('http://127.0.0.1:5000/api/appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    console.log(`[Dashboard] Fetched ${data.data.length} appointments for ${user?.email}`);
                    setAppointments(data.data);
                }
            } catch (error) {
                console.error("Failed to load appointments", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://127.0.0.1:5000/api/messages/list/conversations', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    const formatted = data.data.map((conv: any) => {
                        const otherUser = conv.user;
                        const name = otherUser.username || 'Unknown Patient';
                        const currentUserIdStr = user?.id?.toString();
                        return {
                            id: otherUser._id.toString(),
                            name: name,
                            initials: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                            gradient: `linear-gradient(135deg, #7c3aed, #a78bfa)`,
                            lastMsg: conv.latestMessage.content,
                            time: new Date(conv.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            unread: conv.latestMessage.read === false && conv.latestMessage.recipient?.toString() === currentUserIdStr ? 1 : 0,
                            online: true
                        };
                    });
                    setPatients(formatted);
                }
            } catch (e) {
                console.error("Failed to fetch conversations", e);
            }
        };

        if (user && user.role === 'psychiatrist') {
            fetchAppointments();
            fetchConversations();
        } else if (user && user.role !== 'psychiatrist') {
            navigate('/');
        }

        const syncInterval = setInterval(() => {
            if (user && user.role === 'psychiatrist') {
                fetchAppointments();
                fetchConversations();
            }
        }, 10000);

        // Socket.io for Real-time Video Sessions
        const socket = io('http://127.0.0.1:5000');

        socket.on('connect', () => {
            socket.emit('video-get-rooms');
        });

        socket.on('video-rooms-update', (rooms: any) => {
            setVideoRooms(rooms);
        });

        return () => {
            socket.disconnect();
            clearInterval(syncInterval);
        };
    }, [user, navigate]);

    // Role-based stats
    const upcoming = appointments.filter((a: any) => a.status === 'scheduled');
    const todayApts = upcoming.filter((a: any) => isToday(a.date));
    const urgentApts = upcoming.filter((a: any) => isUrgent(a.date, a.time));

    // Poll for active conversation history
    useEffect(() => {
        let historyInterval: any;

        const fetchHistory = async () => {
            if (!selectedPatientId) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://127.0.0.1:5000/api/messages/${selectedPatientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    if (JSON.stringify(data.data) !== JSON.stringify(messages)) {
                        setMessages(data.data);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch history", e);
            }
        };

        if (selectedPatientId) {
            fetchHistory();
            historyInterval = setInterval(fetchHistory, 3000);
        }

        return () => clearInterval(historyInterval);
    }, [selectedPatientId, messages]);

    // Close dropdowns when clicking anywhere else on the screen
    useEffect(() => {
        const handleGlobalClick = () => {
            setMsgMenuId(null);
            setPatientMenuId(null);
            setShowChatMenu(false);
        };
        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
                    <p className="text-gray-500 font-bold animate-pulse text-sm">Syncing your care workspace...</p>
                    <p className="text-[10px] text-gray-400">Loading profile for {user?.email}</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'psychiatrist') {
        return <div className="p-10 text-center text-red-500 font-bold text-sm">Access Denied. Psychiatrist account required.</div>
    }



    const getAvatarTheme = (name: string) => {
        const themes = [
            'bg-blue-100 text-blue-600 border-blue-200',
            'bg-purple-100 text-purple-600 border-purple-200',
            'bg-pink-100 text-pink-600 border-pink-200',
            'bg-orange-100 text-orange-600 border-orange-200',
            'bg-teal-100 text-teal-600 border-teal-200',
            'bg-indigo-100 text-indigo-600 border-indigo-200'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return themes[Math.abs(hash) % themes.length];
    };

    const filteredAppointments = upcoming.filter((apt: any) => {
        if (filter === 'today') return isToday(apt.date);
        if (filter === 'urgent') return isUrgent(apt.date, apt.time);
        return true;
    });

    const grouped = {
        today: filteredAppointments.filter(a => isToday(a.date)),
        tomorrow: filteredAppointments.filter(a => isTomorrow(a.date)),
        upcoming: filteredAppointments.filter(a => !isToday(a.date) && !isTomorrow(a.date))
    };

    const handleJoinClick = (roomId: string, aptId: string) => {
        setJoiningId(aptId);
        setTimeout(() => {
            navigate(`/video-session?roomId=${roomId}&username=${user.username}&aptId=${aptId}`);
        }, 1200);
    };

    const handleCancelClick = async () => {
        if (!confirmingApt) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:5000/api/appointments/${confirmingApt}/cancel`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAppointments(prev => prev.filter(a => a._id !== confirmingApt));
                setConfirmingApt(null);
            }
        } catch (error) {
            console.error("Failed to cancel appointment", error);
            setConfirmingApt(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFEFE] flex flex-col font-sans selection:bg-indigo-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');
                
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes typingDot {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .messages-scroll::-webkit-scrollbar { width: 4px; }
                .messages-scroll::-webkit-scrollbar-thumb { background: #ffffff10; border-radius: 4px; }
            ` }} />
            {/* Navbar */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 py-2 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-slate-400 hover:text-indigo-600 transition-all transform hover:scale-110 active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mind Care</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] -mt-1 ml-0.5" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "1px" }}>Professional Portal</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-black text-slate-900 leading-none">{user?.username}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{user?.email}</div>
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Refresh Dashboard"
                    >
                        🔄
                    </button>
                    <button 
                        onClick={logout} 
                        className="px-4 py-2 text-[11px] font-black text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent shadow-none active:scale-95"
                    >
                        Sign Out
                    </button>
                    <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black shadow-sm text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                {/* Tab Bar */}
                <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', gap: 0, position: 'sticky', top: 56, zIndex: 40 }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: '📊' },
                        { id: 'messages', label: 'Messages', icon: '💬', badge: totalUnread }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '14px 20px', border: 'none', background: 'transparent',
                                fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                                color: activeTab === tab.id ? '#4f46e5' : '#000000',
                                borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent'
                            }}
                        >
                            {tab.icon} {tab.label}
                            {tab.badge ? (
                                <span style={{ background: '#7c3aed', color: 'white', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 20, marginLeft: 6 }}>
                                    {tab.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
                
                {activeTab === 'overview' && (
                    <>
                
                {/* Personalized Hero Banner */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 md:p-12 mb-8 shadow-2xl shadow-indigo-100">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-xl">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-3" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "1.5px" }}>
                                {getGreeting()}
                            </span>
                            <h1 className="text-3xl md:text-5xl tracking-tighter mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "48px", letterSpacing: "-0.3px", color: "#0f172a" }}>
                                Welcome, {user.username.toLowerCase().includes('doctor') ? '' : 'Dr. '}{user.username}
                            </h1>
                            <p className="text-indigo-100 text-base md:text-lg font-bold max-w-lg leading-relaxed mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                "{dailyTip}"
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "1px" }}>Today's Load</span>
                                    <span className="text-lg font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{todayApts.length} Consultations</span>
                                </div>
                                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "1px" }}>Upcoming</span>
                                    <span className="text-lg font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{upcoming.length} Total</span>
                                </div>
                            </div>
                        </div>
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 font-black rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group shrink-0 text-sm"
                        >
                            <span className="text-base">🏡</span>
                            Back to App
                        </Link>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Activity Index', value: upcoming.length > 5 ? 'High' : 'Steady', color: 'indigo', icon: '📈' },
                        { label: 'Patient Reach', value: upcoming.length, color: 'blue', icon: '🤝' },
                        { label: 'Priority Alerts', value: urgentApts.length, color: 'red', icon: '🔥' },
                        { label: 'Care Status', value: 'Active', color: 'emerald', icon: '✨' }
                    ].map((s, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "1px" }}>{s.label}</span>
                                <span className={`text-xl font-black text-slate-800 leading-none`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</span>
                            </div>
                            <div className="w-11 h-11 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-xl group-hover:bg-indigo-50 transition-colors">{s.icon}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">Patient Consultations</h2>
                        <div className="flex items-center gap-2.5 text-slate-500 font-bold text-sm">
                            <span>Ready to connect with {filteredAppointments.length} patient(s)</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-indigo-600">Active Session Window Open</span>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'all', label: 'Overview', count: upcoming.length, icon: '🌈' },
                        { id: 'today', label: "Today's Schedule", count: todayApts.length, icon: '☀️' },
                        { id: 'urgent', label: 'Priority Check', count: urgentApts.length, icon: '⚡' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as any)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black transition-all whitespace-nowrap border-2 ${
                                filter === btn.id 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-800'
                            }`}
                        >
                            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{btn.icon}</span>
                            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>{btn.label}</span>
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${filter === btn.id ? 'bg-white/20' : 'bg-slate-100 text-slate-800'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {btn.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Date Group Sections */}
                {(['today', 'tomorrow', 'upcoming'] as const).map(groupKey => {
                    const groupTitle = groupKey === 'today' ? 'Today' : groupKey === 'tomorrow' ? 'Tomorrow' : 'Later this week';
                    const list = grouped[groupKey];
                    if (list.length === 0) return null;

                    return (
                        <div key={groupKey} className="mb-12">
                            <div className="flex items-center gap-5 mb-6 group">
                                <span className={`px-5 py-2 rounded-full border shrink-0 transition-all ${
                                    groupKey === 'today' 
                                    ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100' 
                                    : 'bg-white border-slate-100'
                                }`} style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: groupKey === 'today' ? "white" : "#64748b" }}>
                                    {groupTitle}
                                </span>
                                <div className="h-[2px] flex-1 bg-slate-100"></div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {list.map((apt) => (
                                    <AppointmentCard 
                                        key={apt._id} 
                                        apt={apt} 
                                        isUrgent={isUrgent(apt.date, apt.time)}
                                        isLive={videoRooms.some(([rid]) => rid === apt.roomId)}
                                        getAvatarTheme={getAvatarTheme}
                                        joiningId={joiningId}
                                        onJoin={() => handleJoinClick(apt.roomId, apt._id)}
                                        onCancel={() => setConfirmingApt(apt._id)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                    </>
                )}

                {activeTab === 'messages' && (
                    <div style={{ background: '#ffffff', borderRadius: 24, overflow: 'hidden', height: 'calc(100vh - 180px)', display: 'flex', border: '1px solid #e2e8f0', animation: 'fadeUp 0.4s ease-out', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        {/* LEFT PANEL - CONVERSATION LIST */}
                        <div style={{ width: 300, background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '16px 16px 12px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Chats</span>
                                </div>
                                <div style={{ marginTop: 10, background: '#f1f5f9', borderRadius: 10, padding: '7px 12px', display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, color: '#64748b' }}>🔍</span>
                                    <input 
                                        value={searchQuery} 
                                        onChange={e => setSearchQuery(e.target.value)} 
                                        placeholder="Search or start new chat" 
                                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#1e293b', width: '100%' }} 
                                    />
                                </div>
                            </div>
                            <div className="messages-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                                {patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((patient, i) => (
                                    <div 
                                        key={patient.id} 
                                        onClick={() => setSelectedPatientId(patient.id)}
                                        style={{
                                            padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.1s',
                                            display: 'flex', gap: 15, alignItems: 'center', animation: `slideIn 0.3s ease-out both ${i * 0.04}s`,
                                            background: selectedPatientId === patient.id ? '#f1f5f9' : 'transparent',
                                        }}
                                        onMouseEnter={(e) => { if(selectedPatientId !== patient.id) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={(e) => { if(selectedPatientId !== patient.id) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: patient.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700, position: 'relative' }}>
                                            {patient.initials}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0, paddingBottom: 5, paddingTop: 5, position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ fontSize: 16, color: '#1e293b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{patient.name}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                                    <div style={{ fontSize: 12, color: patient.unread > 0 ? '#7c3aed' : '#64748b' }}>{patient.time}</div>
                                                    <div className="patient-menu-trigger" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPatientMenuId(patientMenuId === patient.id ? null : patient.id);
                                                        }}
                                                        style={{ color: '#94a3b8', fontSize: 14, cursor: 'pointer', padding: '2px 4px' }}
                                                    >
                                                        ⌄
                                                    </div>
                                                </div>
                                            </div>

                                            {patientMenuId === patient.id && (
                                                <div style={{ position: 'absolute', top: 30, right: 0, width: 140, background: '#ffffff', borderRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedPatientId(patient.id); handleClearChat(); setPatientMenuId(null); }}
                                                        style={{ padding: '8px 12px', fontSize: 12, color: '#1e293b', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        Clear messages
                                                    </div>
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedPatientId(patient.id); handleDeleteConversation(); setPatientMenuId(null); }}
                                                        style={{ padding: '8px 12px', fontSize: 12, color: '#ef4444', borderTop: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        Delete chat
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                <div style={{ fontSize: 14, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{patient.lastMsg}</div>
                                                {patient.unread > 0 && <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: '#7c3aed', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{patient.unread}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT PANEL - CHAT WINDOW */}
                        <div style={{ flex: 1, background: '#ffffff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {!selectedPatientId ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                    <div style={{ width: 120, height: 120, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                        <span style={{ fontSize: 48, opacity: 0.5 }}>💬</span>
                                    </div>
                                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Select a conversation</h2>
                                    <p style={{ fontSize: 14, color: '#64748b', marginTop: 10, textAlign: 'center', maxWidth: 400, lineHeight: 1.5 }}>
                                        Choose a patient from the left to view their session history and messages.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', zIndex: 1 }}>
                                    {/* Header */}
                                    <div style={{ background: '#ffffff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: patients.find(p => p.id === selectedPatientId)?.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{patients.find(p => p.id === selectedPatientId)?.initials}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 16, color: '#1e293b', fontWeight: 700 }}>{patients.find(p => p.id === selectedPatientId)?.name}</div>
                                            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>online</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 20, alignItems: 'center', position: 'relative' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}>🔍</button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowChatMenu(!showChatMenu);
                                                }}
                                                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}
                                            >
                                                ⌄
                                            </button>
                                            
                                            {showChatMenu && (
                                                <div style={{ position: 'absolute', top: 40, right: 0, width: 180, background: '#ffffff', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, padding: '8px 0', border: '1px solid #f1f5f9' }}>
                                                    <div 
                                                        onClick={handleClearChat}
                                                        style={{ padding: '10px 20px', color: '#1e293b', fontSize: 14, cursor: 'pointer' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        Clear messages
                                                    </div>
                                                    <div 
                                                        onClick={handleDeleteConversation}
                                                        style={{ padding: '10px 20px', color: '#ef4444', fontSize: 14, cursor: 'pointer' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        Delete chat
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Messages Area */}
                                    <div className="messages-scroll" style={{ flex: 1, padding: '20px 50px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                                        {messages.map((msg: any, i: number) => {
                                            const myId = user?.id?.toString();
                                            const senderId = msg.sender?.toString();
                                            const isMe = senderId === myId;
                                            const msgId = msg._id || `msg-${i}`;
                                            const hasReply = msg.replyTo;
                                            
                                            return (
                                                <div key={msgId} style={{ 
                                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                    maxWidth: '65%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    marginBottom: 8,
                                                    position: 'relative',
                                                    paddingRight: isMe ? 0 : 20,
                                                    paddingLeft: isMe ? 20 : 0
                                                }}>
                                                    <div style={{
                                                        padding: '6px 7px 8px 9px',
                                                        fontSize: 14,
                                                        lineHeight: 1.5,
                                                        background: isMe ? '#d9fdd3' : '#ffffff',
                                                        borderRadius: isMe ? '12px 12px 12px 12px' : '12px 12px 12px 12px', // standard rounded
                                                        color: '#111b21',
                                                        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                                                        position: 'relative',
                                                        minWidth: 80
                                                    }}>
                                                        {/* Reply Block Inside Bubble */}
                                                        {hasReply && (
                                                            <div style={{
                                                                background: isMe ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.03)',
                                                                borderRadius: 6,
                                                                borderLeft: '4px solid #06cf9c',
                                                                padding: '4px 10px',
                                                                marginBottom: 4,
                                                                fontSize: 12,
                                                                cursor: 'pointer'
                                                            }}>
                                                                <div style={{ fontWeight: 700, color: '#06cf9c' }}>
                                                                    {hasReply.sender?.toString() === user?.id?.toString() ? 'You' : (patients.find(p => p.id === hasReply.sender?.toString())?.name || 'Patient')}
                                                                </div>
                                                                <div style={{ color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {hasReply.content}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                                            <div style={{ flex: 1, wordBreak: 'break-word', paddingTop: 2 }}>{msg.content}</div>
                                                            <div 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setMsgMenuId(msgMenuId === msgId ? null : msgId);
                                                                }}
                                                                style={{ 
                                                                    cursor: 'pointer', 
                                                                    opacity: 0.3, 
                                                                    fontSize: 12,
                                                                    marginTop: -2
                                                                }}
                                                            >
                                                                ⌄
                                                            </div>
                                                        </div>

                                                        {msgMenuId === msgId && (
                                                            <div style={{ 
                                                                position: 'absolute', 
                                                                top: 10, 
                                                                right: isMe ? 10 : 'auto', 
                                                                left: isMe ? 'auto' : 10,
                                                                width: 140, 
                                                                background: '#ffffff', 
                                                                borderRadius: 8, 
                                                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                                                                zIndex: 1000, 
                                                                padding: '4px 0', 
                                                                border: '1px solid #f1f5f9' 
                                                            }}>
                                                                <div 
                                                                    onClick={(e) => { e.stopPropagation(); setReplyToMsg(msg); setMsgMenuId(null); }}
                                                                    style={{ padding: '8px 16px', color: '#111b21', fontSize: 13, cursor: 'pointer' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                >
                                                                    Reply
                                                                </div>
                                                                <div 
                                                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(msg.content); setMsgMenuId(null); }}
                                                                    style={{ padding: '8px 16px', color: '#111b21', fontSize: 13, cursor: 'pointer' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                >
                                                                    Copy
                                                                </div>
                                                                <div 
                                                                    onClick={async (e) => { 
                                                                        e.stopPropagation(); 
                                                                        try {
                                                                            const token = localStorage.getItem('token');
                                                                            await fetch(`http://127.0.0.1:5000/api/messages/${msg._id}`, {
                                                                                method: 'DELETE',
                                                                                headers: { Authorization: `Bearer ${token}` }
                                                                            });
                                                                            setMessages(prev => prev.filter(m => (m._id || m.createdAt) !== (msg._id || msg.createdAt)));
                                                                        } catch (err) {
                                                                            console.error("Delete failed", err);
                                                                        }
                                                                        setMsgMenuId(null);
                                                                    }}
                                                                    style={{ padding: '8px 16px', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                >
                                                                    Delete
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div style={{ 
                                                            fontSize: 11, 
                                                            color: '#667781', 
                                                            textAlign: 'right', 
                                                            marginTop: 2,
                                                            display: 'flex',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                            gap: 4
                                                        }}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                            {isMe && <span style={{ color: '#53bdeb', fontSize: 14 }}>✓✓</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Reply Preview */}
                                    {replyToMsg && (
                                        <div style={{ background: '#f8fafc', padding: '10px 25px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ borderLeft: '4px solid #7c3aed', paddingLeft: 12 }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>Replying to {(replyToMsg.sender?._id?.toString() || replyToMsg.sender?.toString()) === user?.id?.toString() ? 'yourself' : (patients.find(p => p.id === (replyToMsg.sender?._id?.toString() || replyToMsg.sender?.toString()))?.name || 'patient')}</div>
                                                <div style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>{replyToMsg.content}</div>
                                            </div>
                                            <button 
                                                onClick={() => setReplyToMsg(null)}
                                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    {/* Input Bar */}
                                    <div style={{ background: '#ffffff', padding: '15px 25px', display: 'flex', gap: 15, alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: '10px 16px', display: 'flex', border: '1px solid #e2e8f0' }}>
                                            <textarea 
                                                value={msgInput} 
                                                onChange={e => setMsgInput(e.target.value)} 
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                                placeholder="Type a message" 
                                                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#1e293b', fontFamily: 'inherit', lineHeight: 1.5, resize: 'none' }} 
                                                rows={1}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => handleSendMessage()}
                                            disabled={!msgInput.trim()} 
                                            style={{ 
                                                background: msgInput.trim() ? '#7c3aed' : '#e2e8f0', 
                                                border: 'none', 
                                                cursor: msgInput.trim() ? 'pointer' : 'default',
                                                color: '#ffffff',
                                                padding: '10px 20px',
                                                borderRadius: 10,
                                                fontWeight: 700,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                </div>
            </main>

            {/* Custom Interactive Cancellation Modal */}
            {confirmingApt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in"
                        onClick={() => setConfirmingApt(null)}
                    ></div>
                    
                    {/* Modal Card */}
                    <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center animate-scale-up border border-slate-100">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner animate-bounce-subtle">
                            ⚠️
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Wait, {user?.username === 'Doctor' ? '' : 'Dr. '}{user?.username}</h3>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                            Are you absolutely sure you want to <span className="text-rose-600">remove this session</span> from your schedule? This action cannot be undone.
                        </p>
                        
                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={handleCancelClick}
                                className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 text-[11px] tracking-widest"
                            >
                                YES, CANCEL SESSION
                            </button>
                            <button
                                onClick={() => setConfirmingApt(null)}
                                className="w-full py-4 bg-slate-50 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95 text-[11px] tracking-widest"
                            >
                                NO, KEEP IT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface AppointmentCardProps {
    apt: any;
    isUrgent: boolean;
    isLive: boolean;
    getAvatarTheme: (name: string) => string;
    joiningId: string | null;
    onJoin: () => void;
    onCancel: () => void;
}

const AppointmentCard = ({ apt, isUrgent, isLive, getAvatarTheme, joiningId, onJoin, onCancel }: AppointmentCardProps) => {
    const isJoining = joiningId === apt._id;

    return (
        <div className={`relative bg-white rounded-[2.5rem] border-2 transition-all duration-500 transform hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.1)] group overflow-hidden ${
            isUrgent ? 'border-red-500/20 shadow-red-50' : 'border-transparent shadow-sm hover:border-indigo-50'
        }`}>
            {/* Urgent Top Stripe */}
            {isUrgent && (
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 z-10"></div>
            )}

            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-[56px] h-[56px] rounded-2xl flex items-center justify-center text-xl font-black shadow-inner border-2 ${getAvatarTheme(apt.patient?.username || 'P')}`}>
                            {apt.patient?.username?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                            <h3 className="leading-none mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px", color: "#0f172a" }}>
                                {apt.patient?.username || 'Patient'}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${apt.status === 'completed' ? 'bg-slate-300' : isLive ? 'bg-green-500 animate-pulse' : isUrgent ? 'bg-red-500 animate-pulse' : 'bg-indigo-200'}`}></span>
                                <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: apt.status === 'completed' ? "#94a3b8" : isLive ? "#10b981" : "#64748b" }}>
                                    {apt.status === 'completed' ? 'Session Ended' : isLive ? 'Session Active Now' : 'Digital Session'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {isLive && (
                        <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100 animate-pulse">
                            Live
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 border border-slate-100/50 p-5 rounded-[1.8rem] flex items-center justify-around mb-6">
                    <div className="flex flex-col items-center">
                        <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>Scheduled</span>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "16px", color: "#1e293b" }}>
                            {isToday(apt.date) ? 'Today' : isTomorrow(apt.date) ? 'Tomorrow' : new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex flex-col items-center">
                        <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>At</span>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "16px", color: "#1e293b" }}>{apt.time}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    {apt.status === 'completed' ? (
                        <div className="flex-1 py-4 bg-slate-50 text-slate-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-[10px] tracking-[2px] border border-slate-100 uppercase">
                             <span className="text-sm">🏁</span> Session Ended
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onJoin(); }}
                                disabled={isJoining}
                                className={`flex-[2] py-4 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-[10px] tracking-widest ${
                                    isLive ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : isUrgent ? 'bg-rose-600 shadow-rose-100 hover:bg-rose-700' : 'bg-[#0f172a] shadow-slate-200 hover:bg-slate-900'
                                } ${isJoining ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {isJoining ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="text-base">📹</span>
                                        {isLive ? 'JOIN LIVE CALL' : 'JOIN SESSION'}
                                    </>
                                )}
                            </button>
                            {!isLive && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onCancel(); }}
                                    className="flex-1 py-4 bg-rose-50 text-rose-500 font-black rounded-2xl hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-[10px] tracking-widest border border-rose-100"
                                >
                                    <span className="text-base font-normal">🗑️</span>
                                    CANCEL
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PsychiatristDashboard;
