import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Funzione helper per calcolare la distanza in km (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Raggio della terra in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distanza in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idUtente = searchParams.get('idUtente');

  let currentUtente = null;
  if (idUtente) {
    currentUtente = await prisma.utente.findUnique({
      where: { idUtente: parseInt(idUtente) },
      include: {
        generi: true,
        matchCreati: true,
        matchRicevuti: true
      }
    });
  }

  const musicisti = await prisma.utente.findMany({
    select: {
      idUtente: true,
      username: true,
      bio: true,
      livelloEsperienza: true,
      citta: true,
      lat: true,
      long: true,
      strumenti: {
        include: {
          strumento: true
        }
      },
      generi: {
        include: {
          genere: true
        }
      },
      media: true
    }
  });

  // Se l'utente non è loggato o non trovato, ritorna i musicisti non ordinati
  if (!currentUtente) {
    return Response.json(musicisti);
  }

  const currentLat = currentUtente.lat;
  const currentLong = currentUtente.long;
  const currentGeneriIds = currentUtente.generi.map((g: any) => g.idGenere);

  // Trova gli ID degli utenti con cui c'è già un match
  const matchedUserIds = new Set([
    ...currentUtente.matchCreati.map((m: any) => m.idUtenteOttiene),
    ...currentUtente.matchRicevuti.map((m: any) => m.idUtenteOrigina)
  ]);

  const musicistiScored = musicisti
    .filter((m: any) => m.idUtente !== currentUtente!.idUtente && !matchedUserIds.has(m.idUtente))
    .map((m: any) => {
      let score = 0;
      let distanceKm = null;

      // Punteggio per generi in comune (+10 punti per ogni genere)
      const generiInComune = m.generi.filter((g: any) => currentGeneriIds.includes(g.genere.idGenere)).length;
      score += generiInComune * 10;

      // Punteggio per la distanza
      if (currentLat != null && currentLong != null && m.lat != null && m.long != null) {
        distanceKm = getDistanceFromLatLonInKm(currentLat, currentLong, m.lat, m.long);
        
        // Decadimento: a 0 km prendi 50 punti. -1 punto ogni 10 km.
        const distanceScore = Math.max(0, 50 - (distanceKm / 10)); 
        score += distanceScore;
      }

      return {
        ...m,
        distanceKm: distanceKm !== null ? Math.round(distanceKm) : null,
        score
      };
    });

  // Ordina per score decrescente
  musicistiScored.sort((a: any, b: any) => b.score - a.score);

  return Response.json(musicistiScored);
}