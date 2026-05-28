# Publishing `@feedjar/sdk-react-native`

## Current state

| Version | On npm? | Contents |
|---------|---------|----------|
| **0.1.0** | Yes | Old single-file SDK (7 files) |
| **0.1.1** | **No** | iOS-aligned SDK (`FeedJar`, modal, tests) |

Check: `npm view @feedjar/sdk-react-native version`

---

## Publish 0.1.1 from your Mac (fastest)

You are **already** in the right folder when your prompt ends with `feedjar-sdk-reactnative`.  
Do **not** run `cd feedjar-sdk-reactnative` again (that error is harmless).

1. Open your **authenticator app** (Google Authenticator, Authy, 1Password, etc.) for the npm account `feedjar-user`.

2. Run (replace `123456` with the **real** 6-digit code — not the words `YOUR_6_DIGIT_CODE`):

   ```bash
   npm publish --access public --otp=123456
   ```

3. Confirm:

   ```bash
   npm view @feedjar/sdk-react-native version
   # → 0.1.1
   ```

**Alternative:** run without `--otp` and complete the browser prompt (you did this for 0.1.0):

```bash
npm publish --access public
# Press ENTER when npm prints a https://www.npmjs.com/auth/cli/... URL
```

---

## Why CI still fails (`EOTP`)

The GitHub secret `NPM_6YQ7F89GT5PU9WQGP2SQSMOICNUPLP31HRZK` is a **Publish** token.  
Publish tokens **always** need OTP in GitHub Actions — they cannot complete the browser login step.

**Fix for CI (one-time):**

1. https://www.npmjs.com/settings/feedjar-user/tokens  
2. **Generate New Token** → choose **Automation** (not Publish).  
3. Copy the token once, then:

   ```bash
   gh secret set NPM_TOKEN -R feedjar/feedjar-sdk-reactnative
   # paste the npm_... token when prompted
   ```

4. Run:

   ```bash
   gh workflow run "Publish to npm" -R feedjar/feedjar-sdk-reactnative
   ```

**Or** enable **Trusted publishing** (no token):  
https://www.npmjs.com/package/@feedjar/sdk-react-native/access  
→ GitHub Actions → repo `feedjar/feedjar-sdk-reactnative`, workflow `publish.yml`

---

## Common mistakes (from recent attempts)

| Mistake | Fix |
|---------|-----|
| `--otp=YOUR_6_DIGIT_CODE` literally | Use real digits, e.g. `--otp=482913` |
| `cd feedjar-sdk-reactnative` inside that repo | Skip `cd`; you're already there |
| Green GitHub Action but still 0.1.0 on npm | Old workflow skipped publish; token still needs Automation |
| `gh secret set npm_6yQ7...` lowercase | Workflow reads `NPM_TOKEN` or `NPM_6YQ7F89GT5PU9WQGP2SQSMOICNUPLP31HRZK` (uppercase) |

---

## Helper script

```bash
./scripts/publish-local.sh
```

Prompts for OTP and publishes the version in `package.json`.
