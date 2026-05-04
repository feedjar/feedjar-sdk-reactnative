/**
 * FeedJar React Native SDK — same HTTP contract as iOS `FeedJar` / `FeedJarClient`
 * and the Web SDK (`POST/GET …/ingest/feedback`, `fjr_` keys).
 *
 * Uses global `fetch` (Hermes / RN 0.71+). No native modules required.
 */

export type FeedbackType = "feedback" | "feature" | "support";

export type SubmitFeedbackInput = {
  type?: FeedbackType;
  message: string;
  email?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
};

export type IngestFeedbackResponse = {
  ok: true;
  id: string;
  createdAt: string;
};

export type ListFeedbackItem = {
  id: string;
  type: FeedbackType | string;
  message: string;
  email: string | null;
  rating: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ListFeedbackResponse = {
  feedback: ListFeedbackItem[];
};

export class FeedJarError extends Error {
  constructor(
    public readonly code:
      | "not_configured"
      | "validation"
      | "invalid_response"
      | "server",
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "FeedJarError";
  }
}

const DEFAULT_BASE = "https://api.feedjar.in";

let apiKey: string | null = null;
let baseUrl = DEFAULT_BASE;

/** Set API key once. Optionally override base URL (no trailing slash). */
export function configure(
  key: string,
  options?: { baseUrl?: string },
): void {
  apiKey = key;
  if (options?.baseUrl) {
    baseUrl = options.baseUrl.replace(/\/+$/, "");
  }
}

function requireKey(): string {
  if (!apiKey) {
    throw new FeedJarError(
      "not_configured",
      "FeedJar.configure(apiKey) was not called.",
    );
  }
  return apiKey;
}

function authHeaders(): Record<string, string> {
  const k = requireKey();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${k}`,
    "X-FeedJar-Key": k,
    "User-Agent": "FeedJarKit-ReactNative/0.1",
  };
}

/** Submit feedback (POST /ingest/feedback). Support requires an email containing `@`. */
export async function submit(
  input: SubmitFeedbackInput,
): Promise<IngestFeedbackResponse> {
  const type = input.type ?? "feedback";
  if (type === "support") {
    const e = input.email?.trim() ?? "";
    if (!e.includes("@")) {
      throw new FeedJarError(
        "validation",
        "Support requests require a valid email address.",
      );
    }
  }
  const res = await fetch(`${baseUrl}/ingest/feedback`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      type,
      message: input.message,
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new FeedJarError(
      "server",
      `FeedJar server error ${res.status}: ${text || "unknown"}`,
      res.status,
      text,
    );
  }
  return JSON.parse(text) as IngestFeedbackResponse;
}

/** List feedback for the keyed app (GET /ingest/feedback). */
export async function listFeedback(options?: {
  limit?: number;
  type?: FeedbackType;
}): Promise<ListFeedbackResponse> {
  const q = new URLSearchParams();
  if (options?.limit != null) q.set("limit", String(options.limit));
  if (options?.type) q.set("type", options.type);
  const qs = q.toString();
  const url = `${baseUrl}/ingest/feedback${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();
  if (!res.ok) {
    throw new FeedJarError(
      "server",
      `FeedJar server error ${res.status}: ${text || "unknown"}`,
      res.status,
      text,
    );
  }
  return JSON.parse(text) as ListFeedbackResponse;
}

/** @internal */
export function resetForTests(): void {
  apiKey = null;
  baseUrl = DEFAULT_BASE;
}
