import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { streamServer } from "@/lib/stream";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique name
    const ext = path.extname(file.name) || ".jpg";
    const filename = `avatar_${session.user.id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const origin = new URL(request.url).origin;
    const imageUrl = `/uploads/${filename}`;
    const absoluteImageUrl = `${origin}${imageUrl}`;

    // Update database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: absoluteImageUrl },
    });

    // Update stream chat
    await streamServer.upsertUser({
      id: session.user.id,
      name: session.user.name || "User",
      image: absoluteImageUrl,
    });

    return NextResponse.json({ imageUrl: absoluteImageUrl });
  } catch (error) {
    console.error("Profile upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, status } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (status !== "online" && status !== "offline") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        status: status,
      },
    });

    // Update stream chat
    await streamServer.upsertUser({
      id: session.user.id,
      name: name,
      image: updatedUser.image || undefined,
      status: status,
    } as any);

    return NextResponse.json({
      name: updatedUser.name,
      status: updatedUser.status,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
