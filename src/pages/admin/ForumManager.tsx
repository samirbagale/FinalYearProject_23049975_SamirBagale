import { useState, useEffect } from 'react';
import { 
  Trash2, 
  Flag, 
  CheckCircle2, 
  MessageCircle, 
  AlertCircle,
  ShieldAlert,
  Search,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export default function ForumManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState('posts');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchReports();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/api/forum/posts?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (e) { console.error(e); }
  };

  const deletePost = async (id: string) => {
    if (!window.confirm('Delete this forum post completely?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/forum/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPosts();
    } catch (e) { console.error(e); }
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/forum/comments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Comment deleted successfully.');
        fetchReports();
      }
    } catch (e) { console.error(e); }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.content.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forum Governance</h1>
          <p className="text-sm text-slate-500 font-medium">Review and moderate community discussions anonymously.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button 
            onClick={() => setActiveSubTab('posts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'posts' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <MessageSquare className="w-4 h-4" /> System Feed
          </button>
          <button 
            onClick={() => setActiveSubTab('reports')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'reports' ? 'bg-rose-50 text-rose-600 shadow-lg shadow-rose-100' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
          >
            <Flag className="w-4 h-4" /> Reported Items
            {reports.length > 0 && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-black">{reports.length}</span>}
          </button>
        </div>
      </div>

      {activeSubTab === 'posts' && (
        <div className="space-y-6">
           <div className="relative group max-w-xl">
              <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 group-focus-within:text-primary-600 transition-colors pointer-events-none">
                 <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for posts or users..." className="w-full bg-white border border-slate-200 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary-50/50 focus:border-primary-100 transition-all shadow-sm" />
           </div>

           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <tr>
                      <th className="px-8 py-5">Post Content</th>
                      <th className="px-8 py-5">Author</th>
                      <th className="px-8 py-5">Interaction</th>
                      <th className="px-8 py-5 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {filteredPosts.map((post) => (
                      <tr key={post._id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 max-w-md">
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100/50">{post.topic}</span>
                                {post.isAnonymous && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100/50">Anonymous</span>}
                             </div>
                             <h4 className="text-slate-900 font-black tracking-tight truncate leading-tight">{post.title}</h4>
                             <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{post.content}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[11px] border border-white shadow-sm">
                              {post.user?.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <span className="text-slate-800">{post.isAnonymous ? 'Internal User' : post.user?.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-6 text-slate-400 text-[11px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2 group-hover:text-rose-500 transition-colors"><TrendingUp className="w-3.5 h-3.5" /> {post.likesCount}</span>
                            <span className="flex items-center gap-2 group-hover:text-primary-600 transition-colors"><MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => deletePost(post._id)} className="p-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-all shadow-sm">
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPosts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-24 text-center">
                           <div className="flex flex-col items-center opacity-30 select-none">
                              <Search className="w-12 h-12 mb-4" />
                              <p className="text-xs font-black uppercase tracking-widest">No matching results deployed.</p>
                           </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reports.length === 0 ? (
            <div className="col-span-full h-80 flex flex-col items-center justify-center text-center p-12 bg-emerald-50 rounded-[32px] border-2 border-dashed border-emerald-100/50 animate-pulse font-sans">
              <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-4" />
              <h3 className="text-lg font-black text-emerald-800 uppercase tracking-widest">Pure Environment</h3>
              <p className="text-sm text-emerald-600 font-medium">No active content violations found.</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report._id} className="group bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <AlertCircle className="w-24 h-24 -mr-8 -mt-8" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full">
                       <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                       <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{report.reason}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Reported by: {report.reporter?.username || 'G'}</span>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-4">
                      {report.post ? `Flagged Post: ${report.post.title}` : `Violation in Comment`}
                    </h4>
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-2 italic text-sm text-slate-500 leading-relaxed font-medium">
                       <span className="text-[9px] font-black uppercase text-slate-300 non-italic flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Flagged Content</span>
                       "{report.post ? report.post.content : report.comment?.content}"
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex items-center gap-3 relative z-10 transition-all group-hover:translate-y-0 translate-y-2 opacity-90 group-hover:opacity-100">
                   <button 
                    onClick={() => report.post ? deletePost(report.post._id) : deleteComment(report.comment?._id)} 
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Erase Content
                  </button>
                   <button className="flex-1 bg-slate-900 hover:bg-black text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
         </div>
      )}
    </div>
  );
}
