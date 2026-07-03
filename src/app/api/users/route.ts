import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      status: true,
    },
  });

  return NextResponse.json(users);
}