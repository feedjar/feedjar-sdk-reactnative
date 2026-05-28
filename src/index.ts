/**
 * FeedJar React Native SDK — parity with iOS FeedJarKit (`FeedJar`, `FeedJarClient`,
 * built-in feedback UI).
 */

export { FeedJar } from "./feedjar.js";
export { FeedJarErrorCode, FeedJarException, isFeedJarException } from "./feedjar-error.js";
export {
  FeedbackType,
  feedbackTypeDisplayName,
  normalizeAllowedTypes,
  type FeedbackType as FeedbackTypeValue,
} from "./models.js";
export { FeedJarFeedbackModal } from "./FeedJarFeedbackModal.js";
export type { FeedJarFeedbackModalProps } from "./FeedJarFeedbackModal.js";
