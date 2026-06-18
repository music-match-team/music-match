import { prisma } from "@/lib/prisma";

export async function GET() {

  const strumenti =
    await prisma.strumento.findMany();

  return Response.json(strumenti);
}