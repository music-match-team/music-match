import { prisma } from "@/lib/prisma";

export async function GET() {
  const generi = await prisma.genere.findMany();

  return Response.json(generi);
}