import { useState, useEffect, useRef, useMemo } from 'react';
import { moodService } from '@/services/moodService';
import { gratitudeService } from '@/services/gratitudeService';

const AFFIRMATIONS = [
  "I am allowed to take up space. My feelings are valid and I deserve to heal at my own pace.",
  "Every small step forward is still progress. I am doing better than I think.",
  "I do not have to have everything figured out right now. I am allowed to just be.",
  "My struggles do not define me. My courage in facing them does.",
  "Rest is not laziness. Taking care of myself is the most productive thing I can do.",
  "I am worthy of love, support and kindness — especially from myself.",
  "Healing is not linear. Every day I choose to try is a victory.",
];

const BREATH_TYPES = [
  { id:"478", label:"4-7-8", desc:"Anxiety relief",
    phases:[
      {name:"Inhale", dur:4000, scale:1.35},
      {name:"Hold",   dur:7000, scale:1.35},
      {name:"Exhale", dur:8000, scale:0.85}
    ]
  },
  { id:"box", label:"Box", desc:"Stress reset",
    phases:[
      {name:"Inhale", dur:4000, scale:1.3},
      {name:"Hold",   dur:4000, scale:1.3},
      {name:"Exhale", dur:4000, scale:0.85},
      {name:"Hold",   dur:4000, scale:0.85}
    ]
  },
  { id:"sigh", label:"Sigh", desc:"Quick calm",
    phases:[
      {name:"Inhale", dur:3000, scale:1.25},
      {name:"+ Sip",  dur:1000, scale:1.35},
      {name:"Exhale", dur:6000, scale:0.82}
    ]
  },
  { id:"belly", label:"Belly", desc:"Deep relax",
    phases:[
      {name:"Inhale", dur:5000, scale:1.4},
      {name:"Exhale", dur:7000, scale:0.82}
    ]
  },
];

const GROUND_STEPS = [
  {num:5, sense:"SEE", prompt:"Look around — 5 things you can see?"},
  {num:4, sense:"TOUCH", prompt:"4 things you can physically touch?"},
  {num:3, sense:"HEAR", prompt:"Listen carefully — 3 sounds?"},
  {num:2, sense:"SMELL", prompt:"2 scents you notice right now?"},
  {num:1, sense:"TASTE", prompt:"1 taste in your mouth?"},
];

const CHALLENGES = [
  {icon:"🫁", name:"5-day breathing streak", progress:20, label:"Day 1 of 5", status:"active"},
  {icon:"📓", name:"7-day gratitude challenge", progress:14, label:"Day 1 of 7", status:"active"},
  {icon:"📵", name:"No phone after 10pm", progress:0, label:"New challenge", status:"new"},
  {icon:"💧", name:"Drink 8 glasses daily", progress:0, label:"New challenge", status:"new"},
];

const Wellness = () => {

  // SECTION 2 - AFFIRMATIONS
  const [affIdx, setAffIdx] = useState(0);
  const [affSaved, setAffSaved] = useState(false);

  // SECTION 3 - BREATHING
  const [breathType, setBreathType] = useState(BREATH_TYPES[0]);
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Tap to begin");
  const [breathScale, setBreathScale] = useState(1);
  const [breathCycles, setBreathCycles] = useState(0);
  const breathRef = useRef<NodeJS.Timeout | null>(null);


  // SECTION 4 - GROUNDING
  const [groundStep, setGroundStep] = useState(() => {
    const saved = localStorage.getItem('wellness_groundStep');
    return saved ? JSON.parse(saved) : 0;
  });
  const [groundDone, setGroundDone] = useState<number[]>(() => {
    const saved = localStorage.getItem('wellness_groundDone');
    return saved ? JSON.parse(saved) : [];
  });

  // SECTION 4 - GRATITUDE
  const [gratitude, setGratitude] = useState<string[]>(() => {
    const saved = localStorage.getItem('wellness_gratitude');
    return saved ? JSON.parse(saved) : ["", "", ""];
  });
  const [gratSaved, setGratSaved] = useState(() => {
    const saved = localStorage.getItem('wellness_gratSaved');
    return saved ? JSON.parse(saved) : false;
  });

  // SECTION 5 - CHECKLIST
  const [checked, setChecked] = useState<number[]>(() => {
    const saved = localStorage.getItem('wellness_selfcare');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wellness_selfcare', JSON.stringify(checked));
  }, [checked]);

  // SECTION 5 - SLEEP
  const [sleepRating, setSleepRating] = useState(() => {
    const saved = localStorage.getItem('wellness_sleepRating');
    return saved ? JSON.parse(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('wellness_groundStep', JSON.stringify(groundStep));
    localStorage.setItem('wellness_groundDone', JSON.stringify(groundDone));
    localStorage.setItem('wellness_gratitude', JSON.stringify(gratitude));
    localStorage.setItem('wellness_gratSaved', JSON.stringify(gratSaved));
    localStorage.setItem('wellness_sleepRating', JSON.stringify(sleepRating));
  }, [groundStep, groundDone, gratitude, gratSaved, sleepRating]);


  // REAL-TIME MONITORING STATE
  const [history, setHistory] = useState<any[]>([]);
  const [fluctuatedScore, setFluctuatedScore] = useState(0);

  // Challenge Specific States
  const [waterGlasses, setWaterGlasses] = useState(() => {
    const saved = localStorage.getItem('wellness_waterGlasses');
    return saved ? parseInt(saved) : 0;
  });
  const [phoneCurfewAchieved, setPhoneCurfewAchieved] = useState(() => {
    const saved = localStorage.getItem('wellness_phoneCurfew');
    return saved === 'true';
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('wellness_waterGlasses', waterGlasses.toString());
    localStorage.setItem('wellness_phoneCurfew', phoneCurfewAchieved.toString());
  }, [waterGlasses, phoneCurfewAchieved]);

  const getTimeRemaining = (targetHour: number) => {
    const target = new Date();
    target.setHours(targetHour, 0, 0, 0);
    if (currentTime > target && targetHour === 22) {
       // It's after 10 PM, curfew is active
       return "Curfew Active";
    }
    const diff = target.getTime() - currentTime.getTime();
    if (diff <= 0) return "00:00:00";
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // FETCH DATA
  useEffect(() => {
    const fetchWellnessData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      try {
        const moodData = await moodService.getMoods(token);
        const gratitudeData = await gratitudeService.getMyEntries(token);
        
        // Combine history for streak calculation
        const combinedHistory = [
          ...(moodData || []).map((m: any) => ({ ...m, type: 'mood' })),
          ...(gratitudeData.data || []).map((g: any) => ({ ...g, type: 'gratitude', timestamp: g.createdAt }))
        ];
        
        setHistory(combinedHistory);
      } catch (err) {
        console.error("Failed to fetch real-time monitoring data", err);
      }
    };
    fetchWellnessData();
  }, []);

  // CALCULATE STATS
  const stats = useMemo(() => {
    if (!history.length) {
      return { score: 0, streak: 0, logs: 0, trend: "---", newCount: "--" };
    }

    // 1. Calculate Wellness Score (simple average of intensities mapped to %)
    let scoreTotal = 0;
    history.forEach(m => {
      const positiveMultiplier = ['happy', 'euphoric', 'calm'].includes(m.mood) ? 20 : 
                                ['neutral', 'tired'].includes(m.mood) ? 12 : 8;
      scoreTotal += (m.intensity * positiveMultiplier);
    });
    const calculatedScore = Math.min(100, Math.round(scoreTotal / history.length));

    // 2. Calculate Streak
    const sorted = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (let i = 0; i < sorted.length; i++) {
      const logDate = new Date(sorted[i].timestamp);
      logDate.setHours(0, 0, 0, 0);
      if (logDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (logDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    // 3. Monthly Logs
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyLines = history.filter(m => {
      const d = new Date(m.timestamp);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return { 
      score: calculatedScore, 
      streak: streak || 0, 
      logs: monthlyLines,
      trend: history.length > 5 ? "↑ Stable" : "↑ Trending",
      newCount: `+${history.length % 5} today`
    };
  }, [history]);

  // LIVE MONITORING FLUCTUATION EFFECT
  useEffect(() => {
    if (stats.score) {
      setFluctuatedScore(stats.score);
      const interval = setInterval(() => {
        // Subtle +/- 1% fluctuation to simulate "live monitoring"
        setFluctuatedScore(prev => prev + (Math.random() > 0.5 ? 0.3 : -0.3));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [stats.score]);


  // LOGIC: BREATHING
  const stopBreath = () => {
    setBreathRunning(false);
    setBreathPhase("Tap to begin");
    setBreathScale(1);
    setBreathCycles(0);
    if (breathRef.current) clearTimeout(breathRef.current);
  };

  const runPhase = (phases: any[], idx: number, cycle: number) => {
    if (idx >= phases.length) {
      const next = cycle + 1;
      setBreathCycles(next);
      if (next >= 3) {
        stopBreath();
        setBreathPhase("Well done! Feel calm.");
        return;
      }
      runPhase(phases, 0, next);
      return;
    }
    const p = phases[idx];
    setBreathPhase(p.name + "...");
    setBreathScale(p.scale);
    breathRef.current = setTimeout(() => 
      runPhase(phases, idx + 1, cycle), p.dur);
  };

  const startBreath = () => {
    if (breathRunning) { stopBreath(); return; }
    setBreathRunning(true);
    setBreathCycles(0);
    runPhase(breathType.phases, 0, 0);
  };

  // LOGIC: GROUNDING
  const advanceGround = (idx: number, val: string) => {
    if (!val.trim()) return;
    setGroundDone(prev => [...prev, idx]);
    setGroundStep(idx + 1);
  };

  // LOGIC: CHECKLIST
  const toggleCheck = (i: number) => {
    setChecked(prev => 
      prev.includes(i) 
        ? prev.filter(x => x !== i) 
        : [...prev, i]
    );
  };
  const saveGratitude = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await gratitudeService.createEntry(token, {
        q1: gratitude[0],
        q2: gratitude[1],
        q3: gratitude[2]
      });
      setGratSaved(true);
    } catch (err) {
      console.error("Failed to save gratitude", err);
      alert("Failed to save your gratitude journal. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-[#ffffff] font-['Plus_Jakarta_Sans'] text-slate-900 pb-20 selection:bg-blue-100">
      
      {/* MESH BACKGROUND DECO */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#3b82f6,transparent_50%),radial-gradient(circle_at_0%_100%,#06b6d4,transparent_50%),radial-gradient(circle_at_100%_100%,#10b981,transparent_50%)]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        
        {/* SECTION 1 — HERO BANNER (REIMAGINED BLACK + BLUE) */}
        <section className="relative overflow-hidden rounded-[40px] p-10 lg:p-16 mb-8 bg-gradient-to-br from-slate-950 via-blue-900 to-sky-700 animate-[fadeUp_0.4s_ease_both] shadow-2xl shadow-blue-900/20">
          {/* Floating Blobs */}
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/20 filter blur-[100px] animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-[20%] right-[5%] w-[300px] h-[300px] rounded-full bg-sky-400/20 filter blur-[80px] animate-pulse pointer-events-none delay-1000"></div>
          <div className="absolute top-[40%] left-[40%] w-[200px] h-[200px] rounded-full bg-cyan-400/10 filter blur-[60px] animate-pulse pointer-events-none delay-500"></div>
          
          <div className="flex justify-between items-center flex-wrap gap-12 relative z-10">
            <div className="flex-1 min-w-[320px]">
              <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 text-[11px] font-black text-white uppercase tracking-widest mb-6 backdrop-blur-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
                Premium Health-Tech Dashboard
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1] mb-6">
                Redefire Your <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Mental Clarity</span>
              </h1>
              <p className="text-white/60 text-lg lg:text-xl leading-relaxed max-w-lg font-medium">
                Experience world-class therapeutic tools designed to elevate your emotional well-being and build lasting resilience.
              </p>
            </div>

            <div className="flex gap-4 flex-wrap justify-center lg:justify-end">
              {[
                { val: `${fluctuatedScore ? fluctuatedScore.toFixed(1) : stats.score}%`, label: "Wellness score", trend: stats.trend, color: "cyan" },
                { val: stats.streak, label: "Day streak", trend: "Top 5%", color: "blue" },
                { val: stats.logs, label: "Monthly logs", trend: stats.newCount, color: "sky" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-center min-w-[140px] backdrop-blur-2xl hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] group relative overflow-hidden">
                  {/* Glowing signal line inside box */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                  
                  <div className={`text-4xl font-black text-white group-hover:text-cyan-300 transition-colors animate-pulse`}>{stat.val}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mt-2">{stat.label}</div>
                  <div className="text-[10px] text-cyan-400 font-black mt-3 bg-cyan-400/10 py-1.5 px-3 rounded-full inline-block border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                    <span className="inline-block mr-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2 — DAILY AFFIRMATION (CENTERED GLOW CARD) */}
        <section className="relative mb-12 animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: '0.05s' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-blue-100/30 filter blur-[100px] pointer-events-none rounded-full opacity-50"></div>
          <div className="bg-white border border-slate-100 rounded-[40px] p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-900/5 group hover:shadow-blue-500/10 transition-all duration-700">
            {/* Soft decorative quote icons */}
            <div className="absolute top-8 left-8 text-slate-100/50 text-8xl font-serif pointer-events-none opacity-20">“</div>
            <div className="absolute bottom-8 right-8 text-slate-100/50 text-8xl font-serif pointer-events-none opacity-20">”</div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-xl">✨</span>
                <div className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Daily Reflection</div>
                <span className="text-xl">✨</span>
              </div>
              
              <div className="max-w-2xl mx-auto mb-12">
                <p className="text-2xl lg:text-3xl font-black text-slate-900 leading-[1.3] italic transition-all duration-700">
                  "{AFFIRMATIONS[affIdx]}"
                </p>
              </div>

              <div className="flex gap-4 justify-center items-center">
                <button 
                  onClick={() => { setAffIdx((affIdx + 1) % AFFIRMATIONS.length); setAffSaved(false); }}
                  className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-sm hover:bg-black hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                  Next affirmation
                </button>
                <button 
                  onClick={() => setAffSaved(true)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform active:scale-90 shadow-lg ${affSaved ? 'bg-emerald-500 text-white scale-110 rotate-[360deg]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'}`}
                >
                  {affSaved ? (
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2 COLUMN GRID START */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* CARD A — FUTURISTIC BREATHING WIDGET */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/10 transition-all duration-700 animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-xl font-black text-slate-950">Breath Control 🫁</h2>
                <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">Live health-tech widget</div>
              </div>
              <div className="bg-blue-50 px-4 py-1.5 rounded-full">
                <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">{breathType.desc}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-12">
              {BREATH_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => { setBreathType(type); stopBreath(); }}
                  className={`text-[10px] font-black px-6 py-3 rounded-full transition-all tracking-widest uppercase ${breathType.id === type.id ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-10 mt-4">
              <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Ripple Rings (shows during running) */}
                {breathRunning && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ripple"></div>
                    <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ripple delay-700"></div>
                  </>
                )}
                <div className="absolute inset-0 rounded-full border border-blue-50"></div>
                <div className="absolute inset-[10%] rounded-full border border-blue-100/50"></div>
                
                <div 
                  onClick={startBreath}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center cursor-pointer font-black text-sm transition-all duration-[1000ms] ease-in-out relative z-10 shadow-2xl ${breathRunning ? 'bg-gradient-to-br from-slate-950 via-blue-900 to-blue-700 text-white border-4 border-white/20' : 'bg-white border-2 border-slate-100 text-slate-800 hover:border-blue-300 hover:scale-105'}`}
                  style={{ transform: `scale(${breathScale})`, boxShadow: breathRunning ? '0 0 50px rgba(59,130,246,0.5)' : '' }}
                >
                  {breathRunning ? (
                    <div className="text-center animate-pulse">
                      <div className="text-[9px] text-cyan-400 opacity-80 mb-1 uppercase tracking-widest">Phase</div>
                      <div className="text-lg">{breathPhase.split('...')[0]}</div>
                    </div>
                  ) : <div className="flex flex-col items-center gap-2 tracking-widest animate-bounce"><span>START</span><span className="text-[10px] opacity-40">Session</span></div>}
                </div>

                {/* Progress ring simulation (using SVG) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                   <circle cx="112" cy="112" r="108" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                   {breathRunning && (
                     <circle 
                        cx="112" cy="112" r="108" 
                        fill="none" stroke="#2563eb" strokeWidth="4" 
                        strokeDasharray="678" 
                        strokeDashoffset={678 - (678 * (breathCycles / 3))}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                     />
                   )}
                </svg>
              </div>

              <div className="text-center">
                <div className="flex gap-3 justify-center mb-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all duration-700 ${i < breathCycles ? 'bg-blue-600 shadow-[0_0_12px_#2563eb] scale-125' : 'bg-slate-100'}`}></div>
                  ))}
                </div>
                <p className="text-[11px] text-blue-500 font-black h-5 uppercase tracking-[0.3em]">{breathPhase}</p>
              </div>

              {breathRunning && (
                <button 
                  onClick={stopBreath}
                  className="bg-red-50 text-red-500 text-[10px] font-black px-10 py-3 rounded-full hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.2em] shadow-lg shadow-red-100"
                >
                  Terminate
                </button>
              )}
            </div>
          </div>


          {/* CARD C — GROUNDING UI (EMOTIONAL JOURNALING STYLE) */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/10 transition-all duration-700 animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: '0.15s' }}>
            <div className="mb-10">
              <h2 className="text-xl font-black text-slate-950">Grounding Exercise 🛡️</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Sensory anchoring • Professional technique</p>
            </div>

            <div className="space-y-4">
              {GROUND_STEPS.map((step, idx) => {
                const isDone = groundDone.includes(idx);
                const isActive = groundStep === idx;

                return (
                  <div 
                    key={idx}
                    className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${isDone ? 'border-emerald-100 bg-emerald-50/30' : isActive ? 'border-blue-600 bg-white shadow-2xl shadow-blue-100 scale-102 translate-x-1' : 'border-slate-50 bg-slate-50/30 opacity-40 grayscale-[0.5]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-sm ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-slate-950 text-white' : 'bg-white text-slate-300'}`}>
                        {isDone ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg> : step.num}
                      </div>
                      <div className={`text-sm font-black tracking-tight ${isDone ? 'text-emerald-800' : isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                         Sense: {step.sense}
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-6 animate-in slide-in-from-top-4 duration-500">
                        <p className="text-xs font-bold text-slate-500 mb-3 ml-1 italic">"{step.prompt}"</p>
                        <input 
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') advanceGround(idx, (e.target as HTMLInputElement).value); }}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-[6px] focus:ring-blue-100 transition-all placeholder:text-slate-300 shadow-inner"
                          placeholder="Observe and record..."
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {groundStep >= 5 && (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[40px] p-10 text-center mt-4 animate-in zoom-in duration-700 shadow-[0_20px_50px_rgba(16,185,129,0.3)] border-4 border-white/20">
                  <div className="text-4xl mb-4 animate-bounce">🏆</div>
                  <div className="text-xl font-black text-white uppercase tracking-[.2em] mb-2">Grounding Successful</div>
                  <p className="text-sm text-emerald-50 font-bold opacity-90 leading-relaxed max-w-sm mx-auto">Your sensory system is anchored. You are safe, you are here, and you are doing great.</p>
                  <button onClick={() => { setGroundStep(0); setGroundDone([]); }} className="mt-8 bg-white text-emerald-600 px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Complete session</button>
                </div>
              )}
            </div>
          </div>

          {/* CARD D — GRATITUDE JOURNAL (ACHIEVEMENT STYLE) */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/10 transition-all duration-700 animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: '0.17s' }}>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black text-slate-950">Gratitude Journal 💜</h2>
              <div className="flex items-center gap-3 bg-amber-500 text-white rounded-full px-5 py-2 shadow-lg shadow-amber-200">
                <span className="text-lg">🔥</span>
                <span className="text-[11px] font-black uppercase tracking-widest">7 Day Streak</span>
              </div>
            </div>

            {!gratSaved ? (
              <div className="flex flex-col gap-6">
                {[
                  "One significant win today",
                  "A person who supported you",
                  "A quality you appreciate in yourself"
                ].map((q, i) => (
                  <div key={i} className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block group-focus-within:text-blue-500 transition-colors">{q}</label>
                    <input 
                      value={gratitude[i]}
                      onChange={(e) => { const n = [...gratitude]; n[i] = e.target.value; setGratitude(n); }}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-[6px] focus:ring-blue-50 transition-all shadow-inner"
                      placeholder="Share your heart..."
                    />
                  </div>
                ))}
                <button 
                  onClick={saveGratitude}
                  className="w-full py-5 mt-6 rounded-[32px] bg-slate-950 text-white font-black text-sm shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Submit Journal Entry
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            ) : (
              <div className="text-center py-16 animate-in zoom-in duration-700">
                <div className="relative inline-block mb-10">
                   <div className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-30 animate-pulse scale-150"></div>
                   <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center relative z-10 text-white text-4xl shadow-2xl animate-in zoom-in spin-in-90 duration-1000">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                   </div>
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">Gratitude Unlocked!</h3>
                <p className="text-sm text-slate-400 font-bold mb-10 max-w-[200px] mx-auto leading-relaxed uppercase tracking-widest opacity-80">Consistency is the bridge between goals and accomplishment.</p>
                <button 
                  onClick={() => setGratSaved(false)}
                  className="px-10 py-3 rounded-full bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  Return to journal
                </button>
              </div>
            )}
          </div>

          {/* CARD E — DAILY SELF-CARE (PREMIUM CHECKLIST) */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/10 transition-all duration-700 animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-black text-slate-950 mb-10">Self-Care Progress ✅</h2>
            <div className="flex flex-col gap-4 mb-10">
              {[
                { i: "💧", l: "8 glasses of pure hydration" },
                { i: "🍽️", l: "Full nourishing meal" },
                { i: "🚶", l: "Active therapeutic movement" },
                { i: "💬", l: "Connected with a safe person" },
                { i: "🌿", l: "Dedicated self-kindness moment" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`flex items-center gap-5 p-5 rounded-[28px] border-2 cursor-pointer transition-all duration-500 transform active:scale-95 ${checked.includes(idx) ? 'border-emerald-500 bg-emerald-50/50 translate-x-2 shadow-lg shadow-emerald-100/50' : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-100 hover:shadow-md'}`}
                >
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${checked.includes(idx) ? 'bg-emerald-500 border-white scale-110 rotate-12 shadow-inner' : 'border-slate-200 bg-white group-hover:border-blue-300'}`}>
                    {checked.includes(idx) && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[13px] font-black transition-all ${checked.includes(idx) ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {item.l}
                  </span>
                  {checked.includes(idx) && <div className="ml-auto text-xl animate-bounce">✨</div>}
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-8 rounded-[32px] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-center mb-4 relative z-10 px-1">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Daily Routine Status</span>
                <span className={`text-[12px] font-black ${checked.length === 5 ? 'text-emerald-400' : 'text-blue-400'}`}>{Math.round((checked.length / 5) * 100)}% Complete</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden shadow-inner relative z-10 mb-6">
                <div 
                  className={`h-full bg-gradient-to-r ${checked.length === 5 ? 'from-emerald-400 to-teal-400 shadow-[0_0_20px_#10b981]' : 'from-blue-500 to-cyan-400 shadow-[0_0_20px_#3b82f6]'} rounded-full transition-all duration-[1500ms] ease-out-expo`}
                  style={{ width: `${(checked.length / 5) * 100}%` }}
                ></div>
              </div>

              <button 
                onClick={() => setChecked([])}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all active:scale-95 relative z-10"
              >
                Reset Daily Progress
              </button>
            </div>
          </div>

          {/* CARD F — SLEEP ANALYTICS (MED-TECH STYLE) */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-500/10 transition-all duration-700 animate-[fadeUp_0.4s_ease_both]" style={{ animationDelay: '0.22s' }}>
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Sleep Analytics 🌙</h2>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">Circadian rhythm tracking</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">💤</div>
            </div>

            <div className="flex justify-between gap-2 my-10 max-w-sm mx-auto">
              {[
                { n: 1, e: '😫' }, { n: 2, e: '🥱' }, { n: 3, e: '😐' }, { n: 4, e: '😊' }, { n: 5, e: '😴' }
              ].map(item => (
                <button 
                  key={item.n}
                  onClick={() => setSleepRating(item.n)}
                  className={`flex-1 aspect-square rounded-[24px] border-2 flex flex-col items-center justify-center transition-all duration-500 group ${sleepRating === item.n ? 'border-slate-950 bg-slate-950 text-white shadow-2xl scale-125 z-10' : 'border-slate-100 bg-slate-50/50 grayscale hover:grayscale-0 hover:border-slate-300'}`}
                >
                  <span className={`text-4xl transition-transform duration-500 ${sleepRating === item.n ? 'scale-110' : 'group-hover:scale-125'}`}>{item.e}</span>
                </button>
              ))}
            </div>

            {sleepRating > 0 && (
              <div className={`rounded-[32px] p-8 border-2 mb-10 animate-in slide-in-from-top-4 duration-700 shadow-2xl flex items-center gap-6 ${sleepRating >= 4 ? 'bg-emerald-50 border-emerald-100' : sleepRating >= 2 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${sleepRating >= 4 ? 'bg-emerald-500 text-white' : sleepRating >= 2 ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                   {sleepRating >= 4 ? "✨" : sleepRating >= 2 ? "📈" : "⚠️"}
                </div>
                <div className={`font-black tracking-tight leading-snug ${sleepRating >= 4 ? 'text-emerald-800' : sleepRating >= 2 ? 'text-blue-800' : 'text-red-800'}`}>
                  {sleepRating >= 4 ? "Excellent recovery! Your circadian rhythm is perfectly aligned today." : sleepRating >= 2 ? "Moderate rest detected. Consider using our 4-7-8 breath before rest tonight." : "Critical sleep debt detected. Prioritize early rest and avoid late blue-light exposure."}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {[
                  { t: "Digital sunset 1hr prior", i: "📵" },
                  { t: "Constant cool temp", i: "❄️" },
                  { t: "Vagus nerve breath", i: "🫁" },
                  { t: "Evening brain-dump", i: "✍️" }
                ].map((tip, i) => (
                  <div key={i} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-default text-center group">
                    <span className="text-xl mb-1 transition-transform group-hover:scale-125 duration-300">{tip.i}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tip.t}</span>
                  </div>
                ))}
            </div>
          </div>

        </div>


        <section className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl shadow-blue-900/5 mb-12 animate-[fadeUp_0.4s_ease_both] hover:shadow-blue-500/10 transition-all duration-700" style={{ animationDelay: '0.28s' }}>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-950 mb-2">Active Missions 🏆</h2>
              <p className="text-[11px] text-blue-500 font-extrabold uppercase tracking-[0.4em]">Strategic habit-building objectives</p>
            </div>
            <div className="text-4xl">🏅</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CHALLENGES.map((challenge, i) => {
              const isPhone = challenge.name.includes("No phone");
              const isWater = challenge.name.includes("Drink 8 glasses");
              
              let displayProgress = challenge.progress;
              let displayLabel = challenge.label;
              let displayStatus = challenge.status;

              if (isWater) {
                displayProgress = Math.min(100, (waterGlasses / 8) * 100);
                displayLabel = `${waterGlasses} of 8 glasses`;
                displayStatus = waterGlasses >= 8 ? 'completed' : 'active';
              }
              if (isPhone) {
                displayProgress = phoneCurfewAchieved ? 100 : 0;
                displayLabel = phoneCurfewAchieved ? "Goal Achieved" : "Curfew: 10:00 PM";
                displayStatus = phoneCurfewAchieved ? 'completed' : 'active';
              }

              return (
                <div key={i} className={`p-8 rounded-[40px] border-2 transition-all duration-500 group relative overflow-hidden ${displayStatus === 'active' || displayStatus === 'completed' ? 'border-blue-600 bg-white shadow-2xl shadow-blue-50 translate-y-[-5px]' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:translate-y-[-5px]'}`}>
                  {(displayStatus === 'active' || displayStatus === 'completed') && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]"></div>}
                  
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className={`w-16 h-16 rounded-[22px] bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${displayStatus === 'active' || displayStatus === 'completed' ? 'shadow-blue-100' : ''}`}>
                      {challenge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-black text-slate-900 tracking-tight leading-snug">{challenge.name}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-sm ${displayStatus === 'active' || displayStatus === 'completed' ? 'bg-blue-600 text-white border-blue-500' : 'bg-emerald-500 text-white border-emerald-400 animate-pulse font-extrabold animate-pulse'}`}>
                          {displayStatus.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold opacity-70 tracking-widest uppercase">{displayLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {/* Timer and Action Button for specific challenges */}
                    {(isPhone || isWater) && (
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isPhone ? "Time until curfew" : "Daily reset timer"}</span>
                          <span className="text-sm font-black text-blue-600 font-mono">
                            {isPhone ? getTimeRemaining(22) : getTimeRemaining(24)}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            if (isWater) setWaterGlasses(prev => Math.min(8, prev + 1));
                            if (isPhone) setPhoneCurfewAchieved(true);
                          }}
                          className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            (isWater && waterGlasses >= 8) || (isPhone && phoneCurfewAchieved)
                            ? 'bg-emerald-100 text-emerald-600 cursor-default'
                            : 'bg-slate-950 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-lg'
                          }`}
                        >
                          {isWater ? (waterGlasses >= 8 ? "Goal Reached" : "Tap glass +1") : (phoneCurfewAchieved ? "Logged" : "Tap to complete")}
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                         <span>Mission Progress</span>
                         <span className={displayStatus === 'active' || displayStatus === 'completed' ? 'text-blue-500' : 'text-slate-300'}>{displayProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50 ring-4 ring-white/50">
                        <div 
                          className={`h-full bg-gradient-to-r rounded-full transition-all duration-[1000ms] ease-out-expo ${displayStatus === 'active' || displayStatus === 'completed' ? 'from-blue-600 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'from-slate-300 to-slate-400'}`}
                          style={{ width: `${displayProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>



      </div>
    </div>
  );
};

export default Wellness;
