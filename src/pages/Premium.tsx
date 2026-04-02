import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const STYLE_TAG = `
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes fillBar {
  from { width: 0%; }
  to { width: 100%; }
}
@keyframes drawCheck {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
@keyframes breatheIn {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}
@keyframes buttonPulse {
  0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}
@keyframes successPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(37, 99, 235, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}
@keyframes iconReveal {
  from { stroke-dashoffset: 100; transform: scale(0.5); opacity: 0; }
  to { stroke-dashoffset: 0; transform: scale(1); opacity: 1; }
}
@keyframes floatSoft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}
.hero-gradient {
  background: radial-gradient(circle at top right, #f5f3ff 0%, #ffffff 50%, #faf5ff 100%);
}
`

const EXPERIENCES = [
  { label: 'Anxiety', emoji: '😰' },
  { label: 'Depression', emoji: '😔' },
  { label: 'Stress', emoji: '😤' },
  { label: 'Relationships', emoji: '💔' },
  { label: 'Grief & Loss', emoji: '😢' },
  { label: 'Trauma', emoji: '😱' },
  { label: 'Sleep Issues', emoji: '😴' },
  { label: 'Low Self-Esteem', emoji: '😶' },
  { label: 'Anger', emoji: '😠' }
];

// SEED_DOCTORS removed as data is now fetched from backend

const GOALS = [
  { label: 'Feel Better', desc: 'Reduce symptoms and feel relief', emoji: '🌱' },
  { label: 'Understand Myself', desc: 'Gain insight into my patterns', emoji: '🧠' },
  { label: 'Manage Symptoms', desc: 'Build coping strategies', emoji: '⚡' },
  { label: 'Build Resilience', desc: 'Strengthen my mental health', emoji: '💪' },
  { label: 'Improve Relationships', desc: 'Communication and connection', emoji: '🤝' },
  { label: 'Personal Growth', desc: 'Become the best version of myself', emoji: '✨' }
];

const PAYMENT_METHODS = [
  { id: 'esewa', name: 'eSewa', sub: "Nepal's leading digital wallet", popular: true, color: '#60BB46' },
  { id: 'khalti', name: 'Khalti', sub: 'Digital wallet and bank payment', color: '#5C2D91' },
  { id: 'ime', name: 'IME Pay', sub: 'IME Digital Solution wallet', color: '#E21B1B' },
  { id: 'connectips', name: 'ConnectIPS', sub: 'Direct bank transfer via NCHL', color: '#1B3A6B' },
  { id: 'card', name: 'Debit / Credit Card', sub: 'Visa, Mastercard, SCT — OTP verified', isCard: true }
];

const NEPALI_BANKS = [
  'Nepal Investment Mega Bank', 'Nabil Bank', 'NIC Asia Bank',
  'Himalayan Bank', 'Standard Chartered Nepal', 'Everest Bank', 
  'Kumari Bank', 'Laxmi Sunrise Bank', 'Rastriya Banijya Bank', 'Nepal Bank Limited'
];


const DoctorAvatar = ({ doctor, size = 64 }: { doctor: any, size?: number }) => {
  const [imgError, setImgError] = useState(false)
  if (doctor?.photoUrl && !imgError) {
    return (
      <img src={doctor.photoUrl} alt={doctor.name} onError={() => setImgError(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }} />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: doctor?.gradient || 'linear-gradient(135deg, #ddd6fe, #c4b5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: 900, color: 'white', border: '2px solid white', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
      {doctor?.initials || doctor?.name?.split(' ').map((n: string) => n[0]).join('').substring(0,2) || 'DR'}
    </div>
  )
};

const Premium = () => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<number | string>(1);
  const [assessmentSubStep, setAssessmentSubStep] = useState(1);
  const [viewingProfile, setViewingProfile] = useState<any>(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, assessmentSubStep, viewingProfile]);

  // Payment State
  const [payMethod, setPayMethod] = useState('esewa');
  const [payLoading, setPayLoading] = useState(false);
  const [mobileNum, setMobileNum] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selBank, setSelBank] = useState('');
  const [ipsUser, setIpsUser] = useState('');
  const [payError, setPayError] = useState('');

  // Form State
  const [intensity, setIntensity] = useState(3);
  const [feelingSafe, setFeelingSafe] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [therapistGenderPref, setTherapistGenderPref] = useState('No Preference');
  const [sessionFormatPref, setSessionFormatPref] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [hadTherapyBefore, setHadTherapyBefore] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');

  // Flow State
  const [, setMatchingPhase] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const [crisisBypass, setCrisisBypass] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All Specialties');
  const [isChatActive, setIsChatActive] = useState(false);
  const [replyToMsg, setReplyToMsg] = useState<any | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
        const { scrollHeight, clientHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTo({
            top: scrollHeight - clientHeight,
            behavior
        });
    }
  };

  useEffect(() => {
    if (chatHistory.length > 0 && step === 9) {
        scrollToBottom('smooth');
    }
  }, [chatHistory, step]);

  // Breathing state
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'Inhale') return 'Hold';
          if (prev === 'Hold') return 'Exhale';
          return 'Inhale';
        });
      }, 4000); // simplify: just rotate every 4s for demo
    }
    return () => clearInterval(interval);
  }, [isBreathing]);


  // Fetch Real Doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/psychiatrists');
        const data = await response.json();
        if (data.success) {
          const formatted = data.data
              .map((d: any) => ({
                id: d._id,
                name: d.username,
                creds: d.credentials || 'MBBS, MD',
                exp: d.experience ? `${d.experience} years` : '5+ years',
                rating: d.rating || '4.8',
                sessions: d.sessions || 100,
                specialties: (d.specialties && d.specialties.length > 0) ? d.specialties : ['General Mental Health'],
                languages: d.languages || 'English, Nepali',
                bio: d.bio || 'Professional specialist focused on mental wellness.',
                quote: d.quote,
                approaches: d.approaches || [],
                education: d.education || [],
                helps: d.helps || [],
                stats: d.stats || [],
                photoUrl: d.profilePhoto || null,
                gradient: d.gradient || 'linear-gradient(135deg, #ddd6fe, #c4b5fd)',
                initials: d.username.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
                formats: { video: true, text: true },
                slots: ['Today 10:00 AM', 'Today 2:00 PM', 'Today 7:30 PM']
            }));
          setDoctors(formatted);
          if (formatted.length > 0) setSelectedDoctor(formatted[0]);
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [user?.id]);

  // Clear chat history when doctor selection or user changes
  useEffect(() => {
    setChatHistory([]);
  }, [selectedDoctor?.id, user?.id]);

  // Sync Messages with Backend
  useEffect(() => {
    let syncInterval: any;

    const fetchMessages = async () => {
      if (!selectedDoctor || step !== 9) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`http://127.0.0.1:5000/api/messages/${selectedDoctor.id}?t=${Date.now()}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        const data = await response.json();
        if (data.success) {
          const formatted = data.data.map((m: any) => ({
            id: m._id,
            sender: m.sender.toString() === selectedDoctor.id.toString() ? 'doctor' : 'user',
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            replyTo: m.replyTo
          }));
          
          setChatHistory(prev => {
              if (JSON.stringify(formatted) !== JSON.stringify(prev)) {
                  return formatted;
              }
              return prev;
          });
        }
      } catch (err) {
        console.error("Failed to sync messages", err);
      }
    };

    if (step === 9 && selectedDoctor) {
      fetchMessages();
      syncInterval = setInterval(fetchMessages, 3000);
    }

    return () => {
      clearInterval(syncInterval);
    };
  }, [step, selectedDoctor?.id, user?.id]); 


  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const toggleAvailability = (slot: string) => {
    if (availability.includes(slot)) {
      setAvailability(availability.filter(s => s !== slot));
    } else {
      setAvailability([...availability, slot]);
    }
  };

  const runMatchingAnimation = () => {
    setStep(6);
    setMatchingPhase(true);
    setMatchingProgress(0);
    setTimeout(() => setMatchingProgress(1), 600);
    setTimeout(() => setMatchingProgress(2), 1200);
    setTimeout(() => setMatchingProgress(3), 1800);
    setTimeout(() => setMatchingProgress(4), 2400);
    setTimeout(() => {
      setMatchingPhase(false);
      setStep(7);
    }, 2500);
  };

  const handleAssessmentNext = () => {
    if (assessmentSubStep === 1) {
      setAssessmentSubStep(2);
    } else if (assessmentSubStep === 2) {
      setAssessmentSubStep(3);
    } else {
      const isCrisis = feelingSafe === 'no' || intensity === 5;
      if (isCrisis && !crisisBypass) {
        setStep(5); // Crisis
      } else {
        runMatchingAnimation();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedDoctor) return;
    if (!selectedDoctor.id) {
        alert("Target doctor not identified. Please try re-selecting a specialist.");
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Session expired. Please log in again.");
        return;
    }

    const msgText = message;
    const currentReplyId = replyToMsg?._id || replyToMsg?.id;
    setMessage('');
    setReplyToMsg(null);
    
    // Optimistic update with a unique temp ID to avoid sync wipe-out
    const tempId = 'temp-' + Date.now();
    setChatHistory(prev => [...prev, { 
      id: tempId, 
      sender: 'user', 
      text: msgText, 
      time: 'Sending...',
      replyTo: replyToMsg // Keep context for optimistic UI
    }]);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: selectedDoctor.id,
          content: msgText,
          replyTo: currentReplyId
        })
      });
      const data = await response.json();
      if (!data.success) {
          console.error("Message send failed:", data.error);
          alert("Failed to send: " + data.error);
          // Rollback local change
          setChatHistory(prev => prev.filter(m => m.id !== tempId));
      } else {
          // Update temp message with real data from server
          setChatHistory(prev => prev.map(m => m.id === tempId ? {
              id: data.data._id,
              sender: 'user',
              text: data.data.content,
              time: new Date(data.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              replyTo: data.data.replyTo
          } : m));
      }
    } catch (e) {
      console.error("Failed to send message", e);
      alert("Network error. Please check your connection.");
      setChatHistory(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const commonCardStyle = {
    background: '#fff',
    border: '1.5px solid #f1f5f9',
    borderRadius: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  };

  // UI RENDERING

  if (step === 1) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#ffffff', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
        <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
        
        {/* Background Decorations */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0) 70%)', borderRadius: '50%', filter: 'blur(60px)', animation: 'pulseGlow 8s ease-in-out infinite', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '35%', height: '35%', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0) 70%)', borderRadius: '50%', filter: 'blur(50px)', animation: 'pulseGlow 10s ease-in-out infinite reverse', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '15%', height: '15%', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'float 12s ease-in-out infinite', zIndex: 0 }}></div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* HERO SECTION */}
          <div style={{ animation: 'fadeSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37, 99, 235, 0.08)', padding: '8px 16px', borderRadius: '100px', marginBottom: 24, border: '1px solid rgba(37, 99, 235, 0.1)' }}>
              <span style={{ fontSize: 14, color: '#2563eb', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Premium Support Service</span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, color: '#0f172a', marginBottom: 24, letterSpacing: '-1px', lineHeight: 1.1 }}>
              Talk to a <span style={{ background: 'linear-gradient(135deg, #0f172a, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Professional</span>
            </h1>
            <p style={{ fontSize: 'clamp(18px, 4vw, 20px)', color: '#475569', marginBottom: 48, maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 500 }}>
              Connect with India's leading licensed psychologists and psychiatrists from the comfort of your home. 
              Compassionate, private, and tailored to your unique journey.
            </p>
          </div>

          {/* HOW IT WORKS SECTION */}
          <div style={{ marginBottom: 64, animation: 'fadeSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards', opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
              {[
                { icon: '📋', title: 'Assessment', desc: "Share your thoughts and feelings through our clinical-grade assessment.", color: '#2563eb' },
                { icon: '🤝', title: 'Match', desc: 'Get matched with the perfect specialist based on your unique needs.', color: '#ec4899' },
                { icon: '✨', title: 'Session', desc: 'Join a secure, private session and start your path to healing.', color: '#0ea5e9' }
              ].map((item) => (
                <div 
                  key={item.title} 
                  className="glass-card"
                  style={{ 
                    padding: 40, 
                    borderRadius: 32, 
                    textAlign: 'left',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.07)';
                  }}
                >
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    background: `${item.color}15`, 
                    borderRadius: 20, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 32, 
                    marginBottom: 24,
                    border: `1px solid ${item.color}20`
                  }}>
                    {item.icon}
                  </div>
                  <h4 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>{item.title}</h4>
                  <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA SECTION */}
          <div style={{ animation: 'fadeSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards', opacity: 0 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setStep(2)}
                style={{ 
                  padding: '20px 56px', 
                  background: 'linear-gradient(135deg, #0f172a, #2563eb)', 
                  color: '#fff', 
                  borderRadius: 100, 
                  fontWeight: 800, 
                  fontSize: 18, 
                  border: 'none', 
                  cursor: 'pointer', 
                  boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'buttonPulse 2s infinite',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.3)';
                }}
              >
                Start Your Assessment
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.16666 10H15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 4.16666L15.8333 10L10 15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* TRUST ELEMENTS */}
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
                {[
                  { icon: '🛡️', text: 'Secure' },
                  { icon: '🎥', text: 'Video' },
                  { icon: '🎓', text: 'Licensed' }
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.3px', background: 'rgba(148, 163, 184, 0.05)', padding: '6px 16px', borderRadius: '100px' }}>
                Confidential • Secure • Professional
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STEPS 2, 3, 4: ASSESSMENT ---
  if (step === 2) {
    return (
      <div className="font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50/50 min-h-screen py-12 px-4 sm:px-6">
        <style dangerouslySetInnerHTML={{ __html: `
          ${STYLE_TAG}
          input[type='range']::-webkit-slider-runnable-track {
            background: #e2e8f0;
            height: 8px;
            border-radius: 10px;
          }
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #2563eb;
            box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.1);
            cursor: pointer;
            margin-top: -8px;
          }
        ` }} />
        
        <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Progress Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
              {[1, 2, 3].map(st => {
                const isActive = assessmentSubStep === st;
                const isCompleted = assessmentSubStep > st;
                return (
                  <div key={st} className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500 text-white scale-90' : 
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{st}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {st === 1 ? 'Feeling' : st === 2 ? 'Prefer' : 'Goals'}
                    </span>
                  </div>
                );
              })}
              {/* Connector Lines */}
              <div className="absolute top-[4.2rem] left-16 right-16 h-[2px] bg-slate-100 -z-0">
                <div 
                  className="h-full bg-blue-600 transition-all duration-700 ease-in-out" 
                  style={{ width: assessmentSubStep === 1 ? '0%' : assessmentSubStep === 2 ? '50%' : '100%' }}
                />
              </div>
            </div>
          </div>

          {/* SUB-STEP 1: EXPERIENCES */}
          {assessmentSubStep === 1 && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">How are you feeling?</h2>
                <p className="text-slate-500 font-medium">Select anything that's been on your mind lately.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 text-center">
                {EXPERIENCES.map(opt => {
                  const isSel = selectedConcerns.includes(opt.label);
                  return (
                    <button 
                      key={opt.label} 
                      onClick={() => toggleConcern(opt.label)} 
                      className={`group p-4 rounded-3xl border-2 transition-all duration-300 transform active:scale-95 ${
                        isSel 
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                          : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'
                      }`}
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{opt.emoji}</div>
                      <div className={`text-xs font-bold leading-tight ${isSel ? 'text-blue-700' : 'text-slate-600'}`}>{opt.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mb-10 p-6 bg-slate-50/80 rounded-3xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-wide">Intensity Level</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                    intensity === 5 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {intensity === 1 ? 'Mild' : intensity === 3 ? 'Medium' : intensity === 5 ? 'Severe' : intensity > 3 ? 'High' : 'Low'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={intensity} 
                  onChange={(e) => setIntensity(parseInt(e.target.value))} 
                  className="w-full h-2 mb-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="mb-10">
                <label className="block text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Are you feeling safe right now?</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setFeelingSafe('yes')} 
                    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all border-2 flex items-center justify-center gap-3 ${
                      feelingSafe === 'yes' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/30'
                    }`}
                  >
                    <span className="text-lg">✨</span> Yes, I'm safe
                  </button>
                  <button 
                    onClick={() => setFeelingSafe('no')} 
                    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all border-2 flex items-center justify-center gap-3 ${
                      feelingSafe === 'no' 
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-inner' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-rose-200 hover:bg-rose-50/30'
                    }`}
                  >
                    <span className="text-lg">🆘</span> I need help
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAssessmentNext} 
                disabled={!feelingSafe} 
                className={`w-full py-5 rounded-[1.25rem] font-black text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  feelingSafe 
                    ? 'bg-gradient-to-r from-slate-950 to-blue-700 text-white hover:scale-[1.02] active:scale-95 shadow-blue-500/20' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Continue <span className="text-xl">➔</span>
              </button>
            </div>
          )}

          {/* SUB-STEP 2: PREFERENCES */}
          {assessmentSubStep === 2 && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Customize your care</h2>
                <p className="text-slate-500 font-medium">This helps us find your ideal specialist.</p>
              </div>
              
              <div className="space-y-6 mb-10">
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Therapist gender preference</label>
                  <div className="flex p-1 bg-white rounded-2xl border border-slate-100">
                    {['No Preference', 'Female', 'Male'].map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => setTherapistGenderPref(opt)} 
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                          therapistGenderPref === opt ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Session Format</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'video', icon: '📹', title: 'Video Call', desc: 'Face-to-face' },
                      { id: 'text', icon: '💬', title: 'Text Chat', desc: 'Message' }
                    ].map(opt => (
                      <button 
                        key={opt.id} 
                        onClick={() => setSessionFormatPref(opt.id)} 
                        className={`flex-1 p-5 rounded-2xl border-2 transition-all text-left ${
                          sessionFormatPref === opt.id 
                            ? 'bg-white border-blue-600 shadow-md' 
                            : 'bg-white border-transparent hover:border-blue-100 hover:shadow-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                        }`}
                      >
                        <div className="text-2xl mb-2">{opt.icon}</div>
                        <div className={`text-sm font-black ${sessionFormatPref === opt.id ? 'text-blue-600' : 'text-slate-700'}`}>{opt.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Preferred Availability</label>
                  <div className="flex flex-wrap gap-2">
                    {['🌅 Morning', '☀️ Afternoon', '🌆 Evening', '🌙 Night'].map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => toggleAvailability(opt)} 
                        className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                          availability.includes(opt) 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-transparent bg-white shadow-sm text-slate-500 hover:border-blue-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Have you been in therapy before?</label>
                  <div className="flex gap-3">
                    {['Yes, I have', 'No, first time'].map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => setHadTherapyBefore(opt)} 
                        className={`flex-1 py-4 px-2 rounded-2xl font-bold transition-all border-2 text-center text-sm ${
                          hadTherapyBefore === opt 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-100 text-slate-500 hover:border-blue-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setAssessmentSubStep(1)} 
                  className="px-8 py-5 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all font-black"
                >
                  ← Back
                </button>
                <button 
                  onClick={handleAssessmentNext} 
                  className="flex-1 py-5 rounded-[1.25rem] bg-gradient-to-r from-slate-950 to-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Next ➔
                </button>
              </div>
            </div>
          )}

          {/* SUB-STEP 3: GOALS */}
          {assessmentSubStep === 3 && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">What's your goal?</h2>
                <p className="text-slate-500 font-medium">Select the main outcome you're hoping for.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {GOALS.map(goal => {
                  const isSel = selectedGoal === goal.label;
                  return (
                    <button 
                      key={goal.label} 
                      onClick={() => setSelectedGoal(goal.label)} 
                      className={`relative p-6 rounded-3xl border-2 transition-all text-left group ${
                        isSel 
                          ? 'border-blue-600 bg-blue-50/30' 
                          : 'border-slate-100 bg-white hover:border-blue-100 hover:shadow-md'
                      }`}
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{goal.emoji}</div>
                      <div className={`text-base font-black mb-1 ${isSel ? 'text-blue-700' : 'text-slate-800'}`}>{goal.label}</div>
                      <div className="text-xs text-slate-400 font-medium line-clamp-2">{goal.desc}</div>
                      {isSel && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setAssessmentSubStep(2)} 
                  className="px-8 py-5 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all font-black"
                >
                  ← Back
                </button>
                <button 
                  onClick={handleAssessmentNext} 
                  disabled={!selectedGoal} 
                  className={`flex-1 py-5 rounded-[1.25rem] font-black text-lg shadow-xl shadow-blue-500/20 transition-all duration-300 ${
                    selectedGoal 
                      ? 'bg-gradient-to-r from-slate-950 to-blue-700 text-white hover:scale-[1.02] active:scale-95' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Match me ➔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 5: CRISIS FLOW ---
  if (step === 5) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', padding: '24px 16px' }}>
        <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          
          <div style={{ background: 'linear-gradient(135deg, #ef4444, #f43f5e)', padding: 24, borderRadius: 24, color: '#fff', marginBottom: 24, boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>You're not alone. Help is here right now. 💙</h2>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0, opacity: 0.9 }}>We're here with you. You've done the right thing by reaching out.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            <button style={{ width: '100%', padding: 20, background: 'linear-gradient(135deg, #0f172a, #2563eb)', color: '#fff', borderRadius: 20, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)', transition: 'transform 0.2s', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>💬 Talk to a Listener Now</div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>Free, confidential, available now</div>
            </button>
            <button onClick={() => setIsBreathing(!isBreathing)} style={{ width: '100%', padding: 16, background: '#fff', color: '#2563eb', border: '2px solid #ddd6fe', borderRadius: 20, fontSize: 16, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
              🫁 {isBreathing ? 'Stop Exercise' : 'Try a Breathing Exercise'}
            </button>
          </div>

          {isBreathing && (
            <div style={{ ...commonCardStyle, padding: 48, marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{
                width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, #e0e7ff 0%, #cffafe 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: breathingPhase === 'Inhale' ? 'scale(1.4)' : breathingPhase === 'Hold' ? 'scale(1.4)' : 'scale(1)',
                transition: 'transform 4s ease-in-out',
                boxShadow: '0 0 40px rgba(124,58,237,0.2)'
              }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#4f46e5' }}>{breathingPhase}</span>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Emergency Helplines (24/7)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[
              { name: 'iCall', num: '9152987821', icon: '📞' },
              { name: 'Vandrevala', num: '1860-2662-345', icon: '❤️' },
              { name: 'AASRA', num: '9820466627', icon: '🤝' },
              { name: 'Snehi', num: '044-24640050', icon: '🕊️' }
            ].map(hl => (
              <div key={hl.name} style={{ ...commonCardStyle, padding: 16 }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{hl.icon}</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{hl.name}</div>
                <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{hl.num}</div>
                <button style={{ width: '100%', padding: '8px 0', background: '#f1f5f9', color: '#475569', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Call</button>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 24, fontWeight: 600 }}>This page will stay open. Take your time. 💙</p>
          
          <div style={{ textAlign: 'center' }}>
            <span onClick={() => { setCrisisBypass(true); runMatchingAnimation(); }} style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
              I'm feeling more stable — continue with booking →
            </span>
          </div>

        </div>
      </div>
    );
  }

  // --- STEP 6: MATCHING ANIMATION ---
  if (step === 6) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
        <div style={{ ...commonCardStyle, padding: 48, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24, animation: 'fadeSlideUp 2s ease infinite alternate' }}>🧠</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.5px' }}>Finding your perfect match...</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>Analyzing your responses and preferences</p>
          
          <div style={{ background: '#f1f5f9', height: 8, borderRadius: 20, overflow: 'hidden', marginBottom: 32 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #ec4899)', width: '0%', animation: 'fillBar 2.5s ease-in-out forwards' }} />
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Analyzing your concerns', step: 1 },
              { label: 'Checking specializations', step: 2 },
              { label: 'Matching preferences', step: 3 },
              { label: 'Found 3 specialists for you!', step: 4 }
            ].map(item => (
              <div key={item.step} style={{ 
                opacity: matchingProgress >= item.step ? 1 : 0, 
                transition: 'opacity 0.3s ease',
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 14,
                fontWeight: matchingProgress === item.step ? 800 : matchingProgress > item.step ? 700 : 500,
                color: matchingProgress === item.step ? '#7c3aed' : matchingProgress > item.step ? '#10b981' : '#cbd5e1'
              }}>
                <span style={{ opacity: matchingProgress >= item.step ? 1 : 0 }}>✓</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 7: DOCTOR PROFILE CARDS ---
  if (step === 7) {
    if (viewingProfile) {
      const doc = viewingProfile;
      return (
        <div className="font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50/50 min-h-screen relative pb-32 animate-in fade-in duration-500">
          <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
          
          <div className="max-w-3xl mx-auto px-4 py-8">
            <button 
              onClick={() => { setViewingProfile(null); setSelectedSlot(null); }}
              className="flex items-center gap-3 mb-8 text-slate-400 hover:text-blue-600 transition-all font-bold text-sm tracking-tight group"
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </div>
              Back to all specialists
            </button>
            
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden mb-8">
              {/* Header Profile Section */}
              <div className="h-44 relative" style={{ background: doc.gradient || 'linear-gradient(135deg, #0f172a, #2563eb)' }}>
                <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px]"></div>
              </div>
              
              <div className="p-10 relative">
                <div className="absolute -top-16 left-10 z-10 border-[6px] border-white rounded-full shadow-lg">
                  <DoctorAvatar doctor={doc} size={96} />
                </div>
                <div className="pt-12">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{doc.name}</h1>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-blue-100">Verified Specialist</span>
                    </div>
                    <p className="text-slate-500 font-bold mb-6 text-lg">{doc.creds}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {doc.specialties.map((s: string) => (
                        <span key={s} className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-100">{s}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-50 pt-8">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">🌍</div>
                         <div>
                           <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Languages</div>
                           <div className="text-xs font-bold text-slate-700">{doc.languages}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">⏳</div>
                         <div>
                           <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Experience</div>
                           <div className="text-xs font-bold text-slate-700">{doc.exp}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">⭐</div>
                         <div>
                           <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Rating</div>
                           <div className="text-xs font-bold text-slate-700">{doc.rating} / 5.0</div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> About the specialist
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-sm sm:text-base">{doc.bio}</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Reviews ({doc.sessions})
                  </h3>
                  <div className="space-y-4">
                    {doc.reviews?.map((r: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <svg key={idx} className="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">Verified Session</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium italic italic">"{r.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-blue-500/5 sticky top-24">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Book session
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                     {[
                       { label: "Morning", slots: ["10:00 AM", "11:00 AM"] },
                       { label: "Afternoon", slots: ["2:00 PM", "4:00 PM"] },
                       { label: "Evening", slots: ["7:30 PM", "9:00 PM"] }
                     ].map(group => (
                       <div key={group.label}>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{group.label}</div>
                         <div className="flex flex-wrap gap-2">
                           {group.slots.map(slot => (
                             <button 
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                                  selectedSlot === slot 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                                }`}
                             >
                               {slot}
                             </button>
                           ))}
                         </div>
                       </div>
                     ))}
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                     <div className="flex justify-between items-center mb-6">
                       <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Consultation Fee</div>
                         <div className="text-xl font-black text-slate-950 tracking-tighter mt-1">Rs. 1,499<span className="text-xs text-slate-400 font-bold tracking-normal ml-1">/ 50min</span></div>
                       </div>
                       {selectedSlot && <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-black">SLOT HELD</div>}
                     </div>

                     <button 
                       onClick={() => setStep(8)}
                       disabled={!selectedSlot}
                       className={`w-full py-5 rounded-2xl font-black text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${
                         selectedSlot 
                          ? 'bg-gradient-to-r from-slate-950 to-blue-700 text-white hover:scale-[1.02] active:scale-95 shadow-blue-500/20' 
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none grayscale opacity-70'
                       }`}
                     >
                       Confirm Booking <span className="text-xl">➔</span>
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const filteredDoctors = doctors.filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSpecialty = filterSpecialty === 'All Specialties' || doc.specialties.includes(filterSpecialty);
      return matchSearch && matchSpecialty;
    });

    return (
      <div className="font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50/30 min-h-screen">
        <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
        
        {/* Modern Nav Bar */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 px-6 py-5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-72">
               <select 
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="w-full pl-6 pr-10 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
               >
                 <option>All Specialties</option>
                 {['Anxiety', 'Depression', 'Stress', 'Trauma', 'Relationships'].map(s => <option key={s}>{s}</option>)}
               </select>
               <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">⌄</div>
            </div>

            <div className="relative flex-1 w-full group">
              <input 
                type="text" 
                placeholder="Search specialists by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300 group-hover:border-slate-200"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-black">🔍</span>
            </div>

            <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100">
               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
               <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{filteredDoctors.length} Experts Online</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {isLoadingDoctors ? (
            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
               <div className="w-16 h-16 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
               <div className="text-lg font-black text-slate-900 tracking-tight">Syncing with top specialists...</div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 animate-in zoom-in duration-300">
              <div className="text-6xl mb-6">🔭</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Specialist not found</h3>
              <p className="text-slate-500 font-medium">Try broadening your search or choosing "All Specialties".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {filteredDoctors.map((doc: any, idx: number) => {
                 const isSelDoc = selectedDoctor?.id === doc.id;
                 return (
                   <div key={doc.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col lg:flex-row transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.06)] hover:scale-[1.005] group">
                     
                     {/* Specialist Info */}
                     <div className="p-10 flex-1 border-r border-slate-50/50">
                        <div className="flex flex-col sm:flex-row gap-8 items-start">
                           <div className="flex flex-col items-center gap-4 shrink-0">
                              <div className="relative group/avatar">
                                <DoctorAvatar doctor={doc} size={110} />
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                                   <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                </div>
                              </div>
                              <button 
                                onClick={() => setViewingProfile(doc)}
                                className="w-full py-2.5 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-sm"
                              >
                                View Profile
                              </button>
                           </div>

                           <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-4 mb-2">
                                 <h3 className="text-3xl font-black text-slate-950 tracking-tighter leading-none">{doc.name}</h3>
                                 {idx === 0 && <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg shadow-blue-200">Recommended Match</span>}
                              </div>
                              <div className="text-slate-400 font-bold mb-6 text-base">{doc.creds}</div>

                              <div className="flex flex-wrap gap-3 mb-8">
                                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    <span className="text-sm">⭐</span>
                                    <span className="text-xs font-black text-slate-700">{doc.rating}</span>
                                    <span className="text-[10px] text-slate-400 font-bold border-l border-slate-200 pl-2">({doc.sessions} sessions)</span>
                                 </div>
                                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    <span className="text-sm">🏥</span>
                                    <span className="text-xs font-black text-slate-700">{doc.exp} experience</span>
                                 </div>
                              </div>

                              <div className="space-y-3 p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 group-hover:bg-blue-50/30 transition-colors duration-500">
                                 <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-slate-400 font-bold w-24">Focus Area:</span>
                                    <span className="text-slate-950 font-black tracking-tight">{doc.specialties.slice(0,2).join(', ')}</span>
                                 </div>
                                 <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-slate-400 font-bold w-24">Languages:</span>
                                    <span className="text-slate-950 font-black tracking-tight">{doc.languages}</span>
                                 </div>
                                 <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-slate-400 font-bold w-24">Availability:</span>
                                    <span className="text-emerald-600 font-black tracking-tight flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                      Earliest Slot: Today at 7:30 PM
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Scheduling Section */}
                     <div className="lg:w-[440px] bg-slate-50/70 p-10 flex flex-col relative group-hover:bg-slate-50 transition-colors duration-500">
                        <div className="flex justify-between items-center mb-6 px-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Slots</span>
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">UTC +5:45</span>
                        </div>

                        <div className="space-y-5 mb-8">
                           {['Today, Mar 27', 'Tomorrow, Mar 28'].map((dateLine, dIdx) => (
                             <div key={dIdx} className="flex flex-col gap-3">
                                <div className="text-[11px] font-black text-slate-500 flex items-center gap-2">
                                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {dateLine}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                   {['10:00 AM', '02:00 PM', '07:30 PM'].map(slotTime => {
                                      const fullSlotId = `${dateLine.split(',')[0]} ${slotTime}`;
                                      const isSelected = isSelDoc && selectedSlot === fullSlotId;
                                      return (
                                        <button 
                                          key={slotTime}
                                          onClick={() => { setSelectedDoctor(doc); setSelectedSlot(fullSlotId); }}
                                          className={`px-5 py-3 rounded-2xl text-[11px] font-black transition-all border-2 border-transparent ${
                                            isSelected 
                                              ? 'bg-slate-950 text-white shadow-xl shadow-slate-200 border-slate-950 scale-105' 
                                              : 'bg-white text-slate-600 hover:border-blue-200 shadow-sm'
                                          }`}
                                        >
                                          {slotTime}
                                        </button>
                                      );
                                   })}
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-200/50 flex items-center justify-between pointer-events-auto">
                           <div className="flex-1 mr-4">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Standard Session</div>
                              <div className="text-sm font-black text-slate-950 truncate max-w-[150px]">
                                 {isSelDoc && selectedSlot ? selectedSlot : "Choose a time slot"}
                              </div>
                           </div>
                           <button 
                              onClick={() => setStep(8)}
                              disabled={!isSelDoc || !selectedSlot}
                              className={`px-8 py-4 rounded-2xl font-black text-xs shadow-xl transition-all duration-300 flex items-center gap-3 ${
                                isSelDoc && selectedSlot 
                                  ? 'bg-gradient-to-r from-slate-950 to-blue-700 text-white hover:scale-105 active:scale-95 shadow-blue-500/20' 
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed grayscale'
                              }`}
                           >
                              Book Now <span className="text-base">➔</span>
                           </button>
                        </div>
                     </div>

                   </div>
                 );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 8: SESSION FORMAT SELECTOR ---
  if (step === 8) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-['Plus_Jakarta_Sans',sans-serif] py-16 px-4 relative overflow-hidden flex items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl w-full mx-auto relative z-10 animate-in fade-in zoom-in duration-500">
          
          {/* Progress Indicator */}
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-3 mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 shadow-sm ${
                    s === 2 ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white scale-110 shadow-blue-200' : 
                    s < 2 ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 border border-slate-100'
                  }`}>
                    {s < 2 ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`w-12 h-0.5 mx-2 rounded-full ${s < 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Step 2 of 3</span>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-950 mb-3 tracking-tighter">How would you like to meet?</h2>
            <p className="text-slate-500 font-bold text-lg max-w-md mx-auto leading-relaxed">Choose the session format that feels most comfortable for you today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              { 
                id: 'video', 
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Video Call', 
                desc: 'See each other face to face from the comfort of home.',
                pros: ['Non-verbal cues', 'Most personal', 'Screen sharing available']
              },
              { 
                id: 'text', 
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'Text Chat', 
                desc: 'Communicate privately through our secure messaging.',
                pros: ['Async-friendly', 'Full privacy', 'Easy to reference later']
              }
            ].map((fmt) => {
              const isSel = (selectedFormat || 'text') === fmt.id;
              return (
                <div 
                  key={fmt.id} 
                  onClick={() => setSelectedFormat(fmt.id as any)}
                  className={`group relative overflow-hidden bg-white cursor-pointer rounded-[2.5rem] p-10 border-4 transition-all duration-500 flex flex-col items-start ${
                    isSel 
                      ? 'border-blue-500 scale-[1.03] shadow-[0_30px_60px_-15px_rgba(59,130,246,0.25)] ring-4 ring-blue-500/10' 
                      : 'border-white hover:border-blue-100 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-[1.01]'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-8 right-8 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isSel ? 'bg-blue-600 shadow-lg shadow-blue-200 scale-110' : 'bg-slate-50 border-2 border-slate-100'}`}>
                    <svg className={`w-4 h-4 transition-all ${isSel ? 'text-white' : 'text-transparent'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>

                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-colors duration-500 ${isSel ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-blue-50 text-blue-500'}`}>
                    {fmt.icon}
                  </div>

                  <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tighter">{fmt.title}</h3>
                  <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{fmt.desc}</p>
                  
                  <div className="space-y-4 w-full pt-8 border-t border-slate-50">
                    {fmt.pros.map((pro) => (
                      <div key={pro} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isSel ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-sm font-black text-slate-700">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-slate-100">
            <button 
              onClick={() => setStep(7)}
              className="px-8 py-4 rounded-2xl text-slate-400 font-black text-sm tracking-widest uppercase hover:text-blue-600 transition-all group flex items-center gap-3"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to selection
            </button>
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) { alert('Please log in'); return; }
                  const response = await fetch('http://127.0.0.1:5000/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                      psychiatristId: selectedDoctor?.id || '698770d03312246b6db67351',
                      date: new Date().toISOString(),
                      time: selectedSlot || '10:00 AM'
                    })
                  });
                  const data = await response.json();
                  if (data.success) {
                    setBookedAppointment(data.data);
                    if (user?.isPremium) {
                      setStep(9);
                    } else {
                      setStep('redirecting');
                      setTimeout(() => setStep('pay'), 1000);
                    }
                  } else { alert(data.error || 'Failed to book: Server returned an error'); }
                } catch (e: any) { alert('Booking failed: ' + (e.message || 'Network error')); }
              }} 
              disabled={!selectedFormat && selectedFormat !== 'text'} 
              className="px-12 py-5 rounded-[1.5rem] font-black text-base transition-all duration-300 shadow-xl shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:scale-[1.03] active:scale-95 flex items-center gap-4 group"
            >
              {user?.isPremium ? 'Confirm & Book Session' : 'Confirm Format & Pay'}
              <span className="text-xl group-hover:translate-x-1 transition-transform">➔</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP REDIRECTING: GATEWAY HANDSHAKE ---
  if (step === 'redirecting') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif]">
        <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
        <div className="flex flex-col items-center max-w-sm text-center px-8">
            <div className="w-24 h-24 relative mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 bg-indigo-50 rounded-full flex items-center justify-center">
                    <span className="text-2xl animate-pulse">🔒</span>
                </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2 italic">Securing Connection...</h2>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">Handshaking with payment gateway. Please do not refresh the page.</p>
            
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-indigo-600 animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
            </div>

            <div className="flex items-center gap-4 opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp" alt="eSewa" className="h-4 grayscale" />
                <img src="https://khalti.com/wp-content/uploads/2021/01/khalti-logo.png" alt="Khalti" className="h-4 grayscale" />
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">PCI DSS Compliant</span>
            </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes progress {
                0% { width: 0%; }
                100% { width: 100%; }
            }
        `}} />
      </div>
    );
  }

  // --- STEP PAY: PAYMENT ---
  if (step === 'pay') {
    const simulatePayment = async () => {
      setPayError('');
      if (['esewa', 'khalti', 'ime'].includes(payMethod) && !mobileNum) {
        setPayError(`Please enter your ${payMethod.charAt(0).toUpperCase() + payMethod.slice(1)} mobile number`);
        return;
      }
      if (payMethod === 'connectips' && (!selBank || !ipsUser)) {
        setPayError('Please select your bank and enter your ConnectIPS username');
        return;
      }
      if (payMethod === 'card' && (!cardNum || !cardExpiry || !cardCvv || !cardName)) {
        setPayError('Please fill in all card details');
        return;
      }

      setPayLoading(true);
      const token = localStorage.getItem('token');
      try {
        await fetch('http://127.0.0.1:5000/api/auth/upgrade-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ gateway: payMethod, mobileNumber: mobileNum || 'N/A' })
        });
        await refreshUser();
      } catch (err) {
        console.error("Failed to upgrade premium", err);
      }

      await new Promise(r => setTimeout(r, 2000));
      setPayLoading(false);
      setStep(9);
    };

    const formatCard = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1  ');
    const formatExpiry = (v: string) => v.replace(/\D/g,'').slice(0,4).replace(/(\d{2})(\d)/,'$1 / $2');

    return (
      <div className="min-h-screen bg-[#fcfdfe] font-['Plus_Jakarta_Sans',sans-serif] pb-20">
        <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
        
        {/* STEP INDICATOR */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            <div className="flex items-center gap-3 text-emerald-600">
              <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] border border-emerald-100">01</span>
              <span>Review Assessment</span>
            </div>
            <div className="h-px bg-slate-100 flex-1 mx-8 hidden sm:block"></div>
            <div className="flex items-center gap-3 text-primary-600">
              <span className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-[10px] text-white shadow-lg shadow-primary-200">02</span>
              <span>Payment Gateway</span>
            </div>
            <div className="h-px bg-slate-100 flex-1 mx-8 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] border border-slate-200">03</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            
            {/* LEFT: SELECTION */}
            <div className="order-2 lg:order-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Checkout Details</h1>
                <p className="text-slate-500 font-medium">Select your preferred payment method from the trusted providers in Nepal.</p>
              </div>

              <div className="space-y-4">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = payMethod === method.id;
                  return (
                    <div 
                      key={method.id} 
                      onClick={() => setPayMethod(method.id)}
                      className={`group border-2 rounded-3xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden ${isSelected ? 'border-primary-500 bg-white shadow-xl shadow-primary-50/50 ring-4 ring-primary-50' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'}`}
                    >
                      {method.popular && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">Most Popular</div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-inner transition-transform group-hover:scale-105 duration-300`} style={{ background: method.color }}>
                          {method.isCard ? <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500/90" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 -ml-1.5" /></div> : method.name.substring(0, 4)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900">{method.name}</span>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>}
                          </div>
                          <div className="text-xs font-bold text-slate-400 mt-0.5">{method.sub}</div>
                        </div>

                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-slate-200 bg-white'}`}>
                          {isSelected && <div className="w-2 h-1 border-b-2 border-r-2 border-white rotate-45 mb-1 animate-in zoom-in-50"></div>}
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {isSelected && (
                        <div className="mt-6 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-500">
                          {['esewa', 'khalti', 'ime'].includes(method.id) && (
                            <div className="space-y-4">
                              <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 border-r border-slate-100 pr-3">+977</span>
                                <input 
                                  value={mobileNum} 
                                  onChange={e => setMobileNum(e.target.value)} 
                                  placeholder={`${method.name} ID (Mobile No.)`} 
                                  className="w-full pl-20 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-slate-300"
                                />
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2 px-1">
                                <span className="text-emerald-500 text-sm">🛡️</span> OTP will be sent to this number for secondary verification.
                              </p>
                            </div>
                          )}

                          {method.id === 'connectips' && (
                            <div className="space-y-4">
                              <select 
                                value={selBank} 
                                onChange={e => setSelBank(e.target.value)} 
                                className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                              >
                                <option value="">Choose your bank</option>
                                {NEPALI_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                              <input 
                                value={ipsUser} 
                                onChange={e => setIpsUser(e.target.value)} 
                                placeholder="ConnectIPS Username" 
                                className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                              />
                            </div>
                          )}

                          {method.id === 'card' && (
                            <div className="space-y-4">
                              <input 
                                value={cardNum} 
                                onChange={e => setCardNum(formatCard(e.target.value))} 
                                placeholder="Card Number (••••  ••••  ••••  ••••)" 
                                className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 outline-none transition-all tracking-wider"
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <input value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM / YY" className="px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all" />
                                <input value={cardCvv} onChange={e => setCardCvv(e.target.value.substring(0,4))} placeholder="CVV" className="px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all text-center" />
                              </div>
                              <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Cardholder Name" className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all uppercase" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: SUMMARY CARD */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-28">
               <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                       Consultation Summary
                    </div>
                    
                    <div className="flex gap-4 items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shrink-0 shadow-lg shadow-indigo-100">
                         {selectedDoctor?.name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{selectedDoctor?.name || 'Dr. Arjun Mehta'}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{selectedDoctor?.creds || 'Senior Psychiatrist'} • {selectedFormat === 'video' ? '📹 Video' : '💬 Text'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400 font-medium">Session Fee</span>
                        <span className="text-slate-900 tracking-tight">Rs. 1,499.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400 font-medium">Service Charge</span>
                        <span className="text-emerald-500 font-black">Free</span>
                      </div>
                      <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Amount</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">Rs. 1,499</span>
                      </div>
                    </div>
                  </div>

                  {payError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-600 flex items-center gap-3 animate-pulse">
                      <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs shrink-0">!</span>
                      {payError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <button 
                      onClick={simulatePayment} 
                      disabled={payLoading}
                      className="w-full py-5 rounded-[20px] bg-slate-900 hover:bg-black text-white font-black text-sm transition-all duration-300 shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group border-none cursor-pointer"
                    >
                      {payLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Proceed Securely</span>
                          <span className="text-base group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </>
                      )}
                    </button>

                    <button 
                      onClick={() => setStep(8)}
                      className="w-full py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center hover:text-slate-900 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      ← Back to Session Review
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-center gap-6">
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex flex-col items-center gap-1.5">
                      <span className="text-base">🔒</span>
                      SSL SECURE
                    </div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex flex-col items-center gap-1.5">
                      <span className="text-base">🛡️</span>
                      INSURED
                    </div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex flex-col items-center gap-1.5">
                      <span className="text-base">↩️</span>
                      REFUNDABLE
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* FLOATING TRUST SEAL FOR MOBILE */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-slate-900/90 backdrop-blur rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 lg:hidden shadow-2xl z-40 border border-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          256-Bit SSL Secured Checkout
        </div>
      </div>
    );
  }

  // --- STEP 9: PREMIUM BOOKING CONFIRMATION ---
  if (step === 9) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 font-['Plus_Jakarta_Sans',sans-serif] py-12 px-4 relative overflow-hidden">
        {/* Abstract Background Blurs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 animate-in fade-in zoom-in duration-700">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping"></div>
              <div 
                className="relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-200"
                style={{ animation: 'successPulse 3s ease-in-out infinite' }}
              >
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0, animation: 'iconReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.3s' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">Booking Confirmed</h1>
            <p className="text-slate-500 font-bold text-lg mb-2">Your session is scheduled and ready</p>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              You’ve taken a great step toward your wellbeing
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* LEFT CARD: Doctor + Session Details */}
            <div className="lg:col-span-7">
               <div className="bg-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(37,99,235,0.06)] border border-blue-50/50 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                  <div className="p-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 border-b border-slate-50 pb-10">
                      <div className="relative group/avatar">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur opacity-25 group-hover/avatar:opacity-40 transition-opacity"></div>
                        <DoctorAvatar doctor={selectedDoctor} size={110} />
                        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-50">
                          <span className="text-xl">⭐</span>
                        </div>
                      </div>
                      <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedDoctor?.name || 'Your Specialist'}</h2>
                          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 mt-1 md:mt-0 inline-block w-fit mx-auto md:mx-0">Trusted Therapist</div>
                        </div>
                        <p className="text-slate-400 font-bold text-lg mb-6 leading-none">{selectedDoctor?.creds || 'Masters in Mental Health'}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-4">
                           <div className="flex -space-x-2">
                             {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px]">✨</div>)}
                           </div>
                           <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Recently supported 42 users</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Date & Time</p>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-50 flex flex-col items-center justify-center border border-blue-100">
                             <span className="text-[10px] font-black text-blue-600 leading-none">APR</span>
                             <span className="text-xl font-black text-blue-700 mt-1">12</span>
                           </div>
                           <div>
                             <p className="text-base font-black text-slate-900 leading-none">{bookedAppointment ? new Date(bookedAppointment.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Wednesday, April 12'}</p>
                             <p className="text-blue-600 font-black text-2xl mt-1 tracking-tight">{bookedAppointment?.time || '10:00 AM'}</p>
                           </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Format</p>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                             <span className="text-2xl">{selectedFormat === 'video' ? '📹' : '💬'}</span>
                           </div>
                           <div>
                             <p className="text-base font-black text-slate-900 leading-none capitalize">{selectedFormat || 'Video Call'}</p>
                             <p className="text-slate-400 font-bold text-sm mt-1">High-definition enabled</p>
                           </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Consultation Prep</p>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                             <span className="text-2xl">🌐</span>
                           </div>
                           <div>
                             <p className="text-base font-black text-slate-900 leading-none">English</p>
                             <p className="text-slate-400 font-bold text-sm mt-1">Language confirmed</p>
                           </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Payment Summary</p>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-50/50 flex items-center justify-center border border-blue-100/50">
                             <span className="text-2xl">💳</span>
                           </div>
                           <div>
                             <p className="text-base font-black text-slate-900 leading-none">Paid via {PAYMENT_METHODS.find(m => m.id === payMethod)?.name || 'eSewa'}</p>
                             <p className="text-blue-600 font-black text-lg mt-1">Rs. 1,499</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* RIGHT SIDE: Expectations & Preparation */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(37,99,235,0.03)] border border-blue-50/30 group hover:shadow-xl transition-all duration-500">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">✨</div>
                  What to expect
                </h3>
                <div className="space-y-6">
                  {[
                    "Your first session is 50 minutes long",
                    "The doctor will discuss your goals and past history",
                    "There are no wrong answers — just be your authentic self"
                  ].map((text, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex items-start gap-4 group/item py-2">
                       <div className="p-1 rounded-lg bg-blue-50 text-blue-500 mt-1 transition-colors group-hover/item:bg-blue-600 group-hover/item:text-white">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                       </div>
                       <p className="text-sm font-bold text-slate-600 leading-relaxed">{text}</p>
                      </div>
                      {i < 2 && <div className="h-px w-full bg-slate-50 my-2"></div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-200 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <h3 className="text-xl font-black mb-8 flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">💡</div>
                   How to prepare
                 </h3>
                 <div className="space-y-6 relative z-10">
                    {[
                      "Find a quiet, private space where you feel safe",
                      "Test your camera and microphone beforehand",
                      "Keep some water nearby and get comfortable"
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-4">
                         <div className="w-2 h-2 rounded-full bg-blue-300 mt-2 shrink-0"></div>
                         <p className="text-sm font-bold text-blue-50 leading-relaxed">{text}</p>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black uppercase tracking-widest text-blue-200">Device Readiness</span>
                       <Link to="/test-device" className="text-sm font-black underline underline-offset-4 hover:text-white transition-colors">Test camera →</Link>
                    </div>
                 </div>
              </div>

            </div>
          </div>

          {/* Action Footer Section */}
          <div className="flex flex-col gap-8">
            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl animate-bounce" style={{ animationDuration: '3s' }}>⏳</div>
                <div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Session Countdown</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">Starts in <span className="text-blue-600">23 hours, 15 mins</span></p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:flex-none">
                   <button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full md:w-auto px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 font-black text-sm tracking-tight hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-3 group"
                   >
                     <span>📅</span> Add to Calendar <svg className={`w-4 h-4 transition-transform duration-300 ${showCalendar ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                   </button>
                   {showCalendar && (
                     <div className="absolute top-full right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 min-w-[200px]">
                        <button className="w-full text-left px-5 py-3 rounded-2xl hover:bg-slate-50 flex items-center gap-4 transition-colors">
                           <span className="text-xl">🇬</span>
                           <span className="font-bold text-slate-700 text-sm">Google Calendar</span>
                        </button>
                        <button className="w-full text-left px-5 py-3 rounded-2xl hover:bg-slate-50 flex items-center gap-4 transition-colors mt-1">
                           <span className="text-xl">🍎</span>
                           <span className="font-bold text-slate-700 text-sm">Apple Calendar</span>
                        </button>
                     </div>
                   )}
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center pt-8 border-t border-slate-100 mb-8">
              <div className="md:col-span-2">
                {selectedFormat === 'video' ? (
                  <Link 
                    to={bookedAppointment?.roomId ? `/video-session?roomId=${bookedAppointment.roomId}&username=${user?.username || 'Patient'}&aptId=${bookedAppointment._id}` : '/video-session'} 
                    className="w-full py-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black text-lg tracking-tight shadow-xl shadow-blue-500/30 hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95 transition-all text-center block"
                  >
                    Join Video Session
                  </Link>
                ) : (
                  <button 
                    onClick={() => setIsChatActive(true)} 
                    className="w-full py-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black text-lg tracking-tight shadow-xl shadow-blue-500/30 hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95 transition-all"
                  >
                    Start Chat Session
                  </button>
                )}
              </div>
              <button 
                onClick={() => setStep(7)} 
                className="py-5 rounded-full border-2 border-slate-200 text-slate-500 font-black text-sm uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/30 transition-all active:scale-95"
              >
                Switch Doctor
              </button>
              <button 
                onClick={() => setStep(8)} 
                className="py-5 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center justify-center gap-3"
              >
                <span>←</span> Back
              </button>
            </div>

            <div className="text-center bg-blue-50/50 backdrop-blur-sm rounded-2xl py-4 px-6 border border-blue-100 text-blue-600 text-xs font-black tracking-widest uppercase inline-block mx-auto mb-12">
               We’ll remind you 15 minutes before your session
            </div>
          </div>

          {/* CHAT SESSION OVERLAY */}
          {isChatActive && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-500">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-emerald-500/20 rounded-full animate-pulse"></div>
                      <DoctorAvatar doctor={selectedDoctor} size={56} />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900 tracking-tight">{selectedDoctor?.name}</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Session
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsChatActive(false);
                      setChatHistory([]); // Clear chat if needed
                    }}
                    className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all active:scale-90"
                  >
                    ✕
                  </button>
                </div>
                
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 messages-scroll"
                >
                  {chatHistory.map((c, i) => {
                    const isMe = c.sender === 'patient' || c.sender === 'user';
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-6 max-w-[80%] rounded-[2rem] shadow-sm relative group/msg ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200' 
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                           {c.replyTo && (
                             <div className={`mb-3 p-3 rounded-xl text-xs border-l-4 ${isMe ? 'bg-white/10 border-white/30 text-blue-50' : 'bg-slate-50 border-blue-200 text-slate-400'}`}>
                                <div className="font-black mb-1">{c.replyTo.sender === (isMe ? 'patient' : 'doctor') ? 'You' : 'Expert'}</div>
                                <div className="truncate">{c.replyTo.content || c.replyTo.text}</div>
                             </div>
                           )}
                           <p className="text-sm font-bold leading-relaxed">{c.text}</p>
                           <div className={`text-[10px] font-black mt-3 uppercase tracking-tighter ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                             {c.time}
                           </div>

                           {!isMe && (
                             <button 
                               onClick={() => setReplyToMsg(c)}
                               className="absolute -right-12 top-0 p-2 text-slate-300 hover:text-blue-500 opacity-0 group-hover/msg:opacity-100 transition-opacity"
                             >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                             </button>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {replyToMsg && (
                    <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4">
                           <div className="w-1 h-10 bg-blue-600 rounded-full"></div>
                           <div>
                             <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Replying to {replyToMsg.sender === 'doctor' ? selectedDoctor?.name : 'Expert'}</p>
                             <p className="text-sm font-bold text-slate-500 truncate max-w-md">{replyToMsg.text}</p>
                           </div>
                        </div>
                        <button onClick={() => setReplyToMsg(null)} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs hover:bg-slate-800 hover:text-white transition-colors">✕</button>
                    </div>
                )}

                <div className="p-8 bg-white border-t border-slate-100">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message here..."
                      className="w-full pl-8 pr-20 py-6 rounded-3xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-300"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return null;
};

export default Premium;
