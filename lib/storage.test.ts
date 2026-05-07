import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";

// Mock process.cwd() to point to a temp dir so storage.ts
// uses a temp location during tests. Re-import storage after mocking.

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogtinder-"));
  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// Dynamic import after cwd mock is set (no .js extension — Vitest resolves .ts)
async function getStorage() {
  vi.resetModules();
  return import("./storage");
}

describe("ensureStore", () => {
  it("creates /data dir and swipes.json when neither exists", async () => {
    const { ensureStore } = await getStorage();
    await ensureStore();
    const stat = await fs.stat(path.join(tmpDir, "data", "swipes.json"));
    expect(stat.isFile()).toBe(true);
    const content = await fs.readFile(path.join(tmpDir, "data", "swipes.json"), "utf-8");
    expect(content).toBe("[]");
  });

  it("is idempotent — safe to call multiple times", async () => {
    const { ensureStore } = await getStorage();
    await ensureStore();
    await ensureStore();
    const content = await fs.readFile(path.join(tmpDir, "data", "swipes.json"), "utf-8");
    expect(content).toBe("[]");
  });
});

describe("readSwipes", () => {
  it("returns empty array on fresh install", async () => {
    const { readSwipes } = await getStorage();
    const result = await readSwipes();
    expect(result).toEqual([]);
  });
});

describe("appendSwipe", () => {
  it("returns the written record", async () => {
    const { appendSwipe } = await getStorage();
    const record = { dogId: "x", imageUrl: "y", action: "like" as const, username: "z", timestamp: "t" };
    const result = await appendSwipe(record);
    expect(result).toEqual(record);
  });

  it("persists record — subsequent readSwipes includes it", async () => {
    const { appendSwipe, readSwipes } = await getStorage();
    const record = { dogId: "abc", imageUrl: "http://example.com/dog.jpg", action: "dislike" as const, username: "alice", timestamp: "2026-05-08T10:00:00Z" };
    await appendSwipe(record);
    const all = await readSwipes();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(record);
  });

  it("appends — two calls produce array of length 2", async () => {
    const { appendSwipe, readSwipes } = await getStorage();
    const r = { dogId: "a", imageUrl: "u", action: "like" as const, username: "u", timestamp: "t" };
    await appendSwipe(r);
    await appendSwipe({ ...r, dogId: "b" });
    const all = await readSwipes();
    expect(all).toHaveLength(2);
  });
});
