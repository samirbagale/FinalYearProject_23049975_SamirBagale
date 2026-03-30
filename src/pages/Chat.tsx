import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, AlertTriangle, Loader2, Copy, Check, Sparkles, RefreshCcw, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id?: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    // Only scroll to bottom when messages are added, but be smart about initial load
    if (messages.length > 0) {
      if (isInitialLoad.current) {
        // Smaller delay to ensure layout is settled
        const timer = setTimeout(() => {
          scrollToBottom('auto');
          isInitialLoad.current = false;
        }, 100);
        return () => clearTimeout(timer);
      } else {
        scrollToBottom('smooth');
      }
    }
  }, [messages]);

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://127.0.0.1:5000/api/chat/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, []);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setError(null);

    // Optimistic Update
    const tempMsg: Message = { sender: 'user', message: userMsg };
    setMessages(prev => [...prev, tempMsg]);

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to chat.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setMessages(prev => [...prev, { sender: 'ai', message: data.reply }]);

    } catch (err: any) {
      console.error(err);
      setError('Connection issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-96px)] bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex flex-col items-center p-2 sm:p-4 overflow-hidden">
      <style>{`
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .message-animate {
          animation: messageIn 0.3s ease-out forwards;
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Main Container */}
      <div className="w-full max-w-5xl h-full flex flex-col bg-white/40 backdrop-blur-sm rounded-[24px] sm:rounded-[32px] border border-white/50 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="glass-header px-6 py-4 flex items-center justify-between border-b border-gray-100 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-2 ring-white">
                <Bot size={26} strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Mind Care AI</h1>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-indigo-100">Plus</span>
              </div>
              <p className="text-xs font-semibold text-gray-500">Always here to support your journey</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/emergency"
              className="hidden sm:flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <AlertTriangle size={18} />
              Emergency Help
            </Link>
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 fade-in">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center shadow-inner border border-white">
                  <span className="text-5xl animate-bounce">👋</span>
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-gray-50">
                   <Sparkles className="text-indigo-500" size={20} />
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-black text-gray-900">How can I help you today?</h2>
                <p className="text-gray-500 font-medium leading-relaxed px-4">
                  I'm your Mind Care assistant. I can help with anxiety, stress, or just talk about your day.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-4 px-4">
                {["I'm feeling stressed", "Need a breathing exercise", "Just want to vent"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); }}
                    className="px-5 py-2.5 bg-white text-gray-700 font-bold text-sm rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={idx}
                className={`flex items-start gap-4 max-w-[90%] sm:max-w-[80%] ${!isAI ? 'ml-auto flex-row-reverse' : ''} message-animate`}
              >
                {/* Avatar */}
                <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:rotate-12
                  ${!isAI ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 mt-1' : 'bg-gradient-to-br from-teal-500 to-emerald-600 mt-1'}`}
                >
                  {!isAI ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                </div>

                <div className={`flex flex-col ${!isAI ? 'items-end' : 'items-start'} min-w-0`}>
                  <div className={`relative group`}>
                    <div
                      className={`px-5 py-4 rounded-[24px] shadow-sm text-[15px] leading-relaxed relative overflow-hidden transition-all hover:shadow-md
                        ${!isAI 
                          ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none ring-1 ring-black/5'
                        }`}
                    >
                      {msg.message.includes('[BOOK_PSYCHIATRIST]') ? (
                        <div className="space-y-4">
                          <p className="font-medium">{msg.message.replace('[BOOK_PSYCHIATRIST]', '')}</p>
                          <Link
                            to="/premium"
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/30 transition-all shadow-lg active:scale-95 w-full justify-center sm:w-auto"
                          >
                            📅 Book Specialist Session
                          </Link>
                        </div>
                      ) : (
                        <p className="font-medium whitespace-pre-wrap">{msg.message}</p>
                      )}
                      
                      {/* Sub-actions on Hover */}
                      <div className={`absolute -top-2 ${!isAI ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1`}>
                         <button 
                            onClick={() => handleCopy(msg.message, idx)}
                            className="bg-white shadow-xl border border-gray-100 p-2 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
                          >
                            {copiedId === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                         </button>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2 px-1 tracking-tight">
                    {msg.sender === 'ai' ? 'MIND CARE AI' : 'YOU'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-4 message-animate">
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md animate-pulse">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-white py-4 px-6 rounded-[24px] rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-3 ring-1 ring-black/5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs font-bold text-gray-400 tracking-wider">AI IS THINKING</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center p-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm animate-shake">
                <AlertTriangle size={18} />
                <span className="text-sm font-bold uppercase tracking-wide">{error}</span>
                <button onClick={() => window.location.reload()} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* No spacer needed with direct scroll control */}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-8 shrink-0 relative bg-white/60 backdrop-blur-md border-t border-gray-100">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end gap-3">
            <div className="relative flex-1 group">
              <textarea
                rows={1}
                value={input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share what's on your mind..."
                className="w-full bg-white border-2 border-gray-100 rounded-[24px] px-6 py-4 pr-16 text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none leading-relaxed font-semibold shadow-inner min-h-[58px] max-h-32 resize-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 bottom-2 p-3 rounded-2xl transition-all shadow-lg active:scale-90
                  ${!input.trim() || isLoading 
                    ? 'bg-gray-100 text-gray-300' 
                    : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white hover:shadow-indigo-500/40 hover:-translate-y-0.5'}`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>
          <div className="flex justify-center mt-4">
             <p className="text-[10px] font-bold text-gray-400 tracking-[1.5px] uppercase">
                Secure & Confidential Assistant
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
