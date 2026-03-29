import { useState, useEffect, useMemo } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { moodService } from '@/services/moodService';

// --- Type Definitions ---
type MoodType = 'euphoric' | 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious' | 'angry' | 'tired';

interface MoodEntry {
  id: string;
  mood: MoodType;
  intensity: number;
  activityTags: string[];
  notes: string;
  timestamp: string | Date;
}

// --- Configuration & Theme ---
const MOOD_CONFIG: Record<MoodType, {
  label: string; emoji: string; color: string; 
  text: string; bg: string; border: string; 
  gradStart: string; gradEnd: string; glow: string;
}> = {
  euphoric: { label: 'Euphoric', emoji: '🤩', color: '#d97706', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', gradStart: 'from-amber-400', gradEnd: 'to-amber-500', glow: 'shadow-amber-200/50' },
  happy: { label: 'Happy', emoji: '😊', color: '#059669', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', gradStart: 'from-emerald-400', gradEnd: 'to-emerald-500', glow: 'shadow-emerald-200/50' },
  calm: { label: 'Calm', emoji: '😌', color: '#0891b2', text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', gradStart: 'from-cyan-400', gradEnd: 'to-cyan-500', glow: 'shadow-cyan-200/50' },
  neutral: { label: 'Neutral', emoji: '😐', color: '#7c3aed', text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', gradStart: 'from-violet-400', gradEnd: 'to-violet-500', glow: 'shadow-violet-200/50' },
  sad: { label: 'Sad', emoji: '😢', color: '#2563eb', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', gradStart: 'from-blue-400', gradEnd: 'to-blue-500', glow: 'shadow-blue-200/50' },
  anxious: { label: 'Anxious', emoji: '😰', color: '#db2777', text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', gradStart: 'from-pink-400', gradEnd: 'to-pink-500', glow: 'shadow-pink-200/50' },
  angry: { label: 'Angry', emoji: '😡', color: '#dc2626', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', gradStart: 'from-red-400', gradEnd: 'to-red-500', glow: 'shadow-red-200/50' },
  tired: { label: 'Tired', emoji: '😴', color: '#64748b', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', gradStart: 'from-slate-400', gradEnd: 'to-slate-500', glow: 'shadow-slate-200/50' },
};

const ACTIVITIES = [
  { icon: '💼', label: 'Work' }, { icon: '📚', label: 'Study' }, { icon: '👨‍👩‍👧', label: 'Family' },
  { icon: '👥', label: 'Friends' }, { icon: '🏃', label: 'Exercise' }, { icon: '💤', label: 'Sleep' },
  { icon: '🍽️', label: 'Eat' }, { icon: '🧘', label: 'Relax' }, { icon: '✈️', label: 'Travel' },
  { icon: '🎵', label: 'Music' }, { icon: '🎮', label: 'Gaming' }, { icon: '📖', label: 'Reading' },
  { icon: '🧎', label: 'Meditation' }, { icon: '🎨', label: 'Hobbies' }, { icon: '❤️', label: 'Date' },
  { icon: '🧹', label: 'Chores' }
];

// --- Seed Data ---
const getSeedData = (): MoodEntry[] => {
  const seeds: MoodEntry[] = [];
  const baseDate = new Date();
  const sampleMoods: MoodType[] = ['happy', 'calm', 'neutral', 'euphoric', 'tired', 'happy', 'calm'];
  const sampleIntensities = [4, 3, 3, 5, 2, 4, 3];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    seeds.push({
      id: `seed-${i}`,
      mood: sampleMoods[i],
      intensity: sampleIntensities[i],
      activityTags: i % 2 === 0 ? ['Work', 'Coffee'] : ['Relax', 'Music'],
      notes: i === 0 ? "Feeling pretty good today!" : "Just another normal day.",
      timestamp: d.toISOString()
    });
  }
  return seeds;
};

export default function MoodTracking() {
  // --- State ---
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'analytics'>('log');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Load initial data
  useEffect(() => {
    const fetchMoods = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await moodService.getMoods(token);
          if (data && data.length > 0) {
            // Map backend 'stress' string to our frontend 'stressed/anxious'
            const mappedData = data.map((d: any) => ({
              ...d,
              mood: (d.mood === 'stress' ? 'anxious' : d.mood) as MoodType
            }));
            setHistory(mappedData);
          } else {
             setHistory(getSeedData());
          }
        } catch (err) {
          console.error('Failed to fetch from backend, using seed data.', err);
          setHistory(getSeedData()); // fallback
        }
      } else {
        setHistory(getSeedData());
      }
    };
    fetchMoods();
  }, []);

  // --- Handlers ---
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    setIsSaving(true);
    
    // Fake 1s delay as requested for animation effect
    await new Promise(r => setTimeout(r, 1000));
    
    const newEntry: MoodEntry = {
      id: `local-${Date.now()}`,
      mood: selectedMood,
      intensity,
      activityTags: selectedTags,
      notes,
      timestamp: new Date(selectedDate).toISOString()
    };
    
    // Try save to backend
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const saved = await moodService.createMood(token, newEntry as any);
        newEntry.id = saved.id || (saved as any)._id || newEntry.id;
      } catch (err) {
        console.error("Backend save failed, saved locally.");
      }
    }
    
    setHistory(prev => [newEntry, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    
    setIsSaving(false);
    setIsSaved(true);
    
    setTimeout(() => {
      setIsSaved(false);
      setSelectedMood(null);
      setIntensity(3);
      setSelectedTags([]);
      setNotes('');
    }, 2000);
  };

  // --- Analytics Computed Data ---
  const stats = useMemo(() => {
    if (!history.length) return { positivity: 0, avgIntensity: 0, count: 0, streak: 0, mostFrequent: 'None' };
    
    let posCount = 0;
    let intSum = 0;
    const moodCounts: Record<string, number> = {};
    
    history.forEach(e => {
      if (['happy', 'euphoric', 'calm'].includes(e.mood)) posCount++;
      intSum += e.intensity;
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });
    
    const mostFreq = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
    
    return {
      positivity: Math.round((posCount / history.length) * 100),
      avgIntensity: (intSum / history.length).toFixed(1),
      count: history.length,
      streak: 7, // Hardcoded visual for design spec
      mostFrequent: MOOD_CONFIG[mostFreq as MoodType]?.label || 'Neutral'
    };
  }, [history]);

  // Derived styling for the entire form based on current selected mood
  const activeStyle = selectedMood ? MOOD_CONFIG[selectedMood] : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-violet-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-9 py-10 grid lg:grid-cols-2 gap-8 items-start">
        
        {/* ================= LEFT COLUMN / LOGGING FORM ================= */}
        <div className="space-y-6">
          
          {/* 1. Header Row */}
          <div className="flex justify-between items-end animate-fade-up" style={{animationDelay: '0ms'}}>
            <div>
              <h1 className="text-4xl lg:text-[42px] font-black font-heading text-slate-900 tracking-tight leading-[1.1]">
                How are you<br />feeling today?
              </h1>
              <p className="mt-2 text-slate-400 font-medium">Track your emotional patterns and grow.</p>
            </div>
            
            <div className="bg-white border-1.5 border-amber-200 rounded-[24px] p-4 text-center shadow-sm w-24">
              <div className="text-xl mb-1">🔥</div>
              <div className="text-3xl font-black font-heading text-amber-500 leading-none">{stats.streak}</div>
              <div className="text-[8px] font-extrabold text-amber-600/60 uppercase tracking-widest mt-1">Day Streak</div>
            </div>
          </div>

          {/* 2. Mood Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-fade-up" style={{animationDelay: '50ms'}}>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">Select Your Mood</label>
            <div className="grid grid-cols-4 gap-2.5">
              {(Object.keys(MOOD_CONFIG) as MoodType[]).map((mood) => {
                const conf = MOOD_CONFIG[mood];
                const isSelected = selectedMood === mood;
                
                return (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`
                      relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all duration-300 ease-spring
                      ${isSelected 
                        ? `${conf.border} ${conf.bg} ${conf.glow} -translate-y-1 scale-104 shadow-md` 
                        : `border-slate-100 bg-white hover:-translate-y-1.5 hover:scale-105 hover:shadow-lg hover:border-slate-200 text-slate-400`}
                    `}
                  >
                    <span className={`text-[32px] transform transition-transform ${isSelected ? 'animate-bounce' : ''}`}>
                      {conf.emoji}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isSelected ? conf.text : 'text-slate-500'}`}>
                      {conf.label}
                    </span>
                    
                    {isSelected && (
                      <div className={`absolute top-2 right-2 w-4 h-4 rounded-full ${conf.text.replace('text', 'bg')} text-white flex items-center justify-center shadow-sm animate-in zoom-in-50`}>
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Intensity Slider */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-fade-up" style={{animationDelay: '100ms'}}>
             <div className="flex justify-between items-center mb-4">
               <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Intensity Level</label>
               <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center font-black ${activeStyle ? activeStyle.text + ' ' + activeStyle.border : 'text-slate-500 border-slate-200'}`}>
                 {intensity}
               </div>
             </div>
             
             <div className="relative pt-2 pb-1">
                <input 
                  type="range" min="1" max="5" step="1"
                  value={intensity} onChange={e => setIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:shadow-md transition-all ease-spring"
                  style={activeStyle ? {
                    backgroundImage: `linear-gradient(to right, ${activeStyle.color} ${(intensity-1)*25}%, padding-box, transparent 0%)`
                  } : {}}
                />
                <style>{`
                  input[type=range]::-webkit-slider-thumb {
                     border-color: ${activeStyle?.color || '#cbd5e1'};
                  }
                  textarea::placeholder {
                    color: #94a3b8 !important;
                  }
                `}</style>
             </div>
             <div className="flex justify-between mt-3 px-1">
               {['Minimal', 'Low', 'Moderate', 'High', 'Intense'].map((lbl, idx) => (
                  <span key={lbl} className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${intensity === idx + 1 ? (activeStyle?.text || 'text-violet-600') : 'text-slate-400'}`}>
                    {lbl}
                  </span>
               ))}
             </div>
          </div>

          {/* 4. Activities */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-fade-up" style={{animationDelay: '150ms'}}>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">What have you been up to?</label>
            <div className="flex flex-wrap gap-2.5">
              {ACTIVITIES.map((act) => {
                const isSel = selectedTags.includes(act.label);
                return (
                  <button
                    key={act.label}
                    onClick={() => handleToggleTag(act.label)}
                    className={`
                      flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ease-spring border-1.5
                      ${isSel && activeStyle
                        ? `bg-gradient-to-r ${activeStyle.gradStart} ${activeStyle.gradEnd} text-white border-transparent shadow-md ${activeStyle.glow}`
                        : `bg-white border-slate-200 text-slate-500 hover:border-violet-200 hover:text-violet-600 hover:-translate-y-px hover:shadow-md hover:shadow-violet-100/50`
                      }
                    `}
                  >
                    <span className="text-[14px] leading-none">{act.icon}</span>
                    {act.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5. Notes */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-fade-up" style={{animationDelay: '200ms'}}>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">Journal Notes <span className="text-slate-400 tracking-normal lowercase font-medium">— optional</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What's on your mind? What triggered this feeling?"
              className={`w-full bg-slate-50 border-1.5 border-slate-100 rounded-2xl p-4 text-sm text-gray-700 placeholder:text-slate-400 resize-y outline-none leading-relaxed min-h-[100px] transition-all
                ${activeStyle ? `focus:border-${activeStyle.border.split('-')[1]}-${activeStyle.border.split('-')[2]} focus:ring-4 focus:ring-${activeStyle.border.split('-')[1]}-100` : 'focus:border-violet-300'}`}
            />
            <div className="text-right text-[10px] text-slate-400 mt-2 font-medium">{notes.length} characters</div>
          </div>

          {/* 6. Bottom Row Controls */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{animationDelay: '250ms'}}>
            <div className="col-span-1 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-center">
               <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Date</label>
               <input 
                 type="date" 
                 value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                 className="outline-none text-sm font-bold text-slate-700 w-full bg-transparent cursor-pointer"
               />
            </div>
            
            <button
              onClick={handleSave}
              disabled={!selectedMood || isSaving || isSaved}
              className={`
                col-span-2 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-300 ease-spring
                ${!selectedMood ? 'bg-slate-100 border-[1.5px] border-slate-200 text-slate-500 cursor-not-allowed' : ''}
                ${selectedMood && !isSaving && !isSaved && activeStyle ? `bg-gradient-to-r ${activeStyle.gradStart} ${activeStyle.gradEnd} text-white shadow-lg ${activeStyle.glow} hover:-translate-y-1 hover:shadow-xl` : ''}
                ${isSaved ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' : ''}
                ${isSaving ? 'bg-slate-800 text-white' : ''}
              `}
            >
              {isSaving ? <><Loader2 className="w-5 h-5 animate-spin"/> Saving...</> 
               : isSaved ? <><Check className="w-5 h-5 animate-bounce"/> Saved to journal!</>
               : selectedMood ? 'Save Entry' 
               : '← Pick a mood first'}
            </button>
          </div>
          
        </div>


        {/* ================= RIGHT COLUMN / INSIGHTS ================= */}
        <div className="space-y-6">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{animationDelay: '100ms'}}>
             <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
               <div className="w-10 h-10 rounded-[14px] bg-emerald-50 flex items-center justify-center mb-3 border border-emerald-100 text-xl">📈</div>
               <div className="text-3xl font-black font-heading text-emerald-600 tracking-tighter">{stats.positivity}%</div>
               <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mt-1">Positivity</div>
               <div className="text-[11px] text-slate-400 font-medium">of all entries</div>
             </div>
             
             <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
               <div className="w-10 h-10 rounded-[14px] bg-amber-50 flex items-center justify-center mb-3 border border-amber-100 text-xl">⚡</div>
               <div className="text-3xl font-black font-heading text-amber-600 tracking-tighter">{stats.avgIntensity}</div>
               <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mt-1">Avg Intensity</div>
               <div className="text-[11px] text-slate-400 font-medium">out of 5.0</div>
             </div>

             <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
               <div className="w-10 h-10 rounded-[14px] bg-violet-50 flex items-center justify-center mb-3 border border-violet-100 text-xl">🗓️</div>
               <div className="text-3xl font-black font-heading text-violet-600 tracking-tighter">{stats.count}</div>
               <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mt-1">This Week</div>
               <div className="text-[11px] text-slate-400 font-medium">entries logged</div>
             </div>
          </div>

          {/* TABS */}
          <div className="bg-slate-100 rounded-full p-1 inline-flex animate-fade-up w-full sm:w-auto" style={{animationDelay: '150ms'}}>
            {[
              { id: 'log', icon: '✍️', label: 'Log' },
              { id: 'history', icon: '📑', label: 'History' },
              { id: 'analytics', icon: '📊', label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300
                  ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: LOG OVERVIEW (Mock visual state) */}
          {activeTab === 'log' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                 <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4 block">This Week</label>
                 <div className="flex gap-2">
                   {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => {
                      const mockEntry = i < 5 ? history[history.length - 1 - i] : null; // fake population for visual
                      const mockMood = mockEntry ? MOOD_CONFIG[mockEntry.mood] : null;
                      
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2">
                           <div className={`w-full aspect-square rounded-[14px] border-2 flex items-center justify-center text-xl transition-all
                              ${mockMood ? `${mockMood.bg} ${mockMood.border} ${mockMood.glow} shadow-sm` : 'bg-slate-50 border-slate-100'}
                           `} style={i === 4 ? { borderColor: activeStyle?.color || '#7c3aed', boxShadow: `0 0 0 4px ${activeStyle?.color || '#7c3aed'}22` } : {}}>
                              {mockMood ? mockMood.emoji : ''}
                           </div>
                           <span className={`text-[9px] font-extrabold uppercase ${i === 4 ? '' : 'text-slate-500'}`} style={i === 4 ? { color: activeStyle?.color || '#7c3aed' } : {}}>{day}</span>
                        </div>
                      )
                   })}
                 </div>
               </div>

               <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm space-y-3">
                 <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 mb-2 block">Daily Insights</label>
                 
                 <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex gap-3 items-start">
                   <div className="text-violet-500 mt-0.5">✨</div>
                   <p className="text-[13px] font-medium text-violet-800 leading-snug">You've logged moods for {stats.streak} consecutive days. Amazing consistency!</p>
                 </div>
                 
                 <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
                   <div className="text-amber-500 mt-0.5">🌟</div>
                   <p className="text-[13px] font-medium text-amber-800 leading-snug">Your most frequent mood this week is <b>{stats.mostFrequent}</b>.</p>
                 </div>

                 <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                   <div className="text-emerald-500 mt-0.5">🧘</div>
                   <p className="text-[13px] font-medium text-emerald-800 leading-snug">Meditation appeared in 3 of your recent positive entries.</p>
                 </div>
               </div>

            </div>
          )}

          {/* TAB CONTENT: HISTORY LIST */}
          {activeTab === 'history' && (
             <div className="flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-2 scrollbar-thin animate-in fade-in slide-in-from-bottom-4 duration-500">
                {history.map((entry, idx) => {
                   const conf = MOOD_CONFIG[entry.mood];
                   const date = new Date(entry.timestamp);
                   
                   return (
                     <div key={entry.id} className="group relative bg-white rounded-3xl p-5 border-1.5 border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 ease-spring" style={{animationDelay: `${idx * 50}ms`}}>
                       
                       <div className={`absolute left-0 top-0 bottom-0 w-[5px] rounded-l-3xl bg-gradient-to-b ${conf.gradStart} ${conf.gradEnd} opacity-70`} />
                       
                       <div className="flex gap-4">
                          <div className={`w-[48px] h-[48px] shrink-0 rounded-[16px] ${conf.bg} border ${conf.border} flex items-center justify-center text-2xl shadow-sm`}>
                             {conf.emoji}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start mb-1.5">
                                <div className="flex items-center gap-2.5">
                                   <h3 className="font-heading font-black text-lg text-slate-900 leading-none">{conf.label}</h3>
                                   <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${conf.bg} border ${conf.border} ${conf.text}`}>
                                     Lvl {entry.intensity}
                                   </span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-500">
                                   {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}
                                </span>
                             </div>

                             {entry.activityTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                  {entry.activityTags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                             )}

                             {entry.notes && (
                                <p className={`text-[13px] font-medium italic mt-3 px-3 py-2 rounded-xl bg-slate-50 border-l-[3px] ${conf.border} text-slate-600 leading-relaxed`}>
                                   "{entry.notes}"
                                </p>
                             )}
                          </div>
                       </div>
                       

                     </div>
                   )
                })}
             </div>
          )}

          {/* TAB CONTENT: ANALYTICS (Mock graphs using CSS logic as requested) */}
          {activeTab === 'analytics' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[28px] p-7 text-white shadow-xl shadow-violet-200 overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                   
                   <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-violet-100 mb-2">EMOTIONAL POSITIVITY SCORE</h3>
                   <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-7xl font-black font-heading tracking-tighter">{stats.positivity}%</span>
                      <span className="text-violet-200 font-medium text-sm">positive moments</span>
                   </div>
                   
                   <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{width: `${stats.positivity}%`}} />
                   </div>
                </div>

                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                   <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-5">INTENSITY TREND</h3>
                   
                   {/* CSS-based visual representation of line chart for demonstration */}
                   <div className="h-32 relative flex items-end justify-between px-2 pb-6 border-b border-dashed border-slate-200">
                     {[3,4,3,5,2,4,3].map((val, i) => (
                       <div key={i} className="relative flex flex-col items-center group w-6">
                         <div className="absolute bottom-[-24px] text-[9px] font-bold text-slate-500 uppercase">D-{6-i}</div>
                         <div 
                           className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-sm ring-4 ring-violet-50 z-10 hover:scale-150 transition-transform cursor-pointer"
                           style={{marginBottom: `${(val-1)*20}px`}}
                         />
                         <div className="w-px bg-violet-100 absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{height: `${(val-1)*20}px`}} />
                       </div>
                     ))}
                     {/* SVG fake connecting line */}
                     <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
                        <path d="M10,80 Q50,60 100,80 T200,40 T300,100 T400,60 T480,80" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                   </div>
                </div>

             </div>
          )}

        </div>
      </div>
    </div>
  );
}
