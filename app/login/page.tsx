// "use client": Direttiva essenziale di Next.js. Indica che questo file deve essere eseguito sul browser 
// dell'utente (Client) e non sul server. Questo ci permette di usare interattività (click, form, stati).
"use client";

// Importiamo useState (per la memoria reattiva) ed useEffect (per azioni automatiche all'avvio) dalla libreria React.
import { useState, useEffect } from "react";
// Importiamo useRouter per permettere la navigazione tra le pagine senza ricaricare il sito.
import { useRouter } from "next/navigation";

// Esportiamo la funzione principale del componente pagina. "default" indica a Next.js che è il contenuto primario del file.
export default function LoginPage() {
  // Inizializziamo il router e lo salviamo nella costante 'router' per poterlo usare dopo (es. router.push).
  const router = useRouter();
  
  // STATI DEL COMPONENTE (La memoria reattiva)
  // useState<any>(null): Stato tipizzato come 'any' (qualsiasi dato), parte come 'null'. Salverà i dati dell'utente loggato.
  const [utente, setUtente] = useState<any>(null);
  // Stato per l'email, inizializzato a stringa vuota.
  const [email, setEmail] = useState("");
  // Stato per la password, inizializzato a stringa vuota.
  const [password, setPassword] = useState("");
  // Stato per controllare se la password è visibile o nascosta (inizia nascosta = false).
  const [showPassword, setShowPassword] = useState(false);
  // Stato per memorizzare gli eventuali messaggi di errore inviati dal server.
  const [errore, setErrore] = useState("");
  // Stato per indicare se stiamo aspettando una risposta dal server (inizia falso).
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect esegue questa funzione automaticamente non appena il componente viene montato (visualizzato a schermo).
  useEffect(() => {
    // Cerchiamo nel "localStorage" (la memoria del browser) se c'è un elemento chiamato "utente". 
    // Se non c'è, restituiamo la stringa "null". Convertiamo poi la stringa in oggetto JavaScript con JSON.parse.
    const u = JSON.parse(
      localStorage.getItem("utente") || "null"
    );
    // Salviamo l'utente trovato nello stato.
    setUtente(u);
    // Se l'utente esiste (ha già fatto il login in passato), lo reindirizziamo direttamente alla pagina dei musicisti.
    if (u) {
      router.push("/musicisti");
    }
  // [router] è l'array delle dipendenze. useEffect si ricalcolerebbe se 'router' cambiasse (qui non cambia mai).
  }, [router]);

  // Funzione asincrona chiamata quando l'utente preme il tasto "Accedi" (evento di submit del form).
  async function handleSubmit(e: React.FormEvent) {
    // e.preventDefault() ferma il comportamento predefinito del form HTML (ovvero ricaricare tutta la pagina web).
    e.preventDefault();
    
    // Controlliamo che l'utente abbia compilato entrambi i campi.
    if (!email || !password) {
      // Se ne manca uno, mostriamo un errore. React lo disegnerà in rosso.
      setErrore("Inserisci sia l'email che la password");
      // Fermiamo l'esecuzione della funzione.
      return;
    }

    // Se i dati ci sono, cancelliamo eventuali vecchi errori.
    setErrore("");
    // Attiviamo lo stato di "caricamento" per mostrare la rotellina e bloccare il pulsante.
    setIsSubmitting(true);

    try {
      // Usiamo 'fetch' per chiamare il nostro backend. 'await' blocca l'esecuzione finché il server non risponde.
      const response = await fetch("/api/login", {
        // Metodo POST, usato per inviare dati sensibili nascosti.
        method: "POST",
        // Diciamo al server che stiamo inviando dati in formato JSON.
        headers: {
          "Content-Type": "application/json",
        },
        // Convertiamo l'email e la password in una stringa JSON e la inviamo.
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Se la risposta non è "ok" (es. errore 401 per credenziali sbagliate)...
      if (!response.ok) {
        try {
          // Proviamo a leggere l'errore specifico inviato dal server.
          const data = await response.json();
          // Stampiamo l'errore del server o, se non c'è, uno generico.
          setErrore(data.error || "Errore durante l'accesso.");
        } catch {
          // Se non riusciamo a leggere l'errore del server, mostriamo un messaggio fisso.
          setErrore("Credenziali errate. Riprova.");
        }
        // Spegniamo l'animazione di caricamento.
        setIsSubmitting(false);
        // Fermiamo la funzione.
        return;
      }

      // Se arriviamo qui, il server ha detto OK (status 200). Leggiamo i dati dell'utente.
      const utenteLoggato = await response.json();
      // Salviamo l'utente nel localStorage così non dovrà rimettere la password domani.
      localStorage.setItem("utente", JSON.stringify(utenteLoggato));
      // Lanciamo un evento invisibile al browser, così che altri componenti (es. il menu) si accorgano del login.
      window.dispatchEvent(new Event("utenteAggiornato"));
      // Lo mandiamo dentro l'app!
      router.push("/musicisti");
    } catch (e) {
      // Questo blocco cattura errori di rete gravi (es. wifi spento).
      console.error(e);
      setErrore("Errore durante il login. Controlla la connessione.");
      setIsSubmitting(false);
    }
  }

  return (
    // CONTENITORE PRINCIPALE
    // min-h-screen: Altezza minima 100% dell'altezza dello schermo visibile (100vh).
    // bg-[#12121a]: Colore di sfondo scuro personalizzato (grigio notte).
    // flex, flex-col: Usa Flexbox posizionando i figli in verticale (colonna).
    // justify-center, items-center: Centra tutto perfettamente sia verticalmente che orizzontalmente.
    // px-4, py-12: Padding orizzontale (16px) e verticale (48px) per dare respiro sui bordi.
    // relative, overflow-hidden: Crea un posizionamento relativo per i cerchi assoluti interni, e nasconde ciò che esce dallo schermo.
    <div className="min-h-screen bg-[#12121a] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* SFONDI DECORATIVI */}
      {/* absolute: Posizionamento slegato dal flusso del documento. top-1/4, left-1/4: Posizionato a 25% dall'alto e da sinistra.
          -translate-x-1/2, -translate-y-1/2: Centra esattamente il cerchio sul punto indicato.
          w-80, h-80: Larghezza e altezza di 20rem (320px). rounded-full: Crea un cerchio perfetto.
          bg-[#0ea5e9]/10: Colore azzurro chiaro con opacità al 10%. blur-3xl: Sfocatura fortissima (64px) per l'effetto alone.
          pointer-events-none: Ignora i click del mouse per non dare fastidio al form sottostante. */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none"></div>
      
      {/* Secondo alone luminoso simile al primo, ma posizionato in basso a destra (bottom-1/4, right-1/4) e leggermente più grande (w-96). */}
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#0284c7]/10 blur-3xl pointer-events-none"></div>

      {/* CONTENITORE DEL FORM */}
      {/* w-full, max-w-md: Occupa tutto lo spazio possibile, ma non superare la grandezza "medium" (28rem = 448px).
          z-10: Sta sopra gli sfondi decorativi (che hanno z-index 0 o base). space-y-8: Aggiunge uno spazio verticale di 2rem tra l'header e il form. */}
      <div className="w-full max-w-md z-10 space-y-8">
        
        {/* LOGO ED HEADER */}
        {/* text-center: Centra orizzontalmente tutto il testo all'interno. */}
        <div className="text-center">
          {/* flex, justify-center: Usa flexbox per centrare il logo orizzontalmente. mb-6: Margine in basso (1.5rem). */}
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* h-16: Altezza di 4rem. w-auto: Larghezza automatica in proporzione. object-contain: Non distorce l'immagine.
                hover:scale-105: Ingrandisce l'immagine del 5% passandoci sopra col mouse. transition-transform: Anima questo ingrandimento. cursor-pointer: Mostra la manina. */}
            <img src="/logo.png" alt="Music match logo" className="h-16 w-auto object-contain hover:scale-105 transition-transform cursor-pointer" />
          </div>
          {/* text-3xl: Testo molto grande. font-extrabold: Grassetto estremo. text-white: Colore bianco. tracking-tight: Riduce leggermente lo spazio tra le lettere per farle sembrare più "compatte". */}
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Accedi a MusicMatch
          </h2>
          {/* mt-2: Margine in alto. text-sm: Testo piccolo. text-gray-400: Grigio medio-chiaro per fare contrasto col titolo. */}
          <p className="mt-2 text-sm text-gray-400">
            Trova nuovi musicisti, crea band e partecipa ad eventi nella tua zona
          </p>
        </div>

        {/* CARD DEL FORM */}
        {/* bg-[#1e1e24]: Colore grigio poco più chiaro dello sfondo per creare distacco. border, border-[#2d2d3a]: Un bordino sottile di colore grigio medio per definire la card.
            rounded-2xl: Angoli molto arrotondati. p-8: Padding interno largo su tutti i lati. shadow-2xl: Ombra molto grande ed evidente dietro la card. */}
        <div className="bg-[#1e1e24] border border-[#2d2d3a] rounded-2xl p-8 shadow-2xl">
          
          {/* RENDERING CONDIZIONALE: Se c'è un errore, disegna il box rosso. */}
          {errore && (
            // mb-6: Margine in basso. p-3: Padding interno. bg-red-900/20: Rosso scuro al 20% di opacità per lo sfondo.
            // border, border-red-800/50: Bordo rosso scuro semitrasparente. text-red-400: Testo rosso acceso.
            // rounded-lg: Angoli arrotondati classici. text-sm: Testo piccolo. font-medium: Grassetto leggero.
            // flex, items-center, gap-2: Dispone icona e testo in riga centrata, separandoli di 0.5rem (gap).
            <div className="mb-6 p-3 bg-red-900/20 border border-red-800/50 text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
              {/* flex-shrink-0: Impedisce all'icona di schiacciarsi se il testo dell'errore va a capo ed è lungo. */}
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errore}
            </div>
          )}

          {/* FORM: space-y-5 aggiunge 1.25rem di distanza verticale automatica tra ogni blocco al suo interno. */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* GRUPPO EMAIL */}
            <div>
              {/* block: L'etichetta occupa l'intera riga. text-xs: Carattere microscopico. font-semibold: Grassetto.
                  uppercase: Tutto in maiuscolo. tracking-wider: Spaziatura larghissima tra le lettere. mb-2: Margine in basso. */}
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              {/* relative: Fondamentale perché l'icona interna userà un posizionamento assoluto rispetto a questo div. */}
              <div className="relative">
                {/* absolute: Posizionato libero. inset-y-0: Copre da cima a fondo (top:0, bottom:0) per potersi centrare in altezza col "flex items-center".
                    left-0: Appiccicato a sinistra. pl-3.5: Padding a sinistra per non attaccarsi al bordo (0.875rem). text-gray-500: Colore icona grigio scuro. pointer-events-none: L'utente non può cliccare l'icona. */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* INPUT CONTROLLATO */}
                {/* value={email}: Lega il valore al taccuino (Stato). onChange: Aggiorna il taccuino ad ogni tasto premuto. */}
                {/* w-full: Larghezza 100%. pl-11: Padding larghissimo a sinistra per non sovrapporsi all'icona SVG (11 unità = 2.75rem).
                    pr-4: Padding a destra normale. py-3: Padding alto e basso generoso (0.75rem). bg-[#12121a], border, border-[#2d2d3a]: Sfondo nero e bordo grigio.
                    rounded-xl: Angoli ben arrotondati. text-white: Testo scritto in bianco. placeholder-gray-500: Testo "nome@esempio.com" in grigio.
                    focus:outline-none: Tira via il bordo di default sgradevole del browser quando cliccato (focus).
                    focus:ring-2, focus:ring-[#0ea5e9]: Quando cliccato, disegna un anello esterno di 2px colorato di azzurro brillante.
                    focus:border-transparent: Nasconde il bordo grigio di base quando l'anello azzurro è attivo. transition-all: Fa accendere l'azzurro morbidamente. */}
                <input
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#12121a] border border-[#2d2d3a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* GRUPPO PASSWORD */}
            <div>
              {/* Etichetta CSS identica a quella per l'email */}
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                {/* Icona lucchetto a sinistra, posizionata esattamente come la busta della mail */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM12 11V7a4 4 0 018 0v4h-8z" />
                  </svg>
                </div>
                {/* Il tipo dell'input cambia dinamicamente in base allo stato showPassword */}
                {/* pr-12: Padding di destra gigantesco (3rem) per lasciare molto spazio al bottone dell'occhietto! Le altre classi sono identiche a quelle dell'email. */}
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-[#12121a] border border-[#2d2d3a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
                  required
                />
                
                {/* BOTTONE MOSTRA PASSWORD */}
                {/* absolute: Posizione assoluta. right-0: Appiccicato al bordo destro dell'input. pr-3.5: Staccato leggermente dal bordo (0.875rem).
                    flex, items-center: Centra in verticale l'icona. text-gray-400: Colore icona grigio base. 
                    hover:text-white: Se il mouse ci passa sopra diventa bianco per far capire che è interagibile. transition-colors: Il colore cambia fluidamente in un istante. cursor-pointer: Mostra il puntatore a forma di manina. */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Al click, inverte il valore booleano nel taccuino
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {/* Rendering condizionale: Se showPassword è vero, mostra l'occhio sbarrato (per nascondere) */}
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    /* Altrimenti mostra l'occhio normale (per rivelare) */
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* ZONA SUBMIT */}
            {/* pt-2: Aggiunge un padding in alto (0.5rem) aggiuntivo rispetto allo space-y-5 del form, per distanziare maggiormente il bottone dai campi. */}
            <div className="pt-2">
              {/* IL BOTTONE PRINCIPALE DI LOGIN */}
              {/* w-full: 100% di larghezza della card. py-3, px-4: Padding verticale (0.75rem) e orizzontale (1rem). bg-[#0ea5e9]: Colore base azzurro acceso di Tailwind.
                  hover:bg-[#0284c7]: Quando il mouse ci passa sopra (hover), l'azzurro diventa un tono più scuro. text-white, font-bold: Testo bianco e in grassetto pesante. rounded-xl: Angoli molto arrotondati.
                  shadow-lg, shadow-[#0ea5e9]/20: Aggiunge un'ombra sfumata e larga (lg) e la colora di azzurro al 20% di opacità. hover:shadow-[#0ea5e9]/30: Col mouse l'ombra diventa più intensa (30%).
                  hover:scale-[1.01]: Al passaggio del mouse l'intero bottone si allarga impercettibilmente (dell'1%) creando un effetto 3D. active:scale-[0.99]: Al momento in cui premi fisicamente il click (active) il bottone si schiaccia all'interno (meno dell'1%).
                  transition-all: Fa in modo che tutti i cambi (colore, ombra e ingrandimento) siano animati fluidamente in circa 150ms. flex, items-center, justify-center, gap-2: Trasforma il contenuto del bottone in Flexbox per allineare il testo e l'eventuale rotellina al centro esatto, separandoli di 0.5rem (gap).
                  disabled:opacity-50: Se il bottone è "spento" (disabled), dimezza la sua visibilità (50%). disabled:cursor-not-allowed: Cambia il cursore col simbolo di divieto. */}
              <button
                type="submit"
                disabled={isSubmitting} // Se stiamo caricando l'API, il bottone si "congela" nativamente.
                className="w-full py-3 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {/* Condizione: Se isSubmitting è vero (stiamo chiamando il server), mostriamo la rotellina e il testo alternativo */}
                {isSubmitting ? (
                  <>
                    {/* animate-spin: Una classe CSS magica di Tailwind che fa ruotare l'SVG di 360 gradi all'infinito in modo lineare! */}
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Accesso in corso...
                  </>
                ) : (
                  // Altrimenti solo il testo standard di base
                  "Accedi"
                )}
              </button>
            </div>
          </form>

          {/* LINK REGISTRAZIONE per gli utenti senza account */}
          {/* mt-8: Margine superiore molto grande (2rem) per staccarlo pesantemente dal form. text-center: Centra il testo. 
              border-t, border-[#2d2d3a]: Aggiunge una riga divisoria (bordo top) sottile grigia. pt-6: Padding superiore (1.5rem) per distanziare il testo dalla riga appena creata. */}
          <div className="mt-8 text-center border-t border-[#2d2d3a] pt-6">
            <p className="text-sm text-gray-400 font-medium">
              Non hai ancora un account?
            </p>
            {/* mt-2: Margine alto piccolo. text-sm, font-bold: Testo piccolo grassetto. text-[#0ea5e9]: Scritta del link di colore azzurro primario. 
                hover:text-[#38bdf8]: Il colore azzurro diventa molto più brillante (sky-400) quando ci passi sopra col mouse. hover:underline: Quando passi col mouse compare la classica riga sotto i link.
                cursor-pointer: Mostra la manina. transition-colors: Fa sì che il colore cambi morbidamente e non di scatto. */}
            <button
              onClick={() => router.push("/register")} // Al click usa il router React per saltare istantaneamente alla pagina /register
              className="mt-2 text-sm font-bold text-[#0ea5e9] hover:text-[#38bdf8] hover:underline cursor-pointer transition-colors"
            >
              Registrati ora gratuitamente
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}