# FeedJarKit for React Native (`@feedjar/sdk-react-native`)

TypeScript SDK aligned with **FeedJarKit iOS** and **`@feedjar/sdk-web`**: same `POST` / `GET` `/ingest/feedback` endpoints, `fjr_` API keys, and support-email validation.

Uses Hermes / React Native’s built-in **`fetch`** — no native code or extra networking dependency.

## Layout

```
feedjar-sdk-reactnative/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    └── index.ts
```

## Install

Until published, point your app at this folder (or a monorepo workspace):

```bash
pnpm add ../feedjar-sdk-reactnative
# or: npm install file:../feedjar-sdk-reactnative
```

From the SDK folder:

```bash
npm install
npm run build
```

Metro resolves `react-native` entry to `src/index.ts` during development; production builds can use `dist/` from `npm run build`.

## Usage

```tsx
import {
  configure,
  submit,
  listFeedback,
  FeedJarError,
} from "@feedjar/sdk-react-native";
import { useEffect } from "react";

export function App() {
  useEffect(() => {
    configure("fjr_...", { baseUrl: "http://localhost:4000" }); // baseUrl optional
  }, []);

  async function send() {
    try {
      await submit({
        type: "feature",
        message: "Haptic feedback on send",
        email: "user@example.com",
      });
    } catch (e) {
      if (e instanceof FeedJarError && e.code === "validation") {
        // e.g. support without valid email
      }
    }
  }

  // …
}
```

## Defaults

- **API:** `https://api.feedjar.in`
- **Auth:** `Authorization: Bearer <key>` and `X-FeedJar-Key`

Built-in modal UI is not included (unlike iOS/Android); compose your own screen and call `submit`.

## License

MIT
