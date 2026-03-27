import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  })
  const [focused, setFocused] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Personalized Greeting Logic
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" 
                 : hour < 17 ? "Good afternoon" 
                 : "Good evening"
  const timeEmoji = hour < 12 ? "🌤️" 
                  : hour < 17 ? "☀️" 
                  : "🌙"
  const username = localStorage.getItem('username') || user?.username || 'there'

  // Mood Widget State
  const [todayMood, setTodayMood] = useState<any>(null)
  const [moodSubmitted, setMoodSubmitted] = useState(false)
  const [moodHistory, setMoodHistory] = useState<number[]>(JSON.parse(localStorage.getItem('moodHistory') || '[3,4,2,5,3,4,4]'))
  const nextSession = localStorage.getItem('nextSession')

  // Breathing Widget State
  const [breathing, setBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<"ready" | "inhale" | "hold" | "exhale" | "done">("ready")
  const [breathCount, setBreathCount] = useState(0)

  useEffect(() => {
    const lastDate = localStorage.getItem('lastMoodDate')
    const todayStr = new Date().toDateString()
    if (lastDate === todayStr) {
        setMoodSubmitted(true)
        const savedEmoji = localStorage.getItem('lastMoodEmoji')
        setTodayMood({ emoji: savedEmoji })
    }
  }, [])

  useEffect(() => {
    let timer: any;
    if (breathing) {
      if (breathCount < 3) {
        setBreathPhase("inhale")
        timer = setTimeout(() => {
          setBreathPhase("hold")
          timer = setTimeout(() => {
            setBreathPhase("exhale")
            timer = setTimeout(() => {
              setBreathCount(prev => prev + 1)
            }, 6000)
          }, 4000)
        }, 4000)
      } else {
        setBreathing(false)
        setBreathPhase("done")
      }
    }
    return () => clearTimeout(timer)
  }, [breathing, breathCount])

  const handleMoodSubmit = () => {
    if (!todayMood) return;
    const todayStr = new Date().toDateString()
    localStorage.setItem('lastMoodDate', todayStr)
    localStorage.setItem('lastMoodEmoji', todayMood.emoji)
    
    // Update visual history
    const moodMap: any = { "😊": 5, "😌": 4, "😐": 3, "😟": 2, "😰": 1 };
    const val = moodMap[todayMood.emoji] || 3;
    const newHistory = [...moodHistory.slice(1), val];
    setMoodHistory(newHistory);
    localStorage.setItem('moodHistory', JSON.stringify(newHistory));
    
    setMoodSubmitted(true)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate 1.5s delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('http://127.0.0.1:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, subject: selectedSubject || formData.subject })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSelectedSubject(null);
        setCharCount(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="font-sans text-gray-700">

      {/* 
        HERO SECTION 
        - Calm background image (Nature/Sunrise)
        - Soft gradient overlay
        - Emotional copy
      */}
      <section className="relative w-full h-[600px] flex items-center justify-center text-center px-4 overflow-hidden rounded-2xl shadow-2xl my-6 mx-auto max-w-7xl">

        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2070&auto=format&fit=crop')",
          }}
        ></div>

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Addition 1 - Personalized Greeting */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6 animate-fade-in shadow-xl mx-auto">
            <span className="text-white text-sm font-semibold">{timeEmoji} {greeting}, {username}!</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
            You don't have to face it alone.
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 font-light max-w-2xl mx-auto drop-shadow-sm">
            Mind Care is your safe space for emotional support, self-care, and professional help — anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to="/chat"
              className="px-8 py-4 bg-[#0f172a] text-white font-bold text-sm tracking-widest uppercase rounded-full shadow-lg hover:shadow-xl hover:bg-slate-800 hover:scale-105 transition-all duration-300 transform"
            >
              Talk to AI Now
            </Link>
            <Link
              to="/mood-tracking"
              className="px-8 py-4 bg-[#0f172a] text-white font-bold text-sm tracking-widest uppercase rounded-full shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all duration-300 backdrop-blur-sm"
            >
              Track Your Mood
            </Link>
          </div>
        </div>
      </section>

      {/* Addition 2 — DAILY MOOD CHECK-IN WIDGET */}
      <section className="max-w-2xl mx-auto -mt-12 relative z-10 px-4 mb-2">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 p-6 sm:p-8 animate-slide-up">
            {!moodSubmitted ? (
                <>
                    <h3 className="text-xl font-bold text-slate-800 text-center mb-2">How are you feeling right now?</h3>
                    <p className="text-sm text-slate-400 text-center mb-6 font-medium">Tap to log your mood — takes 2 seconds</p>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { emoji:"😊", label:"Happy",   color:"text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
                            { emoji:"😌", label:"Calm",    color:"text-sky-500", bg: "bg-sky-50", border: "border-sky-100" },
                            { emoji:"😐", label:"Neutral", color:"text-slate-400", bg: "bg-slate-50", border: "border-slate-100" },
                            { emoji:"😟", label:"Sad",     color:"text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
                            { emoji:"😰", label:"Anxious", color:"text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
                        ].map((m) => (
                            <button
                                key={m.label}
                                onClick={() => setTodayMood(m)}
                                className={todayMood?.label === m.label 
                                    ? `flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-indigo-400 bg-indigo-50 -translate-y-1 shadow-lg shadow-indigo-100 scale-105 transition-all duration-200`
                                    : `flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-200 cursor-pointer group`
                                }
                            >
                                <span className="text-3xl">{m.emoji}</span>
                                <span className={`text-xs font-semibold ${m.color}`}>{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {todayMood && (
                        <button
                            onClick={handleMoodSubmit}
                            className="w-full mt-6 py-4 rounded-2xl bg-[#0f172a] text-white font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
                        >
                            Log My Mood
                        </button>
                    )}
                </>
            ) : (
                <div className="text-center py-2 animate-fade-in">
                    <span className="text-5xl mb-4 block animate-bounce-gentle">{todayMood?.emoji}</span>
                    <h3 className="text-lg font-bold text-slate-800">Mood logged! {todayMood?.emoji}</h3>
                    
                    <div className={`mt-3 p-5 rounded-2xl text-sm text-slate-600 font-medium leading-relaxed border ${
                        todayMood?.emoji === "😊" ? "bg-emerald-50 border-emerald-100" :
                        todayMood?.emoji === "😌" ? "bg-sky-50 border-sky-100" :
                        todayMood?.emoji === "😐" ? "bg-slate-50 border-slate-100" :
                        todayMood?.emoji === "😟" ? "bg-blue-50 border-blue-100" :
                        "bg-amber-50 border-amber-100"
                    }`}>
                        {todayMood?.emoji === "😊" && "You're doing great! Share your positivity in the community today 🌟"}
                        {todayMood?.emoji === "😌" && "Perfect state for reflection. Try a 5-minute journal entry 📝"}
                        {todayMood?.emoji === "😐" && "Sometimes neutral is peaceful. A breathing exercise might help 🫁"}
                        {todayMood?.emoji === "😟" && "It's okay to feel this way. Our AI companion is here for you 💜"}
                        {todayMood?.emoji === "😰" && "Take a slow breath. Try our guided breathing exercise 🌊"}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={() => navigate('/chat')}
                            className="flex-1 py-3 rounded-xl bg-[#0f172a] text-white text-xs font-bold tracking-widest uppercase hover:bg-slate-800 transition-all shadow-md"
                        >
                            Open AI Chat →
                        </button>
                        <button 
                             onClick={() => navigate('/mood-tracking')}
                             className="flex-1 py-3 rounded-xl bg-slate-100 text-[#0f172a] text-sm font-bold hover:bg-slate-200 transition-all"
                        >
                            View Mood History
                        </button>
                    </div>
                </div>
            )}
        </div>
      </section>

      {/* Addition 3 — WELLNESS SNAPSHOT ROW */}
      <section className="max-w-2xl mx-auto px-4 mt-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-2xl font-black text-orange-500 tracking-tight">7</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Day Streak</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
                <div className="text-2xl mb-1">{todayMood?.emoji || "—"}</div>
                <div className="text-sm font-bold text-slate-700 h-6 truncate">{todayMood?.label || "Not yet"}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Today's Mood</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm font-bold text-indigo-600 h-6 truncate">{nextSession || "None booked"}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Next Session</div>
            </div>
        </div>
      </section>



      {/* 
        FEATURES GRID 
        - Soft cards
        - Reassuring copy
        - Clean layout
      */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">How We Help You Heal</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Comprehensive tools designed to support your mental wellness journey at every step.
          </p>
        </div>

        {/* Addition 5 — COMMUNITY PULSE STRIP */}
        <div className="max-w-4xl mx-auto mb-12">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
                {[
                    { n: "14", room: "Anxiety Support" },
                    { n: "9", room: "Depression Support" },
                    { n: "21", room: "Relationships" },
                    { n: "7", room: "Self-Care Corner" }
                ].map((p, i) => (
                    <div 
                        key={i}
                        className="flex-shrink-0 flex items-center gap-3 bg-white rounded-full px-5 py-2.5 border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-slate-600 font-bold text-xs whitespace-nowrap"><span className="text-indigo-600 font-black">{p.n}</span> in {p.room}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <FeatureCard
            index={0}
            icon="💬"
            title="AI Emotional Support"
            description="24/7 empathetic chat support. A judgment-free zone where you're always heard."
            link="/chat"
          />
          <FeatureCard
            index={1}
            icon="📊"
            title="Mood & Insights"
            description="Track your emotional patterns over time to understand yourself better."
            link="/mood-tracking"
            extra={
                <div className="mt-6 pt-6 border-t border-slate-50">
                    <div className="flex items-end gap-1.5 h-16 justify-between px-1">
                        {moodHistory.map((v, i) => (
                            <div 
                                key={i}
                                className={`flex-1 rounded-t-lg transition-all duration-700 shadow-sm ${
                                    v === 5 ? "bg-emerald-400" :
                                    v === 4 ? "bg-sky-400" :
                                    v === 3 ? "bg-slate-300" :
                                    v === 2 ? "bg-amber-300" :
                                    "bg-rose-300"
                                }`}
                                style={{ height: `${(v / 5) * 100}%` }}
                            ></div>
                        ))}
                    </div>
                    <div className="flex justify-between gap-1 overflow-visible mt-2 px-1">
                        {["S","M","T","W","T","F","S"].map((d, i) => (
                            <span key={i} className="flex-1 text-center text-[10px] font-black text-slate-300">{d}</span>
                        ))}
                    </div>
                </div>
            }
          />
          <FeatureCard
            index={2}
            icon="👥"
            title="Community Connection"
            description="Join a supportive community of people who understand what you're going through."
            link={isAuthenticated ? "/community" : "/signup"}
          />
          <FeatureCard
            index={3}
            icon="🧘"
            title="Wellness Exercises"
            description="Calming breathing techniques and meditation to reduce anxiety in minutes."
            link="/wellness"
          />
          <FeatureCard
            index={4}
            icon="👨‍⚕️"
            title="Professional Help"
            description="Confidential access to licensed therapists when you need deeper support."
            link="/premium"
          />
          <FeatureCard
            index={5}
            icon="🛡️"
            title="Secure & Private"
            description="Your privacy is our priority. All conversations are anonymous and encrypted."
            link="#"
            noLinkStyle
          />
        </div>
      </section>

      {/* Addition 4 — ANIMATED BREATHING WIDGET */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[3rem] p-10 border border-indigo-100/50 text-center shadow-2xl shadow-indigo-100/30">
            <div className="text-4xl mb-4 animate-bounce-gentle">🫁</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Quick Check-in</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Relax your body and follow the circle for a moment of peace.</p>

            <div className="relative mx-auto mb-10 w-40 h-40">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 shadow-inner"></div>
                <div 
                    className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out shadow-lg ${
                        breathPhase === "ready" ? "bg-indigo-100/80" :
                        breathPhase === "inhale" ? "bg-indigo-500 scale-125 shadow-indigo-200" :
                        breathPhase === "hold" ? "bg-purple-500 scale-125 shadow-purple-200" :
                        breathPhase === "exhale" ? "bg-indigo-300 scale-90" :
                        "bg-emerald-400 shadow-emerald-200"
                    }`}
                    style={{ 
                        transform: (breathPhase === 'inhale' || breathPhase === 'hold') ? 'scale(1.25)' : breathPhase === 'exhale' ? 'scale(0.9)' : 'scale(1)',
                        transition: 'all 1s ease-in-out'
                    }}
                >
                    <span className="text-white font-black text-sm tracking-wide uppercase">
                        {breathPhase === "ready" && "Ready"}
                        {breathPhase === "inhale" && "Inhale"}
                        {breathPhase === "hold" && "Hold"}
                        {breathPhase === "exhale" && "Exhale"}
                        {breathPhase === "done" && "✓ Relaxed"}
                    </span>
                </div>
            </div>

            <div className="text-slate-600 text-sm font-bold h-6 mb-8 tracking-tight">
                {breathPhase === "ready" && "Press start when you're ready"}
                {breathPhase === "inhale" && "Breathe in slowly through your nose"}
                {breathPhase === "hold" && "Hold your breath gently"}
                {breathPhase === "exhale" && "Slowly breathe out through your mouth"}
                {breathPhase === "done" && "Great job! You should feel calmer now 🌿"}
            </div>

            <button
                onClick={() => {
                    if (!breathing) {
                        setBreathing(true)
                        setBreathCount(0)
                        setBreathPhase("ready")
                    } else {
                        setBreathing(false)
                        setBreathPhase("ready")
                    }
                }}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 ${
                    !breathing 
                    ? "bg-[#0f172a] text-white shadow-xl hover:-translate-y-1 hover:bg-slate-800" 
                    : "bg-slate-200 text-slate-500"
                }`}
            >
                {breathing ? "Stop Practice" : "Start Exercise"}
            </button>

            <div className="flex justify-center gap-3 mt-6">
                {[1, 2, 3].map((dot) => (
                    <div 
                        key={dot} 
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                            breathCount >= dot ? "bg-indigo-500 scale-125 shadow-sm" : "bg-indigo-100"
                        }`}
                    ></div>
                ))}
            </div>
        </div>
      </section>

      {/* ADDITION: 7 CUPS INSPIRED DUAL PATHWAYS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
            {/* Free Pathway */}
            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group flex flex-col items-start justify-between">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 w-full mb-6">
                    <img 
                        src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=600&auto=format&fit=crop" 
                        alt="Compassionate listener" 
                        className="w-full h-48 md:h-56 object-cover rounded-2xl shadow-sm border border-slate-100 mb-6 group-hover:shadow-md transition-shadow"
                    />
                    <div className="text-4xl mb-6 bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-indigo-100">🌿</div>
                    <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Free 24/7 Chat</h3>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
                        Connect safely with compassionate listeners who understand what you're going through. It's completely free, anonymous, and available right now.
                    </p>
                </div>
                <Link to="/chat" className="relative z-10 inline-block px-8 py-4 rounded-full bg-[#0f172a] text-white font-bold text-sm tracking-widest uppercase hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                    Chat Now
                </Link>
            </div>

            {/* Premium Pathway */}
            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group flex flex-col items-start justify-between">
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 w-full mb-6">
                    <img 
                        src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop" 
                        alt="Professional therapy session" 
                        className="w-full h-48 md:h-56 object-cover rounded-2xl shadow-sm border border-slate-100 mb-6 group-hover:shadow-md transition-shadow"
                    />
                    <div className="text-4xl mb-6 bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-rose-100">👨‍⚕️</div>
                    <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Affordable Therapy</h3>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
                        Take the next step with a licensed psychiatrist or therapist. Confidential, professional sessions at a fraction of the traditional cost.
                    </p>
                </div>
                <Link to="/premium" className="relative z-10 inline-block px-8 py-4 rounded-full bg-[#0f172a] text-white font-bold text-sm tracking-widest uppercase hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                    Book Session
                </Link>
            </div>
        </div>
      </section>

      {/* ADDITION: 7 CUPS INSPIRED GROWTH PATHS */}
      <section className="max-w-7xl mx-auto px-4 py-8 mb-16">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
              <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center relative z-10">
                  <h3 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                      Grow at your<br/><span className="text-indigo-300">own pace.</span>
                  </h3>
                  <p className="text-indigo-100/80 text-lg font-medium leading-relaxed mb-8 max-w-sm">
                      Nurture your mental health with our self-help guides. Overcome depression, manage anxiety, and find peace—one tiny step at a time.
                  </p>
                  <Link to="/wellness" className="self-start px-8 py-4 bg-white text-[#0f172a] rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 hover:bg-slate-50 transition-all duration-300 shadow-xl">
                      Start Growing
                  </Link>
              </div>
              <div className="md:w-1/2 min-h-[300px] relative bg-slate-800">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-80"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-transparent"></div>
              </div>
          </div>
      </section>

      {/* 
        ABOUT / MISSION SECTION 
        - Trust-building card
        - Human tone
      */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl shadow-xl p-8 md:p-12 border border-indigo-100 text-center">
          <div className="text-4xl mb-4">💙</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Promise to You</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
            Mind Care was created to make mental health support accessible, private, and judgment-free.
            Whether you need someone to talk to right now, tools to manage daily stress, or
            professional guidance — we’re here for you.
          </p>
          <p className="text-gray-600 text-lg font-medium">
            You are worthy of support. You are worthy of peace.
          </p>

          {!isAuthenticated && (
            <div className="mt-10">
              <Link
                to="/signup"
                className="text-primary-600 font-semibold hover:text-primary-800 transition-colors border-b-2 border-primary-200 hover:border-primary-600 pb-1"
              >
                Join our supportive community today →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 
        CONTACT US SECTION 
      */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <div className="max-w-6xl mx-auto">
          {/* SECTION HEADER */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase mb-4">
              💬 Get In Touch
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">We're here for you.</h2>
            <p className="text-slate-500 text-base font-medium max-w-md mx-auto leading-relaxed">
              Whether you have a question, need support, or just want to say hello — reach out anytime. You matter to us. 💜
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* LEFT COLUMN: THE FORM */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 shadow-lg shadow-indigo-100/50 border border-slate-100">
                {submitted ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-20 h-20 rounded-full mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-200">
                      ✓
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-3">Message Sent! 🎉</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      Thank you for reaching out. We'll get back to you within 12 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 rounded-2xl border-2 border-indigo-200 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg">
                        ✉️
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Send us a message</h3>
                        <p className="text-xs text-slate-400 font-medium">We typically reply within 12 hours</p>
                      </div>
                    </div>

                    <form onSubmit={handleContactSubmit}>
                      <div className="relative mb-5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                        <div className="relative">
                          <span className={`absolute left-4 top-3.5 transition-colors duration-200 ${focused === 'name' ? 'text-indigo-400' : 'text-slate-300'}`}>👤</span>
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-800 text-sm font-medium placeholder-slate-300 outline-none transition-all duration-200 focus:border-indigo-400 focus:bg-white focus:shadow-lg focus:shadow-indigo-100/50"
                          />
                        </div>
                      </div>

                      <div className="relative mb-5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                          <span className={`absolute left-4 top-3.5 transition-colors duration-200 ${focused === 'email' ? 'text-indigo-400' : 'text-slate-300'}`}>✉️</span>
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-800 text-sm font-medium placeholder-slate-300 outline-none transition-all duration-200 focus:border-indigo-400 focus:bg-white focus:shadow-lg focus:shadow-indigo-100/50"
                          />
                        </div>
                      </div>

                      <div className="relative mb-5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What's this about?</label>
                        <div className="flex flex-wrap gap-2">
                          {["🤔 General Question", "🆘 Need Support", "🐛 Report Issue", "💡 Suggestion"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedSubject(s)}
                              className={`px-4 py-2 rounded-full border-2 text-xs font-bold cursor-pointer transition-all duration-200 ${
                                selectedSubject === s 
                                ? "border-indigo-400 bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100" 
                                : "border-slate-100 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-50 hover:bg-indigo-50"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative mb-5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Message</label>
                        <textarea
                          required
                          rows={5}
                          maxLength={500}
                          placeholder="Tell us what's on your mind. We read every message carefully and respond with care 💜"
                          value={formData.message}
                          onChange={(e) => {
                            setFormData({ ...formData, message: e.target.value });
                            setCharCount(e.target.value.length);
                          }}
                          className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-800 text-sm font-medium placeholder-slate-300 outline-none resize-none transition-all duration-200 focus:border-indigo-400 focus:bg-white focus:shadow-lg focus:shadow-indigo-100/50"
                        />
                        <div className={`text-right text-xs mt-1 font-medium ${charCount > 400 ? 'text-amber-500' : 'text-slate-300'}`}>
                          {charCount}/500
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase text-white mt-6 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                          submitting 
                          ? 'bg-slate-300 cursor-not-allowed' 
                          : 'bg-[#0f172a] hover:bg-slate-800 hover:-translate-y-0.5 pointer-events-auto'
                        }`}
                      >
                        {submitting ? (
                          <>
                            <span className="animate-spin text-lg">◌</span>
                            Sending...
                          </>
                        ) : (
                          <>Send Message ✉️</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: INFO CARDS */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* CARD 1: DIRECT CONTACT */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md shadow-slate-100/50 animate-slide-up" style={{animationDelay:'0.1s'}}>
                <h3 className="text-base font-bold text-slate-800 mb-4">💬 Direct Contact</h3>
                
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm">✉️</div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Email Support</p>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">support@mindcare.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-sm">📞</div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Helpline</p>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">981727378</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-2.5 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-700 font-semibold">Usually responds in under 12 hours</span>
                </div>
              </div>

              {/* CARD 2: EMERGENCY */}
              <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border border-rose-100 shadow-md shadow-rose-100/30 animate-slide-up" style={{animationDelay:'0.2s'}}>
                <div className="text-2xl mb-1">🆘</div>
                <h3 className="text-base font-bold text-slate-800">In Crisis Right Now?</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-4">Immediate help is available 24/7</p>
                
                <Link to="/emergency" className="w-full py-3 rounded-2xl mb-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
                  Call Helpline Now
                </Link>
                <Link to="/emergency" className="w-full py-3 rounded-2xl bg-white border-2 border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 flex items-center justify-center gap-2">
                  📍 Find Support Center
                </Link>
                <p className="text-xs text-slate-400 text-center mt-3">If you are in immediate danger, call 112</p>
              </div>

              {/* CARD 3: FAQ */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md shadow-slate-100/50 animate-slide-up" style={{animationDelay:'0.3s'}}>
                <h3 className="text-base font-bold text-slate-800 mb-4">🔍 Common Questions</h3>
                
                {[
                  { q: "Is my data private and secure?", a: "Yes. All data is encrypted and never shared. You are always anonymous." },
                  { q: "How do I book a psychiatrist?", a: "Go to Premium → complete assessment → choose a doctor → pick a time slot." },
                  { q: "Is the AI chat free to use?", a: "Yes! The AI companion is completely free for all users with no limits." },
                  { q: "How does mood tracking work?", a: "Log daily moods, see weekly trends and get personalized insights over time." }
                ].map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <div 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group"
                    >
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600">{item.q}</span>
                      <span className={`text-slate-300 transition-all duration-200 group-hover:text-indigo-400 ${openFaq === idx ? 'rotate-90' : 'group-hover:translate-x-1'}`}>→</span>
                    </div>
                    {openFaq === idx && (
                      <div className="mt-2 p-3 bg-indigo-50 rounded-xl text-xs text-indigo-700 font-medium leading-relaxed border border-indigo-100 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM STRIP */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 py-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">🔒 End-to-end encrypted</div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">🕐 24/7 support available</div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">💜 Judgment-free zone</div>
          </div>
        </div>
      </section>

      {/* Addition 6 — FLOATING AI CHAT BUTTON */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20 pointer-events-none group-hover:hidden"></div>
            <button 
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2 bg-[#0f172a] text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 hover:-translate-y-2 transition-all duration-300 group overflow-hidden"
            >
                <span className="text-2xl">💬</span>
                <span className="max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-500 text-sm font-black uppercase tracking-widest pl-0 group-hover:pl-2">
                    Talk to AI
                </span>
            </button>
        </div>
      </div>

    </div>
  )
}

// --- Internal Components ---

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  link: string
  isComingSoon?: boolean
  noLinkStyle?: boolean
  extra?: React.ReactNode
  index?: number
}
const FeatureCard = ({ icon, title, description, link, isComingSoon, noLinkStyle, extra, index = 0 }: FeatureCardProps) => {
  const CardContent = (
    <div className="relative h-full min-h-[320px] bg-white flex flex-col rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 group-hover:border-transparent transition-all duration-300 z-10 overflow-hidden">
      {/* Subtle inner blue ray effect on top right */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400 opacity-0 group-hover:opacity-[0.15] blur-3xl rounded-full transition-opacity duration-700 pointer-events-none"></div>

      <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-indigo-100 shrink-0 relative z-10">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-2 tracking-tight relative z-10">
        {title}
        {isComingSoon && (
          <span className="text-[10px] uppercase font-black tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
            Soon
          </span>
        )}
      </h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed flex-1 relative z-10">
        {description}
      </p>
      
      {/* This spacer pushes 'extra' to the bottom and guarantees identical card heights! */}
      <div className="mt-auto w-full relative z-10 flex flex-col justify-end">
         {extra}
      </div>
    </div>
  )

  const containerClasses = "relative group block h-full animate-slide-up hover:-translate-y-2 transition-transform duration-500"

  // 1. The requested "Blue Rays" glowing shadow effect
  const GlowEffect = () => (
      <div className="absolute -inset-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 rounded-[2.2rem] opacity-0 group-hover:opacity-40 blur-lg transition duration-500 pointer-events-none"></div>
  )

  if (noLinkStyle) {
    return (
      <div className={containerClasses} style={{ animationDelay: `${index * 0.1}s` }}>
        <GlowEffect />
        {CardContent}
      </div>
    )
  }

  return (
    <Link to={link} className={containerClasses} style={{ animationDelay: `${index * 0.1}s` }}>
      <GlowEffect />
      {CardContent}
    </Link>
  )
}

export default Home
