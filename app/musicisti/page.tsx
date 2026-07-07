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

  async function creaMatch(idUtenteOttiene: number) {
    const messaggio = prompt("Scrivi un messaggio per presentarti (opzionale):");
    if (messaggio === null) return;

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUtenteOrigina: utente.idUtente,
          idUtenteOttiene,
          messaggio,
        }),
      });

      const data = await response.json();

      if (response.ok && data.match) {
        router.push(`/chat/${data.match.idMatch}`);
      } else {
        alert(data.message || data.error);
        if (data.match) {
          router.push(`/chat/${data.match.idMatch}`);
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
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
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
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '450px',
            height: '100%',
            maxHeight: '850px',
            backgroundColor: isAudio ? '#1e1b4b' : '#222', // Colore diverso per audio
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '24px' // Arrotondamento della scheda
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
                height: '40%',
                background: isAudio
                  ? 'linear-gradient(to top, rgba(88, 28, 135, 1), transparent)' // Viola per audio
                  : 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', // Nero per video/foto
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Dettagli Utente (Sopra la sfumatura) */}
          <div
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '20px',
              right: '20px',
              color: 'white',
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
              pointerEvents: 'none' // Per poter cliccare lo sfondo
            }}
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
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: 0, right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 20
            }}
          >
            <button
              onClick={() => creaMatch(musicistaCorrente.idUtente)}
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

          {/* I bottoni laterali sono stati spostati fuori dalla scheda (in basso nel codice) */}

          {/* Modale Info Espanso */}
          {showInfo && (
            <div
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '60%',
                backgroundColor: 'rgba(20,20,20,0.95)',
                color: 'white',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '30px 20px',
                overflowY: 'auto',
                zIndex: 30,
                boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              <style>{`
                @keyframes slideUp {
                  from { transform: translateY(100%); }
                  to { transform: translateY(0); }
                }
              `}</style>

              <button
                onClick={() => setShowInfo(false)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>

              <h2 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>{musicistaCorrente.username}</h2>

              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#888', display: 'block', fontSize: '0.9rem' }}>Esperienza</strong>
                {musicistaCorrente.livelloEsperienza || "Non specificata"}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#888', display: 'block', fontSize: '0.9rem' }}>Città</strong>
                {musicistaCorrente.citta || "Non specificata"}
              </div>

              <div style={{ marginBottom: '25px' }}>
                <strong style={{ color: '#888', display: 'block', fontSize: '0.9rem' }}>Biografia</strong>
                <p style={{ margin: '5px 0', lineHeight: '1.5' }}>{musicistaCorrente.bio || "Nessuna biografia inserita."}</p>
              </div>

              <button
                onClick={() => segnalaUtente(musicistaCorrente.idUtente)}
                style={{
                  width: '100%', padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🚩 Segnala Utente
              </button>
            </div>
          )}

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

        </div>

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