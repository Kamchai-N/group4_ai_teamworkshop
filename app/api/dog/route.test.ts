import { describe, it, expect, vi, beforeEach } from "vitest";

// Inline mock for fetch — we control what random.dog returns
function makeFetchMock(responses: Array<{ url: string }>) {
  let callCount = 0;
  return vi.fn(async () => ({
    json: async () => ({ fileSizeBytes: 1000, url: responses[callCount++ % responses.length].url }),
  }));
}

// No .js extension — Vitest resolves .ts automatically
async function getRoute() {
  vi.resetModules();
  return import("./route");
}

describe("GET /api/dog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns { url, dogId } when first response is an image URL", async () => {
    global.fetch = makeFetchMock([{ url: "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg" }]) as any;
    const { GET } = await getRoute();
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe("https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg");
    expect(body.dogId).toBe("d40de385-3626-46c8-94bf-b7097226174f");
    expect(body.fileSizeBytes).toBeUndefined();
  });

  it("retries on .mp4 and returns the first image URL found", async () => {
    global.fetch = makeFetchMock([
      { url: "https://random.dog/video.mp4" },
      { url: "https://random.dog/cute-dog.jpg" },
    ]) as any;
    const { GET } = await getRoute();
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe("https://random.dog/cute-dog.jpg");
    expect(body.dogId).toBe("cute-dog");
  });

  it("returns 500 after 5 attempts all returning non-image URLs", async () => {
    global.fetch = makeFetchMock([{ url: "https://random.dog/video.mp4" }]) as any;
    const { GET } = await getRoute();
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/5 attempts/);
    expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(5);
  });

  it("accepts .webp URLs as valid images", async () => {
    global.fetch = makeFetchMock([{ url: "https://random.dog/fluffy.webp" }]) as any;
    const { GET } = await getRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe("https://random.dog/fluffy.webp");
  });
});
