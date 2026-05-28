# FeedJarKit for React Native (`@feedjar/sdk-react-native`)

TypeScript SDK aligned with **FeedJarKit iOS**: same `FeedJar` / `FeedJarClient` HTTP contract, `FeedbackType` + `featureRequest` alias, support-email validation, and a built-in feedback modal.

Uses Hermes / React Native’s built-in **`fetch`** — no native modules.

## Layout

```
feedjar-sdk-reactnative/
├── src/
│   ├── feedjar.ts              # FeedJar.configure / submit (iOS parity)
│   ├── feedjar-client.ts       # internal HTTP
│   ├── feedjar-error.ts
│   ├── models.ts               # FeedbackType
│   ├── FeedJarFeedbackModal.tsx
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Install

```bash
npm install @feedjar/sdk-react-native
```

Requires **React 18+** and **React Native 0.71+** (peer dependencies).

## Configure once at launch

```tsx
import { FeedJar } from "@feedjar/sdk-react-native";

FeedJar.configure("fjr_...");
// Optional for local API (Android-style override):
// FeedJar.defaultApiBaseUrl = "http://10.0.2.2:4000";
```

Production ingest host defaults to `https://api.feedjar.in` (same as iOS).

## Built-in feedback UI

```tsx
import { useState } from "react";
import {
  FeedJarFeedbackModal,
  FeedbackType,
} from "@feedjar/sdk-react-native";

export function App() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <Button title="Send feedback" onPress={() => setShowFeedback(true)} />
      <FeedJarFeedbackModal
        visible={showFeedback}
        onDismiss={() => setShowFeedback(false)}
        allowedTypes={[FeedbackType.feedback, FeedbackType.featureRequest]}
      />
    </>
  );
}
```

Pass `allowedTypes` (order = segment order), optional `defaultType`, and `metadata` merged into the ingest payload.

## Custom UI

```tsx
import {
  FeedJar,
  FeedbackType,
  isFeedJarException,
  FeedJarErrorCode,
} from "@feedjar/sdk-react-native";

try {
  await FeedJar.submit({
    type: FeedbackType.featureRequest,
    message: "Add dark mode",
    email: "user@example.com",
    metadata: { screen: "settings", appVersion: "1.4.2" },
  });
} catch (error) {
  if (
    isFeedJarException(error) &&
    error.code === FeedJarErrorCode.validation
  ) {
    // support without valid email
  }
}
```

**Support** requests must include an email containing `@` (validated before network), matching iOS `FeedJar.submit`.

## Tests

```bash
npm test
npm run typecheck
```

## Publish to npm

1. `npm run build && npm publish --dry-run --access public`
2. `npm login`, then `npm publish --access public`
3. Or tag `v*` on GitHub with repo secret `NPM_TOKEN` (see `.github/workflows/publish.yml`).

## License

MIT
