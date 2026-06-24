import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const contact = await prisma.contact.create({ data: body });
  return Response.json(contact);
}

export async function GET() {
  const contacts = await prisma.contact.findMany();
  return Response.json(contacts);
}
