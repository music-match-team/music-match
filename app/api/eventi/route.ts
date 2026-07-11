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
  try {
    const searchParams = request.nextUrl.searchParams;
    const idUtente = searchParams.get('idUtente');

    let currentUtente = null;
    if (idUtente) {
      currentUtente = await prisma.utente.findUnique({
        where: { idUtente: parseInt(idUtente) }
      });
    }

    const eventi = await prisma.evento.findMany({
      include: {
        creatori: {
          include: {
            utente: true
          }
        },
        partecipanti: {
          select: { idUtente: true }
        },
        citta: true,
        _count: {
          select: { partecipanti: true }
        }
      },
      orderBy: {
        data: "asc"
      }
    });

    if (!currentUtente || currentUtente.lat == null || currentUtente.long == null) {
      return Response.json(eventi);
    }

    const currentLat = currentUtente.lat;
    const currentLong = currentUtente.long;

    const eventiScored = eventi.map((e: any) => {
      let distanceKm = null;
      if (e.lat != null && e.long != null) {
        distanceKm = getDistanceFromLatLonInKm(currentLat, currentLong, e.lat, e.long);
      }
      return {
        ...e,
        distanceKm: distanceKm !== null ? Math.round(distanceKm) : null
      };
    });

    // Ordina per distanza crescente
    eventiScored.sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      }
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      
      if (a.distanceKm === b.distanceKm) {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      }
      return a.distanceKm - b.distanceKm;
    });

    return Response.json(eventiScored);
  } catch (error: any) {
    console.error("Errore Prisma:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  let dbCitta = await prisma.citta.findFirst({
    where: { nome: body.luogo }
  });

  if (!dbCitta) {
    dbCitta = await prisma.citta.create({
      data: { nome: body.luogo }
    });
  }

  const evento =
    await prisma.evento.create({
      data: {
        titolo: body.titolo,
        descrizione: body.descrizione,
        idCitta: dbCitta.idCitta,
        lat: body.lat,
        long: body.long,
        locandina: body.locandina,
        data: new Date(body.data),
        creatori: {
          create: {
            idUtente: body.idOrganizzatore
          }
        }
      }
    });

  return Response.json(
    evento
  );
}