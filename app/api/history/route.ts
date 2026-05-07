import { NextResponse } from "next/server";
import { readSwipes } from "@/lib/storage";

export async function GET(): Promise<NextResponse> {
  const records = await readSwipes();
  return NextResponse.json(records);
}
