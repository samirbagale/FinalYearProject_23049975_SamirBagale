import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  CreditCard, 
  FileText, 
  Settings, 
  MessageSquare, 
  MessagesSquare,
  Mail,
  LogOut, 
  Menu, 
  X, 
  TrendingUp, 
  Plus,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import ChatroomManager from './ChatroomManager';
import ForumManager from './ForumManager';
import { gratitudeService } from '@/services/gratitudeService';
import { Heart } from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user: currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [videoRooms, setVideoRooms] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [editingPsychiatrist, setEditingPsychiatrist] = useState<any>(null);
  const [isCreatingPsychiatrist, setIsCreatingPsychiatrist] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Stats
        const statsRes = await fetch('http://127.0.0.1:5000/api/admin/stats', { headers });
        const statsData = await statsRes.json();

        // Users
        const usersRes = await fetch('http://127.0.0.1:5000/api/admin/users', { headers });
        const usersData = await usersRes.json();

        // Messages
        const msgsRes = await fetch('http://127.0.0.1:5000/api/contact', { headers });
        const msgsData = await msgsRes.json();

        // Transactions
        const transRes = await fetch('http://127.0.0.1:5000/api/admin/transactions', { headers });
        const transData = await transRes.json();

        if (statsData.success) setStats(statsData.data);
        if (usersData.success) setUsers(usersData.data);
        if (msgsData.success) setMessages(msgsData.data);
        if (transData.success) setTransactions(transData.data);
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const socket = io('http://127.0.0.1:5000');
    socket.on('connect', () => socket.emit('video-get-rooms'));
    socket.on('video-rooms-update', (rooms) => setVideoRooms(rooms));

    return () => { socket.disconnect(); };
  }, []);

  const deleteMessage = async (msgId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/contact/${msgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(messages.filter(m => m._id !== msgId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const toggleRestrict = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}/restrict`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isRestricted: !currentStatus } : u));
      }
    } catch (error) {
      console.error("Error toggling restriction:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const fetchGratitude = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await gratitudeService.getAllEntries(token);
      if (data.success) {
        setGratitudeEntries(data.data);
      }
    } catch (error) {
      console.error("Failed to load gratitude logs", error);
    }
  };

  const deleteGratitude = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this recovery journal entry?")) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await gratitudeService.deleteEntry(token, id);
      if (data.success) {
        setGratitudeEntries(gratitudeEntries.filter(e => e._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete gratitude entry", error);
    }
  };

  useEffect(() => {
    if (selectedTab === 'gratitude') {
      fetchGratitude();
    }
  }, [selectedTab]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading System Data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-200">M</div>
              <span className="text-lg font-bold tracking-tight text-slate-800">MindCare</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarItem 
              active={selectedTab === 'dashboard'} 
              onClick={() => setSelectedTab('dashboard')} 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              active={selectedTab === 'users'} 
              onClick={() => setSelectedTab('users')} 
              icon={<Users className="w-5 h-5" />} 
              label="Users" 
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              active={selectedTab === 'psychiatrists'} 
              onClick={() => setSelectedTab('psychiatrists')} 
              icon={<Stethoscope className="w-5 h-5" />} 
              label="Doctors" 
              collapsed={!isSidebarOpen}
            />
             <SidebarItem 
              active={selectedTab === 'chatrooms'} 
              onClick={() => setSelectedTab('chatrooms')} 
              icon={<MessagesSquare className="w-5 h-5" />} 
              label="Communities" 
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              active={selectedTab === 'forums'} 
              onClick={() => setSelectedTab('forums')} 
              icon={<MessageSquare className="w-5 h-5" />} 
              label="Forums" 
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              active={selectedTab === 'transactions'} 
              onClick={() => setSelectedTab('transactions')} 
              icon={<CreditCard className="w-5 h-5" />} 
              label="Payments" 
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              active={selectedTab === 'messages'} 
              onClick={() => setSelectedTab('messages')} 
              icon={<Mail className="w-5 h-5" />} 
              label="Inquiries" 
              badge={messages.length}
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              active={selectedTab === 'gratitude'} 
              onClick={() => setSelectedTab('gratitude')} 
              icon={<Heart className="w-5 h-5" />} 
              label="Gratitude Logs" 
              collapsed={!isSidebarOpen}
            />
          </nav>

          {/* Footer Nav */}
          <div className="p-4 border-t border-slate-100 space-y-1">
            <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm group ${!isSidebarOpen && 'lg:justify-center'}`}>
              <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${!isSidebarOpen && 'lg:m-0'}`} />
              <span className={`${!isSidebarOpen && 'lg:hidden'}`}>Main App</span>
            </Link>
            <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-medium text-sm ${!isSidebarOpen && 'lg:justify-center'}`}>
              <LogOut className={`w-4 h-4 ${!isSidebarOpen && 'lg:m-0'}`} />
              <span className={`${!isSidebarOpen && 'lg:hidden'}`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-500">
                <Menu className="w-5 h-5" />
             </button>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                   <div className="text-sm font-bold text-slate-900 leading-none">{currentUser?.username || 'Admin'}</div>
                   <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Super Admin</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold shadow-sm">
                   {currentUser?.username?.charAt(0).toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* TABS CONTENT */}
            {selectedTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-sm text-slate-500 font-medium">Real-time statistics for mindful health platform.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live System Monitor
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Users" value={stats?.users || 0} icon={<Users />} trend="+12.5%" trendUp />
                  <StatCard label="Total Doctors" value={users.filter(u => u.role === 'psychiatrist').length} icon={<Stethoscope />} trend="+2" trendUp />
                  <StatCard label="Inquiries" value={messages.length} icon={<MessageSquare />} trend="3 pending" />
                  <StatCard label="Revenue" value={`Rs. ${transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}`} icon={<CreditCard />} trend="+8.2%" trendUp />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity / New Users Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                      <h3 className="font-bold text-slate-800">New Community Members</h3>
                      <button onClick={() => setSelectedTab('users')} className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest px-3 py-1 bg-primary-50 rounded-lg">View All</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <Table users={users.slice(0, 5)} simplified />
                    </div>
                  </div>

                  {/* Ongoing Video Sessions */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">Ongoing Sessions</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 px-2 py-1 bg-rose-50 rounded-lg">{videoRooms.length} Live</span>
                     </div>
                     <div className="space-y-4 flex-1">
                        {videoRooms.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                              <TrendingUp className="w-8 h-8 text-slate-200 mb-3" />
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active consultations</p>
                           </div>
                        ) : (
                           videoRooms.map((roomData, i) => {
                              const roomId = roomData[0];
                              const roomInfo = roomData[1];
                              return (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-100 bg-slate-50/50 transition-all">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase">{roomId ? roomId.charAt(0) : 'V'}</div>
                                      <div>
                                         <div className="text-sm font-bold text-slate-800">Session ID: {roomId}</div>
                                         <div className="text-[10px] font-bold text-slate-400 capitalize">{roomInfo?.users?.length || 0} participants active</div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live</span>
                                   </div>
                                </div>
                              );
                           })
                        )}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-sm text-slate-500 font-medium">Browse and manage platform member access.</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <Table users={users} onRestrict={toggleRestrict} onDelete={deleteUser} />
                </div>
              </div>
            )}

            {selectedTab === 'psychiatrists' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {editingPsychiatrist || isCreatingPsychiatrist ? (
                  <PsychiatristForm 
                    initialData={editingPsychiatrist} 
                    isNew={isCreatingPsychiatrist} 
                    onCancel={() => { setEditingPsychiatrist(null); setIsCreatingPsychiatrist(false); }}
                    onSave={async (allData: any) => {
                      const { localFile, ...updatedData } = allData;
                      try {
                        const token = localStorage.getItem('token');
                        const method = isCreatingPsychiatrist ? 'POST' : 'PUT';
                        const url = isCreatingPsychiatrist 
                          ? `http://127.0.0.1:5000/api/admin/psychiatrists`
                          : `http://127.0.0.1:5000/api/admin/psychiatrists/${editingPsychiatrist._id}`;

                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify(updatedData)
                        });
                        const data = await res.json();
                        if (data.success) {
                          let finalPsychiatrist = data.data;

                          if (localFile) {
                            const targetId = isCreatingPsychiatrist ? data.data._id : editingPsychiatrist._id;
                            const photoData = new FormData();
                            photoData.append('photo', localFile);
                            
                            const photoRes = await fetch(`http://127.0.0.1:5000/api/admin/psychiatrists/${targetId}/photo`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` },
                              body: photoData
                            });
                            const photoResult = await photoRes.json();
                            if (photoResult.photoUrl) {
                              finalPsychiatrist = { ...finalPsychiatrist, profilePhoto: photoResult.photoUrl };
                            }
                          }

                          if (isCreatingPsychiatrist) {
                            setUsers([finalPsychiatrist, ...users]);
                          } else {
                            setUsers(users.map(u => u._id === editingPsychiatrist._id ? finalPsychiatrist : u));
                          }
                          setEditingPsychiatrist(null);
                          setIsCreatingPsychiatrist(false);
                        }
                      } catch (error) {
                        console.error("Error saving psychiatrist:", error);
                      }
                    }}
                  />
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Specialist Doctors</h1>
                        <p className="text-sm text-slate-500 font-medium">Mange your professional network of psychologists and psychiatrists.</p>
                      </div>
                      <button 
                        onClick={() => setIsCreatingPsychiatrist(true)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4" /> Add Specialist
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {users.filter(u => u.role === 'psychiatrist').map(doc => (
                        <div key={doc._id} className="group bg-white rounded-2xl border border-slate-200 p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 flex flex-col shadow-sm">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm shrink-0">
                                 {doc.profilePhoto ? (
                                    <img src={doc.profilePhoto} alt={doc.username} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full bg-primary-50 flex items-center justify-center font-bold text-primary-600 text-lg">
                                       {doc.username?.charAt(0)}
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h3 className="font-bold text-slate-900 truncate">{doc.username}</h3>
                                 <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">{doc.credentials || 'S'}</p>
                              </div>
                           </div>

                           <div className="space-y-2 mb-6 flex-1">
                              <div className="flex items-center justify-between text-xs font-medium">
                                 <span className="text-slate-400 uppercase tracking-wider">Experience</span>
                                 <span className="text-slate-700 font-bold">{doc.experience || 0} Years</span>
                              </div>
                              <div className="flex items-center justify-between text-xs font-medium">
                                 <span className="text-slate-400 uppercase tracking-wider">Contact</span>
                                 <span className="text-slate-700 font-bold truncate ml-2">{doc.email}</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingPsychiatrist(doc)}
                                className="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                              >
                                Edit Profile
                              </button>
                              <button 
                                onClick={() => deleteUser(doc._id)}
                                className="p-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedTab === 'transactions' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                   <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Logs</h1>
                   <p className="text-sm text-slate-500 font-medium tracking-tight">Registry of all consultation fees and platform charges.</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                          <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium">
                          {transactions.map(tx => (
                            <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px] shrink-0 border border-white shadow-sm">{tx.user?.username?.charAt(0).toUpperCase()}</div>
                                     <div className="truncate max-w-[120px]">{tx.user?.username || 'Guest'}</div>
                                  </div>
                               </td>
                               <td className="px-6 py-4 font-mono text-[11px] text-slate-400">#{tx.refId?.slice(-8).toUpperCase() || tx._id?.slice(-8).toUpperCase()}</td>
                               <td className="px-6 py-4 capitalize text-slate-500">{tx.gateway || 'Wallet'}</td>
                               <td className="px-6 py-4 font-bold text-slate-900">Rs. {tx.amount}</td>
                               <td className="px-6 py-4 text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                               <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
                                     <CheckCircle2 className="w-3 h-3" /> Completed
                                  </span>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {selectedTab === 'messages' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div>
                   <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Inquiries</h1>
                   <p className="text-sm text-slate-500 font-medium">General questions and contact requests from the landing page.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {messages.map(msg => (
                     <div key={msg._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-lg transition-all relative group shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 border border-slate-100">{msg.name?.charAt(0)}</div>
                              <div>
                                 <h4 className="font-bold text-slate-800 leading-tight">{msg.name}</h4>
                                 <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5">{msg.email}</p>
                              </div>
                           </div>
                           <button onClick={() => deleteMessage(msg._id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">{msg.subject || 'Patient Inquiries'}</div>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium">{msg.message}</p>
                        </div>
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Received {new Date(msg.createdAt).toLocaleDateString()}</div>
                     </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'gratitude' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recovery Journals</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitoring emotional journaling for patient safety and oversight.</p>
                  </div>
                  <div className="text-[10px] font-black bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-400 uppercase tracking-widest">
                    {gratitudeEntries.length} Total Entries
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {gratitudeEntries.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-slate-200" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">No journal entries yet</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Users haven't started recording their recovery gratitude logs yet.</p>
                    </div>
                  ) : (
                    gratitudeEntries.map(entry => (
                      <div key={entry._id} className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                         
                         <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            {/* User Sidebar */}
                            <div className="md:w-64 shrink-0 space-y-4 border-r border-slate-100 pr-8">
                               <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Journal By</span>
                                  <div className="flex items-baseline gap-2 mt-1">
                                     <h4 className="font-extrabold text-slate-900 truncate text-lg">{entry.user?.username || 'Guest User'}</h4>
                                     <span className="text-[8px] font-black bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">{entry.user?.role || 'user'}</span>
                                  </div>
                               </div>
                               <div className="pt-2 space-y-3">
                                  <div className="flex flex-col gap-1">
                                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Recorded On</span>
                                     <span className="text-xs font-bold text-slate-600">{new Date(entry.createdAt).toLocaleString()}</span>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => deleteGratitude(entry._id)}
                                 className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                               >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Entry
                               </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                               <div className="space-y-2">
                                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Significant Win</div>
                                  <p className="text-sm font-bold text-slate-800 leading-relaxed bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100/50 min-h-[100px]">{entry.q1}</p>
                               </div>
                               <div className="space-y-2">
                                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Support System</div>
                                  <p className="text-sm font-bold text-slate-800 leading-relaxed bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 min-h-[100px]">{entry.q2}</p>
                               </div>
                               <div className="space-y-2">
                                  <div className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em] mb-1">Self-Appreciation</div>
                                  <p className="text-sm font-bold text-slate-800 leading-relaxed bg-violet-50/30 p-5 rounded-2xl border border-violet-100/50 min-h-[100px]">{entry.q3}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}


            {/* CUSTOM COMPONENTS (External) */}
            {selectedTab === 'chatrooms' && <ChatroomManager />}
            {selectedTab === 'forums' && <ForumManager />}

          </div>
        </main>
      </div>

    </div>
  );
};

/* --- SHARED COMPONENTS --- */

const SidebarItem = ({ active, onClick, icon, label, badge, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${
      active 
      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
      : 'text-slate-500 hover:bg-slate-50'
    } ${collapsed && 'lg:justify-center lg:px-0 lg:w-12 lg:mx-auto'}`}
    title={collapsed ? label : ''}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
    <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'lg:hidden w-0' : 'w-auto'}`}>
      {label}
    </span>
    {badge !== undefined && badge > 0 && !collapsed && (
      <span className="ml-auto bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center">{badge}</span>
    )}
    {active && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full" />}
  </button>
);

const StatCard = ({ label, value, icon, trend, trendUp }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-100">{icon}</div>
      {trend && (
         <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${trendUp ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {trend}
         </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
    </div>
  </div>
);

const Table = ({ users, simplified, onRestrict, onDelete }: any) => (
  <table className="w-full text-left">
    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
      <tr>
        <th className="px-6 py-4">User</th>
        <th className="px-6 py-4">Role</th>
        <th className={`px-6 py-4 ${simplified ? 'hidden sm:table-cell' : ''}`}>Registered</th>
        <th className={`px-6 py-4 ${simplified ? 'hidden md:table-cell' : ''}`}>Status</th>
        {!simplified && <th className="px-6 py-4 text-right">Actions</th>}
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-sm font-medium">
      {users.map((user: any) => (
        <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-600 font-bold shrink-0">{user.username.charAt(0).toUpperCase()}</div>
              <div>
                <div className="text-slate-900 leading-none">{user.username}</div>
                <div className="text-[10px] text-slate-400 mt-1">{user.email}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 uppercase text-[10px] tracking-widest text-slate-500">{user.role}</td>
          <td className={`px-6 py-4 text-xs text-slate-400 ${simplified ? 'hidden sm:table-cell' : ''}`}>{new Date(user.createdAt).toLocaleDateString()}</td>
          <td className={`px-6 py-4 ${simplified ? 'hidden md:table-cell' : ''}`}>
            <div className="flex items-center gap-1.5">
               <span className={`w-1.5 h-1.5 rounded-full ${user.isRestricted ? 'bg-rose-500' : 'bg-emerald-500'}`} />
               <span className={user.isRestricted ? 'text-rose-600' : 'text-emerald-600'}>{user.isRestricted ? 'Restricted' : 'Verified'}</span>
            </div>
          </td>
          {!simplified && (
            <td className="px-6 py-4 text-right">
              {user.role !== 'admin' && (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => onRestrict(user._id, user.isRestricted)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title={user.isRestricted ? 'Unrestrict' : 'Restrict'}>
                     <ShieldCheck className={`w-4 h-4 ${user.isRestricted ? 'text-rose-500' : ''}`} />
                  </button>
                  <button onClick={() => onDelete(user._id)} className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500" title="Delete">
                     <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

const PsychiatristForm = ({ initialData, isNew, onCancel, onSave }: any) => {
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    credentials: initialData?.credentials || '',
    experience: initialData?.experience || 0,
    bio: initialData?.bio || '',
    profilePhoto: initialData?.profilePhoto || '',
    password: '',
  });
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-xl space-y-8 animate-in zoom-in-95 duration-300 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
         <div>
            <h2 className="text-2xl font-black text-slate-900">{isNew ? 'Register New Doctor' : 'Update Doctor Profile'}</h2>
            <p className="text-sm text-slate-400 font-medium">Please ensure all medical credentials are verified.</p>
         </div>
         <button onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-4">
            <FormInput label="Full Name" value={formData.username} onChange={v => setFormData({...formData, username: v})} placeholder="Dr. Samir" />
            <FormInput label="Internal Email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="samir@mindcare.com" />
            <FormInput label="Credentials" value={formData.credentials} onChange={v => setFormData({...formData, credentials: v})} placeholder="MD, PhD (Psychology)" />
            <FormInput 
              label={isNew ? "Account Password" : "Reset Password (Optional)"} 
              type="password" 
              value={formData.password} 
              onChange={v => setFormData({...formData, password: v})} 
              placeholder={isNew ? "••••••••" : "Leave blank to keep current"} 
            />
         </div>
         <div className="space-y-4">
            <FormInput label="Experience (Years)" type="number" value={formData.experience} onChange={v => setFormData({...formData, experience: parseInt(v) || 0})} placeholder="8" />
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Profile Photo</label>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                     {pendingFile ? <img src={URL.createObjectURL(pendingFile)} className="w-full h-full object-cover" /> : formData.profilePhoto ? <img src={formData.profilePhoto} className="w-full h-full object-cover" /> : <Plus className="w-6 h-6 text-slate-300" />}
                  </div>
                  <input type="file" onChange={e => setPendingFile(e.target.files?.[0] || null)} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Bio</label>
               <textarea rows={4} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all resize-none" />
            </div>
         </div>
      </div>

      <div className="pt-6 flex justify-end gap-3">
         <button onClick={onCancel} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
         <button onClick={() => onSave({...formData, localFile: pendingFile})} className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 transition-all active:scale-[0.98]">
            {isNew ? 'Save Specialist' : 'Finalize Changes'}
         </button>
      </div>
    </div>
  );
};

const FormInput = ({ label, value, onChange, placeholder, type = "text" }: { label: string, value: any, onChange: (v: any) => void, placeholder: string, type?: string }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 font-sans">{label}</label>
      <div className="relative">
        <input 
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all" 
          placeholder={placeholder} 
        />
        {isPassword && (
          <button 
            type="button" 
            onClick={() => setShow(!show)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-primary-600 transition-colors bg-white/50 backdrop-blur-sm rounded-lg"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
