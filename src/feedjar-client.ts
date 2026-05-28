import { FeedJarErrorCode, FeedJarException } from "./feedjar-error.js";
import type { FeedbackType } from "./models.js";

/** Internal HTTP client (parity with Swift `FeedJarClient`). */
export async function feedJarClientSubmit(params: {
  apiKey: string;
  baseUrl: string;
  type: FeedbackType;
  message: string;
  email?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { apiKey, baseUrl, type, message, email, rating, metadata } = params;

  const body: Record<string, unknown> = { type, message };
  if (email !== undefined) body.email = email;
  if (rating !== undefined) body.rating = rating;
  if (metadata !== undefined) body.metadata = metadata;

  const res = await fetch(`${baseUrl}/ingest/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-FeedJar-Key": apiKey,
      "User-Agent": "FeedJarKit-ReactNative/0.1",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new FeedJarException(
      FeedJarErrorCode.server,
      `FeedJar server error ${res.status}: ${text || "unknown"}`,
      res.status,
      text || undefined,
    );
  }
}
