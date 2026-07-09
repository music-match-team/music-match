"use client";

import { useEffect, useState, useRef, WheelEvent } from "react";
import { useRouter } from "next/navigation";
import ProteggiPagina from "../components/ProteggiPagina";

export default function MusicistiPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);
  const [musicisti, setMusicisti] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stati per il popup di Match
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");

  // Play state for videos
  const [isPlaying, setIsPlaying] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Per evitare scroll multipli istantanei
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, []);

  useEffect(() => {
    async function caricaMusicisti() {
      try {
        setIsLoading(true);
        let url = "/api/musicisti";
        if (utente && utente.idUtente) {
          url += `?idUtente=${utente.idUtente}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setMusicisti(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (utente !== null) {
      caricaMusicisti();
    }
  }, [utente]);

  // Reset media index, info panel and play state when changing user
  useEffect(() => {
    setCurrentMediaIndex(0);
    setShowInfo(false);
    setIsPlaying(true);
  }, [currentIndex]);

  const apriMatchModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMatchMessage("");
    setShowMatchModal(true);
  };

  async function confermaMatch() {
    setShowMatchModal(false);
    
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUtenteOrigina: utente.idUtente,
          idUtenteOttiene: musicistaCorrente.idUtente,
          messaggio: matchMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.match) {
        router.push("/match");
      } else {
        alert(data.message || data.error);
        if (data.match) {
          router.push("/match");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante la creazione del match");
    }
  }

  async function segnalaUtente(idUtenteDestinatario: number) {
    const motivo = prompt("Inserisci il motivo della segnalazione:");
    if (!motivo) return;

    try {
      const response = await fetch("/api/segnalazioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idMittente: utente.idUtente,
          idDestinatario: idUtenteDestinatario,
          motivo,
        }),
      });

      if (response.ok) {
        alert("Utente segnalato con successo.");
        avanti();
      } else {
        alert("Errore durante l'invio della segnalazione.");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante l'invio della segnalazione.");
    }
  }

  const musicistaCorrente = musicisti[currentIndex];

  const avanti = () => {
    if (currentIndex < musicisti.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const indietro = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (musicistaCorrente && musicistaCorrente.media && currentMediaIndex < musicistaCorrente.media.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  // --- Handler for Scroll (Wheel) ---
  const handleWheel = (e: WheelEvent) => {
    if (scrollTimeoutRef.current) return; // In cooldown

    if (e.deltaY > 50) {
      avanti();
      startScrollCooldown();
    } else if (e.deltaY < -50) {
      indietro();
      startScrollCooldown();
    }
  };

  const startScrollCooldown = () => {
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
    }, 800); // 800ms cooldown tra uno scroll e l'altro
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isLoading) {
    return (
      <ProteggiPagina>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
          <h2>Caricamento...</h2>
        </div>
      </ProteggiPagina>
    );
  }

  if (musicisti.length === 0 || !musicistaCorrente) {
    return (
      <ProteggiPagina>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: '#fff' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Nessun musicista trovato in zona</h2>
            <p>Torna più tardi o amplia i tuoi criteri!</p>
          </div>
        </div>
      </ProteggiPagina>
    );
  }

  const mediaCorrente = musicistaCorrente.media?.[currentMediaIndex];
  const isAudio = mediaCorrente?.tipo?.startsWith("audio");
  const isVideo = mediaCorrente?.tipo?.startsWith("video");

  return (
    <ProteggiPagina>
      {/* Container Full Screen simile a TikTok/Tinder */}
      <div
        className="fixed inset-0 bg-zinc-950 flex justify-center items-center overflow-hidden pt-6 pb-24 px-4 md:py-8 md:pb-8"
        onWheel={handleWheel}
      >
        <style>
          {`
            @keyframes pulseIcon {
              0% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); opacity: 0.8; }
            }
            @keyframes bounceUp {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes bounceDown {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(10px); }
            }
            @media (max-width: 768px) {
              .scroll-buttons-sidebar {
                display: none !important;
              }
            }
          `}
        </style>

        {/* Scheda Musicista */}
        <div
          className="relative w-full max-w-[450px] h-full max-h-[850px] flex flex-col overflow-hidden rounded-[32px] shadow-2xl border border-zinc-800/50"
          style={{
            backgroundColor: isAudio ? '#1e1b4b' : '#222', // Colore diverso per audio
          }}
        >
          {/* Render del Media */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000',
              cursor: isVideo ? 'pointer' : 'default'
            }}
            onClick={isVideo ? togglePlayPause : undefined}
          >
            {!mediaCorrente && (
              <div style={{ color: '#888', textAlign: 'center' }}>Nessun media pubblicato</div>
            )}

            {mediaCorrente && !isAudio && !isVideo && (
              <img
                src={mediaCorrente.source}
                alt="Media utente"
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
              />
            )}

            {isVideo && (
              <>
                <video
                  ref={videoRef}
                  src={mediaCorrente.source}
                  autoPlay
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Overlay Pausa/Play */}
                {!isPlaying && (
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px', height: '80px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div style={{
                      width: 0, height: 0,
                      borderTop: '20px solid transparent',
                      borderBottom: '20px solid transparent',
                      borderLeft: '30px solid white',
                      marginLeft: '10px'
                    }} />
                  </div>
                )}
              </>
            )}

            {isAudio && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '80px', animation: 'pulseIcon 2s infinite' }}>🎵</div>
                <audio ref={audioRef} src={mediaCorrente.source} controls autoPlay style={{ width: '80%' }} onClick={(e) => e.stopPropagation()} />
              </div>
            )}

            {/* Controlli Scorrimento Media (Freccette) */}
            {musicistaCorrente.media?.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button
                    onClick={prevMedia}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}
                  >
                    ❮
                  </button>
                )}
                {currentMediaIndex < musicistaCorrente.media.length - 1 && (
                  <button
                    onClick={nextMedia}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}
                  >
                    ❯
                  </button>
                )}

                {/* Indicatori (Dots) in alto */}
                <div style={{ position: 'absolute', top: '15px', display: 'flex', gap: '5px', zIndex: 10 }}>
                  {musicistaCorrente.media.map((_: any, idx: number) => (
                    <div key={idx} style={{ width: '30px', height: '4px', backgroundColor: idx === currentMediaIndex ? 'white' : 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                  ))}
                </div>
              </>
            )}

            {/* Sfumatura Overlay: Diversa se è Audio */}
            <div
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '50%',
                background: isAudio
                  ? 'linear-gradient(to top, rgba(88, 28, 135, 1), transparent)' // Viola per audio
                  : 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', // Nero per video/foto
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Dettagli Utente (Sopra la sfumatura) */}
          <div
            className="absolute left-5 right-5 text-white pointer-events-none z-10 bottom-[100px] md:bottom-[80px]"
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
          >
            <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {musicistaCorrente.username}
              <span
                style={{ fontSize: '1rem', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '12px', cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
              >
                ℹ️ Info
              </span>
            </h1>

            {/* Chilometri in grande */}
            {musicistaCorrente.distanceKm !== null && (
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>
                📍 A {musicistaCorrente.distanceKm} km da te
              </div>
            )}

            <p style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#e0e0e0' }}>
              {musicistaCorrente.strumenti?.length > 0
                ? musicistaCorrente.strumenti.map((s: any) => s.strumento.nome).join(" • ")
                : "Nessuno strumento"}
            </p>

            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#ccc' }}>
              {musicistaCorrente.generi?.length > 0
                ? musicistaCorrente.generi.map((g: any) => g.genere.nome).join(", ")
                : "Nessun genere"}
            </p>
          </div>

          {/* Azioni Rapide (Solo Match) */}
          <div className="absolute left-0 right-0 flex justify-center z-20 bottom-6 md:bottom-6">
            <button
              onClick={apriMatchModal}
              style={{
                padding: '15px 40px', borderRadius: '30px',
                background: 'linear-gradient(135deg, #4469efff 0%, #184fe4ff 100%)',
                color: 'white', fontWeight: 'bold', border: 'none',
                fontSize: '22px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 8px 20px rgba(68, 188, 239, 0.5)',
                textTransform: 'uppercase', letterSpacing: '1px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Match
            </button>
          </div>

          {/* Pulsante Torna alla Home / Esci */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              position: 'absolute', top: '20px', left: '20px',
              background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
              padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', zIndex: 20
            }}
          >
            ↩ Home
          </button>

          {/* Modale Info Espanso */}
          {showInfo && (
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                zIndex: 30,
                color: 'white',
                padding: '30px 20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                animation: 'pulseIcon 0.3s ease-out'
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
                style={{
                  alignSelf: 'flex-end', background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: 'white', padding: '10px 15px', borderRadius: '50%', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '15px'
                }}
              >
                ✕
              </button>
              
              <h2 style={{ fontSize: '2.2rem', marginBottom: '10px', color: '#0ea5e9' }}>{musicistaCorrente.username}</h2>
              {musicistaCorrente.livelloEsperienza && (
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#ccc' }}>
                  Livello: <span style={{ color: 'white' }}>{musicistaCorrente.livelloEsperienza}</span>
                </p>
              )}
              {musicistaCorrente.citta && (
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#ccc' }}>
                  Città: <span style={{ color: 'white' }}>{musicistaCorrente.citta}</span>
                </p>
              )}
              {musicistaCorrente.bio && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ color: '#aaa', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Biografia</h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.5, background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                    {musicistaCorrente.bio}
                  </p>
                </div>
              )}
              {musicistaCorrente.strumenti?.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ color: '#aaa', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Strumenti</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {musicistaCorrente.strumenti.map((s: any) => (
                      <span key={s.strumento.idStrumento} style={{ background: '#0ea5e9', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
                        {s.strumento.nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {musicistaCorrente.generi?.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ color: '#aaa', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Generi Preferiti</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {musicistaCorrente.generi.map((g: any) => (
                      <span key={g.genere.idGenere} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #555', padding: '8px 16px', borderRadius: '20px' }}>
                        {g.genere.nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => segnalaUtente(musicistaCorrente.idUtente)}
                style={{
                  width: '100%', padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
              >
                🚩 Segnala Utente
              </button>
            </div>
          )}

        </div>

        {/* --- Popup di Match --- */}
        {showMatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
              
              {/* Intestazione Modal */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse"></span>
                  Nuovo Match
                </h3>
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Corpo Modal */}
              <div className="p-6">
                <p className="text-sm text-zinc-300 mb-4">
                  Stai per inviare una richiesta di match a <strong className="text-[#0ea5e9]">{musicistaCorrente.username}</strong>.
                  Vuoi aggiungere un messaggio di presentazione?
                </p>
                <textarea
                  value={matchMessage}
                  onChange={(e) => setMatchMessage(e.target.value)}
                  placeholder="Scrivi qui il tuo messaggio (opzionale)..."
                  className="w-full h-32 bg-zinc-950 border border-zinc-700 text-white rounded-xl p-4 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all resize-none"
                />
              </div>

              {/* Azioni Modal */}
              <div className="p-5 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={confermaMatch}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] text-white rounded-xl font-bold shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Invia Match
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottoni laterali per andare Su/Giù - Fuori dalla card */}
        <div 
          className="scroll-buttons-sidebar"
          style={{ position: 'absolute', right: 'max(15px, calc(50% - 310px))', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 15 }}
        >
          {currentIndex > 0 && (
            <button
              onClick={indietro}
              style={{
                width: '60px', height: '60px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                fontSize: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              ▲
            </button>
          )}
          {currentIndex < musicisti.length - 1 && (
            <button
              onClick={avanti}
              style={{
                width: '60px', height: '60px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                fontSize: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              ▼
            </button>
          )}
        </div>

      </div>
    </ProteggiPagina>
  );
}