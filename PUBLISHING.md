# Publishing `@feedjar/sdk-react-native`

## Why publish fails with `EOTP`

npm accounts with **2FA enabled** reject CI publishes when the GitHub secret is a **Publish** token. Publish tokens still need a 6-digit authenticator code on every `npm publish`.

**Green CI does not mean the package shipped** — check https://www.npmjs.com/package/@feedjar/sdk-react-native for the version you expect.

---

## Recommended: npm trusted publishing (no token, no OTP in CI)

Package `0.1.0` already exists, so you can enable OIDC for this repo.

1. Open **package access settings** (logged in as a maintainer):  
   https://www.npmjs.com/package/@feedjar/sdk-react-native/access

2. Under **Trusted publishing** → **GitHub Actions**, add:
   - **Organization / user:** `feedjar`
   - **Repository:** `feedjar-sdk-reactnative`
   - **Workflow filename:** `publish.yml`
   - **Environment:** (leave empty unless you use one)

3. Save, then run the workflow:
   ```bash
   gh workflow run "Publish to npm" -R feedjar/feedjar-sdk-reactnative
   ```

4. Confirm:
   ```bash
   npm view @feedjar/sdk-react-native version
   ```

The workflow uses `id-token: write` and npm 11+ so GitHub OIDC can publish without `NPM_TOKEN`.

---

## Alternative: Automation token in GitHub

1. https://www.npmjs.com/settings/~tokens → **Generate New Token** → type **Automation** (not Publish).
2. Store it:
   ```bash
   gh secret set NPM_TOKEN -R feedjar/feedjar-sdk-reactnative
   ```
3. Re-run the publish workflow.

---

## Publish from your laptop (one-off)

```bash
cd feedjar-sdk-reactnative
npm run build
npm publish --access public --otp=123456
```

Replace `123456` with the code from your authenticator app.

Or:

```bash
./scripts/publish-local.sh
```
