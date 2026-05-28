/** Feedback category sent to the server (`feedback`, `feature`, `support`). */
export type FeedbackType = "feedback" | "feature" | "support";

export const FeedbackType = {
  feedback: "feedback",
  feature: "feature",
  support: "support",
  /** Alias for `feature` — matches Swift `.featureRequest`. */
  featureRequest: "feature",
} as const satisfies Record<string, FeedbackType>;

export function feedbackTypeDisplayName(type: FeedbackType): string {
  switch (type) {
    case "feedback":
      return "Feedback";
    case "feature":
      return "Feature request";
    case "support":
      return "Support";
  }
}

export function normalizeAllowedTypes(types: FeedbackType[]): FeedbackType[] {
  const seen = new Set<FeedbackType>();
  const out: FeedbackType[] = [];
  for (const t of types) {
    const value = t === FeedbackType.featureRequest ? FeedbackType.feature : t;
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out.length > 0 ? out : [FeedbackType.feedback];
}
