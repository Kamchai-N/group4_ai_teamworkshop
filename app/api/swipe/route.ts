import { NextRequest, NextResponse } from "next/server";
import { appendSwipe, SwipeRecord } from "@/lib/storage";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { dogId, imageUrl, action, username } = body as Record<string, unknown>;

  if (!dogId || typeof dogId !== "string") {
    return NextResponse.json({ error: "Missing or invalid dogId" }, { status: 400 });
  }
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Missing or invalid imageUrl" }, { status: 400 });
  }
  if (action !== "like" && action !== "dislike") {
    return NextResponse.json({ error: "action must be 'like' or 'dislike'" }, { status: 400 });
  }
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Missing or invalid username" }, { status: 400 });
  }

  const record: SwipeRecord = {
    dogId,
    imageUrl,
    action,
    username,
    timestamp: new Date().toISOString(),
  };

  const saved = await appendSwipe(record);
  return NextResponse.json(saved);
}
