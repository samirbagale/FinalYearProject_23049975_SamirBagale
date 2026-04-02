import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const EmergencySupport = () => {
    const navigate = useNavigate()

    // --- STATE ---
    const [planSaved, setPlanSaved] = useState(false)
    const [warnings, setWarnings] = useState<string[]>([])
    const [helpers, setHelpers] = useState<string[]>([])
    const [contact1, setContact1] = useState('')
    const [contact2, setContact2] = useState('')
    const [safePlace, setSafePlace] = useState('')

    const [breathRunning, setBreathRunning] = useState(false)
    const [breathPhase, setBreathPhase] = useState('ready')
    const [breathScale, setBreathScale] = useState(1)
    const [breathCycles, setBreathCycles] = useState(0)
    const [breathTime, setBreathTime] = useState(0)

    const [activeTimer, setActiveTimer] = useState<number | null>(null)
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [senseDone, setSenseDone] = useState<string[]>([])
    const [timerDone, setTimerDone] = useState(false)

    const breathRef = useRef<any>(null)
    const timerRef = useRef<any>(null)

    // --- BREATHING LOGIC (4-7-8) ---
    useEffect(() => {
        if (breathRunning) {
            let phase = 'inhale'
            let count = 4
            setBreathPhase('inhale')
            setBreathScale(1.15)
            setBreathTime(4)

            const runPhase = () => {
                if (phase === 'inhale') {
                    phase = 'hold'
                    count = 7
                    setBreathPhase('hold')
                    setBreathScale(1.15)
                    setBreathTime(7)
                } else if (phase === 'hold') {
                    phase = 'exhale'
                    count = 8
                    setBreathPhase('exhale')
                    setBreathScale(0.9)
                    setBreathTime(8)
                } else {
                    phase = 'inhale'
                    count = 4
                    setBreathPhase('inhale')
                    setBreathScale(1.15)
                    setBreathCycles(prev => prev + 1)
                    setBreathTime(4)
                }

                let internalCount = count
                const countdown = setInterval(() => {
                    internalCount--
                    setBreathTime(internalCount)
                    if (internalCount <= 0) clearInterval(countdown)
                }, 1000)

                breathRef.current = setTimeout(runPhase, count * 1000)
            }

            let firstCount = 4
            const firstCountdown = setInterval(() => {
                firstCount--
                setBreathTime(firstCount)
                if (firstCount <= 0) clearInterval(firstCountdown)
            }, 1000)
            
            breathRef.current = setTimeout(runPhase, 4000)
        } else {
            clearTimeout(breathRef.current)
            setBreathPhase('ready')
            setBreathScale(1)
            setBreathTime(0)
        }
        return () => clearTimeout(breathRef.current)
    }, [breathRunning])

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (activeTimer) {
            setTimerDone(false)
            setTimerSeconds(activeTimer * 60)
            timerRef.current = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current)
                        setActiveTimer(null)
                        setTimerDone(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(timerRef.current)
    }, [activeTimer])

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    const toggleArray = (val: string, getter: string[], setter: any) => {
        if (getter.includes(val)) setter(getter.filter(i => i !== val))
        else setter([...getter, val])
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-50 font-['Plus_Jakarta_Sans'] text-slate-700 selection:bg-blue-100 overflow-x-hidden animate-fade-up">
            
            {/* Soft Blue Blobs for Visual Richness */}
            <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none z-0"></div>

            {/* --- TOP EMERGENCY BAR --- */}
            <div className="relative z-50 w-full bg-red-600/5 backdrop-blur-sm border-b border-red-200 py-3.5 px-6 flex items-center justify-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-[blink_1.5s_infinite]"></div>
                <span className="text-red-600 text-sm font-bold tracking-tight">
                    Emergency: If you are in immediate danger, <a href="tel:100" className="underline font-black hover:text-red-700 transition-colors">call 100 now</a>
                </span>
            </div>

            {/* --- SECTION 1: HERO --- */}
            <section className="relative z-10 w-full pt-20 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    
                    {/* Shield Icon with Glow */}
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-x-0 bottom-0 top-0 bg-blue-400/20 rounded-full blur-2xl"></div>
                        <div className="relative w-full h-full rounded-3xl bg-white border border-blue-100 shadow-xl shadow-blue-100/50 flex items-center justify-center animate-bounce-gentle">
                             <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                        You are not alone.<br/>
                        <span className="text-blue-600">Help is here right now.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                        In this moment, your safety is everything. Access immediate support from verified professionals and local helplines.
                    </p>

                    <div className="relative inline-block mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-[pulse-ring_1.5s_ease-out_infinite]"></div>
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-[pulse-ring_1.5s_ease-out_infinite] [animation-delay:0.5s]"></div>
                        
                        <a href="tel:1166" className="relative z-10 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-lg px-12 py-5 rounded-full shadow-2xl shadow-red-500/40 flex items-center gap-3 mx-auto hover:from-red-600 hover:to-rose-700 hover:scale-105 active:scale-95 transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            Call Crisis Line Now
                        </a>
                    </div>
                    
                    {/* Support Chips */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        <div className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm flex items-center gap-2 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 24/7 Available
                        </div>
                        <div className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm flex items-center gap-2 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Fully Confidential
                        </div>
                        <div className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm flex items-center gap-2 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Pro Listening
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: QUICK ACTION CARDS --- */}
            <section className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Immediate Emergency Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => window.location.href='tel:1166'} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-200/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                        <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 text-red-500 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Call 1166</h3>
                        <p className="text-xs text-red-600 font-black mt-1 uppercase tracking-widest leading-relaxed">Suicide & Crisis</p>
                        <p className="text-sm text-slate-500 mt-3 font-medium">Click to talk immediately</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-200/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Text 741741</h3>
                        <p className="text-xs text-blue-600 font-black mt-1 uppercase tracking-widest leading-relaxed">Crisis Text Line</p>
                        <p className="text-sm text-slate-500 mt-3 font-medium">Text "HOME" to start chat</p>
                    </div>

                    <div onClick={() => window.location.href='tel:100'} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-200/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 text-amber-500 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Call 100</h3>
                        <p className="text-xs text-amber-600 font-black mt-1 uppercase tracking-widest leading-relaxed">Nepal Police</p>
                        <p className="text-sm text-slate-500 mt-3 font-medium">Physical danger response</p>
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: SAFETY PLAN BUILDER --- */}
            <section className="max-w-4xl mx-auto px-6 pb-20 relative z-10">
                <div className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    
                    <div className="relative z-10 mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-3 flex items-center gap-3">
                            <span className="text-3xl">📋</span> Your Safety Protocol
                        </h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
                            A preparedness plan significantly reduces panic levels. Build your personalized strategy here.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        {/* Progressive Step Cards */}
                        {[
                            { step: 1, title: "Trusted Contacts", desc: "Two people you can call right now", content: (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <input value={contact1} onChange={(e)=>setContact1(e.target.value)} type="text" placeholder="Name & Phone Number 1" className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-slate-900 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300" />
                                    <input value={contact2} onChange={(e)=>setContact2(e.target.value)} type="text" placeholder="Name & Phone Number 2" className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-slate-900 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300" />
                                </div>
                            )},
                            { step: 2, title: "Warning Signs", desc: "Common indicators that you need support", content: (
                                <div className="flex flex-wrap gap-2.5 mt-4">
                                    {["Racing thoughts", "Isolation", "Sleep issues", "Hopelessness", "High agitation"].map(s => (
                                        <div key={s} onClick={()=>toggleArray(s, warnings, setWarnings)} className={`px-5 py-2.5 rounded-full border-2 text-xs font-bold cursor-pointer transition-all ${warnings.includes(s) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )},
                            { step: 3, title: "Coping Strategies", desc: "Small actions that help you ground yourself", content: (
                                <div className="flex flex-wrap gap-2.5 mt-4">
                                    {["Deep breath", "Cold wash", "Go outside", "Call friend", "Soft music"].map(h => (
                                        <div key={h} onClick={()=>toggleArray(h, helpers, setHelpers)} className={`px-5 py-2.5 rounded-full border-2 text-xs font-bold cursor-pointer transition-all ${helpers.includes(h) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'}`}>
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            )},
                            { step: 4, title: "Your Safe Haven", desc: "Describe your ideal physical or mental safe space", content: (
                                <textarea rows={3} value={safePlace} onChange={(e)=>setSafePlace(e.target.value)} placeholder="e.g. My study with warm lighting and the sound of rain..." className="w-full mt-4 bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl text-slate-900 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 resize-none"></textarea>
                            )}
                        ].map(item => (
                            <div key={item.step} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm">{item.step}</div>
                                     <div>
                                        <h3 className="text-slate-900 font-black text-lg leading-none">{item.title}</h3>
                                        <p className="text-slate-400 text-xs font-bold mt-1.5 uppercase tracking-wide">{item.desc}</p>
                                     </div>
                                </div>
                                {item.content}
                            </div>
                        ))}
                    </div>

                    <button onClick={() => {
                        setPlanSaved(true)
                        setTimeout(() => setPlanSaved(false), 2000)
                    }} className={`w-full py-5 mt-10 rounded-[2rem] font-black tracking-widest uppercase text-sm transition-all shadow-xl active:scale-95 ${planSaved ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}>
                        {planSaved ? "✓ Protocol Established" : "Save Safety Protocol"}
                    </button>
                </div>
            </section>

            {/* --- SECTION 4: UPGRADED BREATHING --- */}
            <section className="max-w-4xl mx-auto px-6 pb-20 relative z-10">
                <div className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-12 shadow-2xl shadow-slate-200/40 text-center">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center justify-center gap-2">🫁 Pulmonary Regulate</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Medical-grade 4-7-8 breathing to rapidly lower cortisol levels.</p>
                    </div>

                    <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
                        {/* Glow Layers */}
                        <div className="absolute inset-0 rounded-full bg-blue-400/5 transition-transform duration-1000" style={{transform: `scale(${breathScale})`}}></div>
                        <div className="absolute inset-[-16px] rounded-full bg-blue-300/3 transition-transform duration-1000" style={{transform: `scale(${breathScale})`}}></div>
                        
                        <div 
                            className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out border-4 font-bold ${
                                breathPhase === 'ready' ? 'bg-slate-50 border-slate-200 text-slate-300' :
                                breathPhase === 'inhale' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                breathPhase === 'hold' ? 'bg-cyan-50 border-cyan-200 text-cyan-600' :
                                'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner'
                            }`}
                            style={{ transform: `scale(${breathScale})` }}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">{breathPhase === 'ready' ? 'Ready' : 'Phase'}</span>
                            <span className="text-3xl font-black uppercase tracking-widest">{breathPhase === 'ready' ? 'Start' : breathPhase}</span>
                            {breathRunning && (
                                <span className="text-4xl font-black mt-2 tabular-nums">{breathTime}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-lg mx-auto">
                        {[
                            { name: 'Inhale', t: '4s', k: 'inhale', color: 'bg-blue-500' },
                            { name: 'Hold', t: '7s', k: 'hold', color: 'bg-cyan-500' },
                            { name: 'Exhale', t: '8s', k: 'exhale', color: 'bg-indigo-500' }
                        ].map(p => (
                            <div key={p.k} className={`px-8 py-3 rounded-2xl border-2 transition-all flex flex-col items-center min-w-[120px] ${breathPhase === p.k ? `bg-white border-slate-900 shadow-lg` : 'bg-slate-50 border-transparent'}`}>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${breathPhase === p.k ? 'text-slate-900' : 'text-slate-400'}`}>{p.name}</h4>
                                <p className={`text-xl font-black mt-1 ${breathPhase === p.k ? 'text-slate-900' : 'text-slate-300'}`}>{p.t}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <button onClick={()=>setBreathRunning(!breathRunning)} className={`px-14 py-4 rounded-full font-black text-sm tracking-widest uppercase transition-all shadow-xl active:scale-95 ${breathRunning ? 'bg-slate-200 text-slate-500 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-black'}`}>
                            {breathRunning ? "Terminate Cycle" : "Initiate Exercise"}
                        </button>
                        <div className="flex gap-3">
                             {[1,2,3,4,5].map(i => <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${breathCycles >= i ? 'bg-blue-600 scale-125' : 'bg-slate-100'}`}></div>)}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 5: LOCAL NEPAL HELPLINES --- */}
            <section className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Nepal Mental Health Helplines</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { name: "iCall Nepal", spec: "Counselling & Emotional Support", hours: "Mon–Sat 8am–10pm", tel: "9152987821", icon: "🟢" },
                        { name: "Vandrevala Foundation", spec: "24/7 Professional Helpline", hours: "Always Active", tel: "18602662345", icon: "🔵" },
                        { name: "AASRA Support", spec: "Crisis & Suicide Prevention", hours: "24/7 Immediate Response", tel: "9820466627", icon: "🔴" },
                        { name: "TPO Nepal", spec: "Trauma & Psychosocial Care", hours: "Standard Office Hours", tel: "014168100", icon: "🟡" },
                        { name: "Snehi Foundation", spec: "Empathetic Listening", hours: "24/7 Ongoing Support", tel: "04424640050", icon: "🟣" },
                        { name: "Global Helpline", spec: "International Crisis Directory", hours: "Resource Search", link: "https://findahelpline.com", icon: "⚪" }
                    ].map(h => (
                        <div key={h.name} className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center gap-6 hover:shadow-xl hover:border-white transition-all group">
                            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                {h.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-slate-900 font-black text-base">{h.name}</h3>
                                <p className="text-slate-500 text-xs font-bold mt-0.5">{h.spec}</p>
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-2">{h.hours}</p>
                            </div>
                            {h.tel ? (
                                <a href={`tel:${h.tel}`} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Call</a>
                            ) : (
                                <a href={h.link} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all">Link</a>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* --- SECTION 6: COPING TOOLKIT --- */}
            <section className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
                <div className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/40">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">🧰 Crisis Management Toolkit</h2>
                        <p className="text-slate-500 font-medium text-lg">Rapid deployment tools for immediate nervous system regulation.</p>
                    </div>
                
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* TOOL 1: ICE WATER */}
                        <div className="bg-blue-50/40 border border-blue-100/50 rounded-[2.5rem] p-8 hover:bg-white transition-all duration-500 group border-dashed hover:border-solid hover:shadow-xl">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><span className="text-2xl">❄️</span> Cold Water Pulse</h3>
                            <div className="space-y-4">
                                {[
                                    "Submerge face in bowl of ice-cold water.",
                                    "Hold for 15-30 seconds if possible.",
                                    "Repeat cycle 3 times.",
                                    "Dives reflex initiates instant heart rate drop."
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i+1}</div>
                                        <p className="text-sm text-slate-500 font-bold leading-relaxed">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TOOL 2: 5 SENSES */}
                        <div className="bg-cyan-50/40 border border-cyan-100/50 rounded-[2.5rem] p-8 hover:bg-white transition-all duration-500 group border-dashed hover:border-solid hover:shadow-xl">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><span className="text-2xl">🌿</span> Sensory Anchoring</h3>
                            <div className="grid gap-2">
                                {[
                                    { n: 5, t: "VISUAL OBJECTS" },
                                    { n: 4, t: "TACTILE TEXTURES" },
                                    { n: 3, t: "AUDITORY SOUNDS" },
                                    { n: 2, t: "OLFACTORY SCENTS" },
                                    { n: 1, t: "GUSTATORY TASTE" }
                                ].map(s => (
                                    <div key={s.n} onClick={()=>toggleArray(s.t, senseDone, setSenseDone)} className={`flex items-center justify-between px-5 py-3 rounded-2xl border-2 transition-all cursor-pointer font-bold text-[11px] ${senseDone.includes(s.t) ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-cyan-200'}`}>
                                        <span className="tracking-widest capitalize">{s.n} {s.t}</span>
                                        {senseDone.includes(s.t) && <span>✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TOOL 3: SAFETY STATEMENT */}
                        <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-[2.5rem] p-8 hover:bg-white transition-all duration-500 border-dashed hover:border-solid hover:shadow-xl">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><span className="text-2xl">💜</span> Verbal Affirmation</h3>
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 mb-6 shadow-sm">
                                <p className="text-xl font-serif italic text-slate-700 leading-relaxed text-center">
                                    "This feeling is a wave, not the ocean. I am safe in this breath. This will pass."
                                </p>
                            </div>
                            <button onClick={() => {
                                navigator.clipboard.writeText("This feeling is a wave, not the ocean. I am safe in this breath. This will pass.")
                            }} className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Copy Statement</button>
                        </div>

                        {/* TOOL 4: DISTRACT & DELAY */}
                        <div className="bg-amber-50/40 border border-amber-100/50 rounded-[2.5rem] p-8 hover:bg-white transition-all duration-500 border-dashed hover:border-solid hover:shadow-xl">
                            <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3"><span className="text-2xl">⏱️</span> Urge Deferral</h3>
                            <p className="text-sm text-slate-500 font-bold mb-6 italic">If impulses feel intense, commit to a 10-20 minute delay.</p>
                            
                            <div className="grid grid-cols-3 gap-2">
                                {[10, 20, 30].map(m => (
                                    <button key={m} onClick={()=>setActiveTimer(m)} className={`py-4 rounded-2xl border-2 font-black text-xs transition-all ${activeTimer === m ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white border-slate-100 text-slate-500 hover:border-amber-200'}`}>
                                        {m}m
                                    </button>
                                ))}
                            </div>

                            {activeTimer || timerDone ? (
                                <div className="mt-10 p-6 rounded-[2rem] bg-white border border-slate-100 text-center animate-fade-in shadow-xl shadow-slate-100">
                                    {timerSeconds > 0 ? (
                                        <>
                                            <div className="text-slate-900 font-black text-4xl tracking-tighter tabular-nums">
                                                {formatTime(timerSeconds)}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">Commit to the pause</p>
                                            <button 
                                                onClick={() => {
                                                    setActiveTimer(null)
                                                    setTimerSeconds(0)
                                                }}
                                                className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                                            >
                                                Stop Timer
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-emerald-600 font-black text-sm uppercase tracking-widest py-2 animate-bounce">
                                            ✓ The Moment Is Passing
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 7: NON-CRISIS SUPPORT --- */}
            <section className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
                <div className="py-16 border-t border-slate-200 bg-white/50 backdrop-blur-sm rounded-[4rem] px-8 md:px-16 border-dashed border-2">
                    <p className="text-center text-slate-400 text-xs font-black uppercase tracking-[0.4em] mb-12">Support Continuity</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all cursor-pointer group" onClick={()=>navigate('/chat')}>
                            <div className="w-20 h-20 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">💬</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">AI Support Assistant</h3>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">Empathetic, judgment-free processing of your current emotions. Available every second.</p>
                            <span className="bg-blue-600 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100 group-hover:px-14 transition-all">Begin Chat</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all cursor-pointer group" onClick={()=>navigate('/premium')}>
                            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform shadow-inner">👨‍⚕️</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Licensed Psychiatrists</h3>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">Formal clinical intervention and long-term therapy sessions with verified specialists.</p>
                            <span className="bg-indigo-600 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 group-hover:px-14 transition-all">Secure Booking</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="text-center pb-20 px-6">
                <div className="max-w-md mx-auto py-10 border-t border-slate-200">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
                        MindCare Safety Portal · Secure Environment · End-to-End Privacy · 2026 Edition
                    </p>
                </div>
            </footer>

        </div>
    )
}

export default EmergencySupport
