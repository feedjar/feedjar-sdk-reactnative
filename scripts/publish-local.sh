#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Building @feedjar/sdk-react-native..."
npm run build
npm test

echo "Get a 6-digit code from your authenticator app for npm (feedjar-user)."
echo "Do NOT type the placeholder YOUR_6_DIGIT_CODE."
read -r -p "npm OTP (digits only): " OTP
if [[ ! "$OTP" =~ ^[0-9]{6,8}$ ]]; then
  echo "Invalid OTP — use digits only, e.g. --otp=482913" >&2
  exit 1
fi

npm publish --access public --otp="$OTP"
echo "Published $(node -p "require('./package.json').version")"
