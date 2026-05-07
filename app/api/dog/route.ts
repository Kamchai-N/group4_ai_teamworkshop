import { NextResponse } from "next/server";

const RANDOM_DOG_URL = "https://random.dog/woof.json";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const MAX_ATTEMPTS = 5;

function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));
}

function extractDogId(url: string): string {
  return url.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
}

export async function GET(): Promise<NextResponse> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(RANDOM_DOG_URL, { cache: "no-store" });
    const data = (await res.json()) as { fileSizeBytes: number; url: string };

    if (isImageUrl(data.url)) {
      return NextResponse.json({ url: data.url, dogId: extractDogId(data.url) });
    }
  }

  return NextResponse.json(
    { error: `Could not fetch a valid dog image after ${MAX_ATTEMPTS} attempts` },
    { status: 500 }
  );
}
