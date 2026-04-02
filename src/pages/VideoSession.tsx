import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

const SIGNALING_SERVER_URL = 'http://127.0.0.1:5000';
const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

const STYLE_TAGS = `
@keyframes ripple {
  0%  { opacity:0.6; transform:scale(0.92) }
  100%{ opacity:0;   transform:scale(1.08) }
}
@keyframes pulse {
  0%,100%{ opacity:1 }
  50%{ opacity:0.35 }
}
@keyframes dotb {
  0%,60%,100%{opacity:0.3;transform:translateY(0)}
  30%{opacity:1;transform:translateY(-3px)}
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

const VideoSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const roomId = searchParams.get('roomId') || (user ? `room-${user.id}` : `room-${Date.now()}`);
  const username = user?.username || 'Guest';

  // --- UI State ---
  const [secs, setSecs] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [remoteUsername, setRemoteUsername] = useState<string | null>(null);
  
  // --- WebRTC & Signaling Refs ---
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      console.log("Requesting camera and microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }, 
        audio: true 
      });
      
      console.log("Camera access granted!");
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
      localStreamRef.current = stream;
      setHasLocalStream(true);
      socket.current?.emit('video-join-room', { roomId, username });
      
    } catch (err: any) {
      console.error("Camera error:", err.name, err.message);
      setHasLocalStream(false);
      
      if (err.name === "NotAllowedError") {
        alert("Camera permission denied. Please click the camera icon in your browser address bar and allow access, then refresh the page.");
      } else if (err.name === "NotFoundError") {
        alert("No camera found on this device.");
      } else if (err.name === "NotReadableError") {
        alert("Camera is already in use by another app. Close Zoom, Teams or other apps using the camera and refresh.");
      } else {
        alert("Could not access camera: " + err.message);
      }
    }
  };

  // --- Session Control ---
  useEffect(() => {
    // Timer
    timerRef.current = setInterval(() => {
      setSecs(s => s + 1);
    }, 1000);

    // Initial Status Delay
    const statusTimeout = setTimeout(() => {
      setConnected(true);
    }, 3000);

    // Signaling Setup
    socket.current = io(SIGNALING_SERVER_URL);
 
    // Signaling Listeners
    socket.current.on('user-joined', ({ id, name }: { id: string, name: string }) => {
      setRemoteUsername(name);
      createOffer(id);
    });
    socket.current.on('offer', ({ offer, from, name }: { offer: any, from: string, name?: string }) => {
      if (name) setRemoteUsername(name);
      createAnswer(offer, from);
    });
    socket.current.on('answer', ({ answer }: { answer: any }) => {
      if (peerConnection.current) {
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
    socket.current.on('ice-candidate', ({ candidate }: { candidate: any }) => {
      if (peerConnection.current && candidate) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
 
    // Start Camera
    startCamera();

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(statusTimeout);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    peerConnection.current?.close();
    socket.current?.disconnect();
  };

  const createPeerConnection = (targetId: string) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.current?.emit('ice-candidate', { candidate: e.candidate, to: targetId });
    };
    pc.ontrack = (e) => {
      console.log("Remote track received:", e.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setHasRemoteStream(true);
      }
    };
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    }
    peerConnection.current = pc;
    return pc;
  };

  const createOffer = async (targetId: string) => {
    const pc = createPeerConnection(targetId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.current?.emit('offer', { offer, to: targetId, name: username });
  };

  const createAnswer = async (offer: any, from: string) => {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.current?.emit('answer', { answer, to: from, name: username });
  };

  // --- UI Handlers ---
  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCamOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secsPart = s % 60;
    return `${mins}:${secsPart < 10 ? '0' : ''}${secsPart}`;
  };

  const handleEndCallFinal = async () => {
    // Extract aptId if available
    const aptId = searchParams.get('aptId');
    if (aptId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://127.0.0.1:5000/api/appointments/${aptId}/complete`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to mark session as complete:", err);
      }
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setCallEnded(true);
    setShowEndModal(false);
    clearInterval(timerRef.current);
    cleanup();
  };

  // --- Styles ---
  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(160deg, #080c14 0%, #0d1628 55%, #080c14 100%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    overflow: "hidden",
    zIndex: 9999
  };

  const orbStyle = (top?: number, left?: number, bottom?: number, right?: number, color?: string, size?: number): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    top, left, bottom, right,
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    pointerEvents: "none",
    borderRadius: "50%"
  });

  const centerAreaStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  const rippleRingStyle = (delay: string, size: number): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    border: "1px solid rgba(124,58,237,0.18)",
    animation: "ripple 3s ease-out infinite",
    animationDelay: delay
  });

  const btnBaseStyle: React.CSSProperties = {
    width: 50,
    height: 50,
    borderRadius: "50%",
    border: "1.5px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    position: "relative",
    flexShrink: 0,
    outline: "none"
  };

  const mutedBtnStyle: React.CSSProperties = {
    background: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.5)",
  };

  // --- Render ---
  return (
    <div style={wrapperStyle}>
      <style dangerouslySetInnerHTML={{ __html: STYLE_TAGS }} />
      
      {/* Background Orbs */}
      <div style={orbStyle(-100, -100, undefined, undefined, "rgba(124,58,237,0.06)", 400)} />
      <div style={orbStyle(undefined, undefined, -80, 50, "rgba(16,185,129,0.04)", 350)} />

      {/* Main Center Area */}
      <div style={centerAreaStyle}>
        {/* Remote Video */}
        <video 
          ref={remoteVideoRef}
          autoPlay playsInline
          style={{ 
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover",
            display: hasRemoteStream ? 'block' : 'none'
          }}
        />

        {/* Placeholder UI when no video */}
        {!hasRemoteStream && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={rippleRingStyle("0s", 120)} />
              <div style={rippleRingStyle("0.8s", 152)} />
              <div style={rippleRingStyle("1.6s", 184)} />
              
              <div style={{
                width: 84, height: 84, borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "2px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color: "white", zIndex: 2
              }}>PS</div>
            </div>
            
            <div style={{ marginTop: 60 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "-0.2px", textAlign: "center" }}>
                {remoteUsername || 'Support Staff'}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 2 }}>
                {remoteUsername ? 'Mental Health Professional' : 'MindCare · Psychiatrist'}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 24, justifyContent: 'center' }}>
                <div style={{ 
                  width: 7, height: 7, borderRadius: "50%", background: "#10b981", 
                  animation: !connected ? "none" : "pulse 2s infinite",
                  opacity: connected ? 1 : 0.4
                }} />
                <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
                  {!connected ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ animation: 'dotb 1.4s infinite', animationDelay: '0s' }}>●</span>
                      <span style={{ animation: 'dotb 1.4s infinite', animationDelay: '0.2s' }}>●</span>
                      <span style={{ animation: 'dotb 1.4s infinite', animationDelay: '0.4s' }}>●</span>
                      {" Connecting"}
                    </span>
                  ) : "Connected"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            fontSize: 14, fontWeight: 700, color: "white",
            border: "1.5px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>{username.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Professional Session</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>MindCare · Secure</div>
          </div>
        </div>

        <div style={{
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 30, padding: "7px 18px",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", fontVariantNumeric: "tabular-nums", letterSpacing: "0.5px" }}>
            {formatTime(secs)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "rgba(16,185,129,0.8)",
            display: "flex", alignItems: "center", gap: 5
          }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Encrypted
          </div>
          <div style={{
            background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", gap: 5
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 10 }}>
              {[3, 5, 7, 10].map((h, i) => (
                <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: "rgba(16,185,129,0.8)" }} />
              ))}
            </div>
            Good
          </div>
        </div>
      </div>

      {/* PIP Self View */}
      <div style={{
        position: "absolute", bottom: 108, right: 20,
        width: 128, height: 96, borderRadius: 14,
        overflow: "hidden", border: "2px solid rgba(255,255,255,0.15)",
        zIndex: 10
      }}>
        <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <video 
            ref={localVideoRef}
            autoPlay 
            playsInline 
            muted
            style={{ 
              width:"100%", height:"100%", 
              objectFit:"cover",
              transform: "scaleX(-1)",
              display: (camOn && hasLocalStream) ? 'block' : 'none'
            }}
          />
          {!camOn && (
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              fontSize: 14, fontWeight: 700, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{username.charAt(0).toUpperCase()}</div>
          )}
          <div style={{
            position: "absolute", bottom: 7, left: 8, fontSize: 10, color: "rgba(255,255,255,0.9)",
            background: "rgba(0,0,0,0.55)", padding: "2px 8px", borderRadius: 5, fontWeight: 600, letterSpacing: "0.3px"
          }}>You</div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div style={{
        position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 10
      }}>
        <div style={{
          background: "rgba(8,12,20,0.88)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 60, padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 10
        }}>
          {/* CAMERA */}
          <button 
            style={{ ...btnBaseStyle, ...(camOn ? {} : mutedBtnStyle) }}
            onClick={toggleCam}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={camOn ? "white" : "#ef4444"} strokeWidth="1.6">
              {camOn ? (
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              ) : (
                <>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34M7 13a4 4 0 007.64 1.6"/>
                </>
              )}
            </svg>
            <div className="tooltip" style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.8)", color: "rgba(255,255,255,0.9)", fontSize: 10,
              padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap", opacity: 0, transition: "opacity 0.15s", pointerEvents: "none"
            }}>Camera {camOn ? 'on' : 'off'}</div>
          </button>
          
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />

          {/* MIC */}
          <button 
            style={{ ...btnBaseStyle, ...(micOn ? {} : mutedBtnStyle) }}
            onClick={toggleMic}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={micOn ? "white" : "#ef4444"} strokeWidth="1.6">
              {micOn ? (
                <>
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
                </>
              ) : (
                <>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 10v-1m7 14v-3M9 21h6"/>
                </>
              )}
            </svg>
            <div className="tooltip" style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.8)", color: "rgba(255,255,255,0.9)", fontSize: 10,
              padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap", opacity: 0, transition: "opacity 0.15s", pointerEvents: "none"
            }}>Mic {micOn ? 'on' : 'off'}</div>
          </button>

          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />

          {/* END CALL */}
          <button 
            style={{ ...btnBaseStyle, width: 54, height: 54, background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none" }}
            onClick={() => setShowEndModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ transform: "rotate(135deg)" }}>
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.79 19.79 19.79 0 0116.92 2a2 2 0 012 2.18v3a2 2 0 01-1.44 1.94 16 16 0 01-7.58 7.58A2 2 0 0122 16.92z"/>
            </svg>
            <div className="tooltip" style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.8)", color: "rgba(255,255,255,0.9)", fontSize: 10,
              padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap", opacity: 0, transition: "opacity 0.15s", pointerEvents: "none"
            }}>End call</div>
          </button>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(8px)", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#0e1520", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 22, padding: 32, width: 300, textAlign: "center" }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%", background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ transform: "rotate(135deg)" }}>
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.79 19.79 19.79 0 0116.92 2a2 2 0 012 2.18v3a2 2 0 01-1.44 1.94 16 16 0 01-7.58 7.58A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 6 }}>End this session?</h3>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Session duration: {formatTime(secs)}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEndModal(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: "#1a2235", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Keep going</button>
              <button onClick={handleEndCallFinal} style={{ flex: 1, padding: 12, borderRadius: 12, background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>End session</button>
            </div>
          </div>
        </div>
      )}

      {/* Post Call Screen */}
      {callEnded && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "linear-gradient(160deg, #080c14, #1a1040)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", letterSpacing: "-0.3px" }}>Session complete</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            {formatTime(secs)} · Encrypted · Secure
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {["Write notes", "Schedule next", "Rate session"].map(label => (
              <button key={label} style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", fontSize: 13, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: "13px 32px", borderRadius: 14, background: "linear-gradient(135deg, #7c3aed,#a78bfa)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 20 }}
          >Return to dashboard</button>
        </div>
      )}

      {/* CSS-in-JS Tooltip Hover Effect */}
      <style>{`
        button:hover .tooltip { opacity: 1 !important; }
        button:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.4) !important; transform: scale(1.05); }
      `}</style>
    </div>
  );
};

export default VideoSession;
