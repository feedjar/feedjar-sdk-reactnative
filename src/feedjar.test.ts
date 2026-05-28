import { afterEach, describe, expect, it } from "vitest";

import { FeedJar } from "./feedjar.js";
import { FeedJarErrorCode, FeedJarException } from "./feedjar-error.js";
import { FeedbackType, feedbackTypeDisplayName } from "./models.js";

afterEach(() => {
  FeedJar.resetForTests();
});

describe("FeedJar", () => {
  it("submit without configure throws notConfigured", async () => {
    await expect(FeedJar.submit({ message: "hello" })).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof FeedJarException &&
        error.code === FeedJarErrorCode.notConfigured,
    );
  });

  it("configure stores api key", () => {
    FeedJar.configure("fjr_test");
    expect(FeedJar.currentApiKeyForTests()).toBe("fjr_test");
  });

  it("uses integrated base URL by default", () => {
    FeedJar.configure("fjr_test");
    expect(FeedJar.defaultApiBaseUrl).toBe("https://api.feedjar.in");
  });

  it("support without valid email throws validation", async () => {
    FeedJar.configure("fjr_test");
    await expect(
      FeedJar.submit({ type: FeedbackType.support, message: "Need help" }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof FeedJarException &&
        error.code === FeedJarErrorCode.validation,
    );
  });

  it("support with invalid email shape throws validation", async () => {
    FeedJar.configure("fjr_test");
    await expect(
      FeedJar.submit({
        type: FeedbackType.support,
        message: "Need help",
        email: "not-an-email",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof FeedJarException &&
        error.code === FeedJarErrorCode.validation,
    );
  });
});

describe("FeedbackType", () => {
  it("has display names", () => {
    expect(feedbackTypeDisplayName(FeedbackType.feedback)).toBe("Feedback");
    expect(feedbackTypeDisplayName(FeedbackType.feature)).toBe(
      "Feature request",
    );
    expect(feedbackTypeDisplayName(FeedbackType.support)).toBe("Support");
  });

  it("featureRequest alias matches feature", () => {
    expect(FeedbackType.featureRequest).toBe(FeedbackType.feature);
  });
});
