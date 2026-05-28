import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { FeedJar } from "./feedjar.js";
import { isFeedJarException } from "./feedjar-error.js";
import {
  FeedbackType,
  feedbackTypeDisplayName,
  normalizeAllowedTypes,
  type FeedbackType as FeedbackTypeValue,
} from "./models.js";

export type FeedJarFeedbackModalProps = {
  visible: boolean;
  onDismiss: () => void;
  /** Categories and segment order (e.g. `[FeedbackType.feedback]`). */
  allowedTypes?: FeedbackTypeValue[];
  /** Initially selected type; must appear in `allowedTypes`, or first type when omitted. */
  defaultType?: FeedbackTypeValue;
  metadata?: Record<string, unknown>;
};

/**
 * Built-in feedback UI as a modal sheet (parity with iOS `presentFeedback` /
 * `feedJarFeedbackSheet`).
 */
export function FeedJarFeedbackModal({
  visible,
  onDismiss,
  allowedTypes = [
    FeedbackType.feedback,
    FeedbackType.feature,
    FeedbackType.support,
  ],
  defaultType,
  metadata,
}: FeedJarFeedbackModalProps) {
  const types = useMemo(
    () => normalizeAllowedTypes(allowedTypes),
    [allowedTypes],
  );

  const initialIndex = useMemo(() => {
    const resolved =
      defaultType != null && types.includes(defaultType)
        ? defaultType
        : types[0];
    return Math.max(0, types.indexOf(resolved));
  }, [defaultType, types]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentType = types[selectedIndex] ?? types[0];
  const showSegments = types.length > 1;

  function resetForm() {
    setSelectedIndex(initialIndex);
    setMessage("");
    setEmail("");
    setErrorText(null);
    setLoading(false);
  }

  function handleDismiss() {
    resetForm();
    onDismiss();
  }

  async function handleSubmit() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setErrorText("Please enter a message.");
      return;
    }

    const rawEmail = email.trim();
    if (currentType === FeedbackType.support && !rawEmail.includes("@")) {
      setErrorText("Please enter your email so we can follow up.");
      return;
    }

    setErrorText(null);
    setLoading(true);

    const emailOut =
      currentType === FeedbackType.support
        ? rawEmail
        : rawEmail || undefined;

    try {
      await FeedJar.submit({
        type: currentType,
        message: trimmedMessage,
        email: emailOut,
        metadata,
      });
      setLoading(false);
      Alert.alert("Thanks!", "Your feedback has been sent.", [
        { text: "OK", onPress: handleDismiss },
      ]);
    } catch (error) {
      setLoading(false);
      const description = isFeedJarException(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";
      setErrorText(`Could not send: ${description}`);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleDismiss} hitSlop={8}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
          <Text style={styles.title}>Send feedback</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            Tell us what&apos;s on your mind. We read every message.
          </Text>

          {showSegments ? (
            <View style={styles.segmentRow}>
              {types.map((type, index) => (
                <Pressable
                  key={type}
                  style={[
                    styles.segment,
                    index === selectedIndex && styles.segmentSelected,
                  ]}
                  onPress={() => setSelectedIndex(index)}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      index === selectedIndex && styles.segmentLabelSelected,
                    ]}
                  >
                    {feedbackTypeDisplayName(type)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text style={styles.fieldLabel}>Message</Text>
          <TextInput
            style={styles.messageInput}
            multiline
            placeholder="What did you love? What broke? What should we build next?"
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>
            {currentType === FeedbackType.support
              ? "Email (required)"
              : "Email (optional)"}
          </Text>
          <TextInput
            style={styles.emailInput}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

          <Pressable
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitLabel}>Send feedback</Text>
            )}
          </Pressable>

          <Text style={styles.footnote}>Powered by FeedJar</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  close: {
    color: "#1f3ff5",
    fontSize: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  intro: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  segmentSelected: {
    backgroundColor: "#1f3ff5",
  },
  segmentLabel: {
    fontSize: 14,
    color: "#374151",
  },
  segmentLabelSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  fieldLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  messageInput: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  emailInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  submit: {
    backgroundColor: "#1f3ff5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footnote: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },
});
