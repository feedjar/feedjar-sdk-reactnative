import { feedJarClientSubmit } from "./feedjar-client.js";
import { FeedJarErrorCode, FeedJarException } from "./feedjar-error.js";
import {
  FeedbackType,
  type FeedbackType as FeedbackTypeValue,
} from "./models.js";

const DEFAULT_BASE = "https://api.feedjar.in";

let apiKey: string | null = null;

/**
 * FeedJarKit configuration + programmatic submit (parity with iOS `enum FeedJar`).
 */
export namespace FeedJar {
  /** Integrated API base URL (same default as iOS). Override for local/self-hosted stacks. */
  export let defaultApiBaseUrl = DEFAULT_BASE;

  /** Configure the SDK once at app launch with your app's API key from the dashboard. */
  export function configure(apiKeyValue: string): void {
    apiKey = apiKeyValue;
  }

  /**
   * Submit feedback programmatically (for custom UI integrations).
   * Support requests must include a non-empty email containing `@`.
   */
  export async function submit(options: {
    type?: FeedbackTypeValue;
    message: string;
    email?: string;
    rating?: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const type = options.type ?? FeedbackType.feedback;
    if (type === FeedbackType.support) {
      const trimmed = options.email?.trim() ?? "";
      if (!trimmed.includes("@")) {
        throw new FeedJarException(
          FeedJarErrorCode.validation,
          "Support requests require a valid email address.",
        );
      }
    }

    const key = apiKey;
    if (!key) {
      throw new FeedJarException(
        FeedJarErrorCode.notConfigured,
        "FeedJar.configure(apiKey:) was not called.",
      );
    }

    const email =
      type === FeedbackType.support
        ? options.email?.trim()
        : options.email?.trim() || undefined;

    await feedJarClientSubmit({
      apiKey: key,
      baseUrl: defaultApiBaseUrl,
      type,
      message: options.message,
      email: email || undefined,
      rating: options.rating,
      metadata: options.metadata,
    });
  }

  /** @internal */
  export function resetForTests(): void {
    apiKey = null;
    defaultApiBaseUrl = DEFAULT_BASE;
  }

  /** @internal */
  export function currentApiKeyForTests(): string | null {
    return apiKey;
  }
}
